import 'server-only'

import type { QdrantClient } from '@qdrant/qdrant-js'
import { GET_ALL_PRODUCTS_FOR_INDEX } from '@/lib/queries'
import { chunkFromShopifyProduct } from '@/lib/rag/chunk'
import { getQdrantClient } from '@/lib/rag/clients'
import {
  QDRANT_COLLECTION,
  QDRANT_DISTANCE,
  QDRANT_UPSERT_BATCH,
  QDRANT_VECTOR_SIZE,
} from '@/lib/rag/constants'
import { embedDocuments } from '@/lib/rag/embed'
import { enqueueJob, setLastReindex } from '@/lib/rag/queue'
import { withRetry } from '@/lib/rag/retry'
import type { ProductChunkMetadata } from '@/lib/rag/types'
import {
  fetchProductMetafieldsAdmin,
  getClient,
  metafieldLabel,
  parseMetaobjectGIDs,
  resolveMetaobjectLabelsBatch,
} from '@/lib/shopify'
import type { ResolvedSpec, ShopifyProduct } from '@/lib/types'

// Qdrant requires point IDs to be unsigned integers or UUIDs.
// Deterministic hash of a string handle → positive integer.
function handleToIntId(handle: string): number {
  let hash = 0
  for (let i = 0; i < handle.length; i++) {
    hash = (Math.imul(31, hash) + handle.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

async function ensureCollection(client: QdrantClient): Promise<void> {
  const exists = await client.collectionExists(QDRANT_COLLECTION)
  if (!exists) {
    await client.createCollection(QDRANT_COLLECTION, {
      vectors: {
        size: QDRANT_VECTOR_SIZE,
        distance: QDRANT_DISTANCE as 'Cosine',
      },
      quantization_config: {
        scalar: { quantile: 0.99, ratio: 0.8 },
      },
    })
    await client.createPayloadIndex(QDRANT_COLLECTION, {
      field_name: 'handle',
      field_schema: 'keyword',
    })
  }
}

async function upsertBatchWithRetry(
  client: QdrantClient,
  items: Array<{ id: number; vector: number[]; payload: Record<string, unknown> }>
): Promise<void> {
  await withRetry(
    async () => {
      await client.upsert(QDRANT_COLLECTION, {
        points: items.map(item => ({
          id: item.id,
          vector: item.vector,
          payload: item.payload,
        })),
      })
    },
    {
      retries: 6,
      onRetry: (err, attempt) => {
        console.warn(
          `[rag/indexer] Upsert batch failed, retrying (attempt ${attempt}): ${err instanceof Error ? err.message : String(err)}`
        )
      },
    }
  )
}

async function deleteByIds(client: QdrantClient, ids: string[]): Promise<void> {
  if (ids.length === 0) return
  const intIds = ids.map(handleToIntId)
  await withRetry(
    async () => {
      await client.delete(QDRANT_COLLECTION, {
        points: intIds,
      })
    },
    { retries: 6 }
  )
}

function buildChunksAndVectors(
  enrichedProducts: ShopifyProduct[]
): Array<{ id: number; handle: string; vector: number[]; payload: ProductChunkMetadata }> {
  return enrichedProducts.map(product => {
    const collections = product.collections?.edges.map(e => e.node.handle) ?? []
    const chunk = chunkFromShopifyProduct(product, collections)
    return {
      id: handleToIntId(chunk.id),
      handle: chunk.id,
      vector: [] as number[], // filled by caller
      payload: chunk.metadata,
    }
  })
}

export async function reindexAll(options: { fresh?: boolean } = {}): Promise<{
  indexed: number
  failed: number
  durationMs: number
}> {
  const start = Date.now()
  const client = getQdrantClient()

  await ensureCollection(client)

  if (options.fresh) {
    try {
      await client.deleteCollection(QDRANT_COLLECTION)
    } catch {
      // collection may not exist yet, ignore
    }
    await client.createCollection(QDRANT_COLLECTION, {
      vectors: {
        size: QDRANT_VECTOR_SIZE,
        distance: QDRANT_DISTANCE as 'Cosine',
      },
      quantization_config: {
        scalar: { quantile: 0.99, ratio: 0.8 },
      },
    })
  } else {
    await ensureCollection(client)
  }

  const shopify = getClient()
  const allProducts: ShopifyProduct[] = []
  let cursor: string | undefined
  let hasNextPage = true

  while (hasNextPage) {
    const { data } = await shopify.request<{
      products: {
        edges: { cursor: string; node: ShopifyProduct }[]
        pageInfo: { hasNextPage: boolean; endCursor: string }
      }
    }>(GET_ALL_PRODUCTS_FOR_INDEX, {
      variables: { first: 100, cursor },
    })

    const products = data?.products.edges.map(e => e.node) ?? []
    allProducts.push(...products)
    hasNextPage = data?.products.pageInfo.hasNextPage ?? false
    cursor = data?.products.pageInfo.endCursor
  }

  // Batch metafield resolution: fetch all metafields in parallel, then resolve all GIDs in one query
  const allRawMetafields = await Promise.all(
    allProducts.map(product => fetchProductMetafieldsAdmin(product.id))
  )

  const allGids: string[] = []
  for (const rawMfs of allRawMetafields) {
    for (const mf of rawMfs) {
      if (mf.type === 'list.metaobject_reference' || mf.type === 'metaobject_reference') {
        for (const gid of parseMetaobjectGIDs(mf.value)) {
          if (!allGids.includes(gid)) allGids.push(gid)
        }
      }
    }
  }

  const resolvedLabels = await resolveMetaobjectLabelsBatch(allGids)

  const FEATURES_KEY = 'shopify.vehicle-features'

  const enrichedProducts: ShopifyProduct[] = allProducts.map((product, i) => {
    const rawMfs = allRawMetafields[i]
    const specFields = rawMfs.filter(mf => `${mf.namespace}.${mf.key}` !== FEATURES_KEY)
    const featuresMf = rawMfs.find(mf => `${mf.namespace}.${mf.key}` === FEATURES_KEY) ?? null

    const resolvedSpecs: ResolvedSpec[] = []
    for (const mf of specFields) {
      let value: string | null = null
      if (mf.type === 'list.metaobject_reference') {
        const labels = parseMetaobjectGIDs(mf.value)
          .map(gid => resolvedLabels.get(gid))
          .filter((v): v is string => Boolean(v))
        value = labels.join(', ') || null
      } else if (mf.type === 'metaobject_reference') {
        const gid = parseMetaobjectGIDs(mf.value)[0]
        value = gid ? (resolvedLabels.get(gid) ?? null) : null
      } else {
        value = mf.value || null
      }
      if (!value) continue
      resolvedSpecs.push({
        namespace: mf.namespace,
        key: mf.key,
        label: metafieldLabel(mf),
        value,
      } satisfies ResolvedSpec)
    }

    const resolvedFeatures = featuresMf
      ? parseMetaobjectGIDs(featuresMf.value)
          .map(gid => resolvedLabels.get(gid))
          .filter((v): v is string => Boolean(v))
      : []

    const getResolved = (ns: string, key: string) =>
      resolvedSpecs.find(s => s.namespace === ns && s.key === key)?.value ?? null

    return {
      ...product,
      resolvedSpecs,
      resolvedFeatures,
      year: getResolved('custom', 'model_year')
        ? { value: getResolved('custom', 'model_year')!, type: 'number_integer' }
        : null,
      transmission: {
        value: getResolved('shopify', 'transmission-type'),
        type: 'list.metaobject_reference',
      },
      condition: {
        value: getResolved('shopify', 'item-condition'),
        type: 'list.metaobject_reference',
      },
      fuelType: { value: getResolved('shopify', 'fuel-supply'), type: 'list.metaobject_reference' },
      driveType: { value: getResolved('shopify', 'drive-type'), type: 'list.metaobject_reference' },
      vehicleFeatures:
        resolvedFeatures.length > 0
          ? { value: resolvedFeatures.join(','), type: featuresMf?.type ?? null }
          : null,
    }
  })

  const chunks = buildChunksAndVectors(enrichedProducts)
  const texts = enrichedProducts.map((product, i) => {
    const collections = product.collections?.edges.map(e => e.node.handle) ?? []
    return chunkFromShopifyProduct(product, collections).text
  })

  const vectors = await embedDocuments(texts)

  let indexed = 0
  let failed = 0

  for (let i = 0; i < chunks.length; i += QDRANT_UPSERT_BATCH) {
    const batch = chunks.slice(i, i + QDRANT_UPSERT_BATCH)
    const vectorSlice = vectors.slice(i, i + QDRANT_UPSERT_BATCH)
    try {
      await upsertBatchWithRetry(
        client,
        batch.map((item, j) => ({
          id: item.id,
          vector: vectorSlice[j],
          payload: item.payload as Record<string, unknown>,
        }))
      )
      indexed += batch.length
    } catch (err) {
      failed += batch.length
      console.error(
        `[rag/indexer] Batch upsert failed after retries: ${err instanceof Error ? err.message : String(err)}`
      )
    }
  }

  await setLastReindex(Date.now())

  return { indexed, failed, durationMs: Date.now() - start }
}

export async function reindexHandles(handles: string[]): Promise<{
  indexed: number
  failed: number
  deleted: number
  durationMs: number
}> {
  const start = Date.now()
  const client = getQdrantClient()

  await ensureCollection(client)

  const shopify = getClient()
  const handleSet = new Set(handles)

  // Fetch all products and filter client-side (Shopify doesn't support multi-handle queries)
  const allProducts: ShopifyProduct[] = []
  let cursor: string | undefined
  let hasNextPage = true

  while (hasNextPage) {
    const { data } = await shopify.request<{
      products: {
        edges: { cursor: string; node: ShopifyProduct }[]
        pageInfo: { hasNextPage: boolean; endCursor: string }
      }
    }>(GET_ALL_PRODUCTS_FOR_INDEX, {
      variables: { first: 100, cursor },
    })

    const products = data?.products.edges.map(e => e.node) ?? []
    allProducts.push(...products)
    hasNextPage = data?.products.pageInfo.hasNextPage ?? false
    cursor = data?.products.pageInfo.endCursor
  }

  const matchingProducts = allProducts.filter(p => handleSet.has(p.handle))
  const foundHandles = new Set(matchingProducts.map(p => p.handle))

  // Products in Shopify that are NOT in our handles list were deleted
  const missingHandles = handles.filter(h => !foundHandles.has(h))

  if (missingHandles.length > 0) {
    await deleteByIds(client, missingHandles)
  }

  if (matchingProducts.length === 0) {
    await setLastReindex(Date.now())
    return { indexed: 0, failed: 0, deleted: missingHandles.length, durationMs: Date.now() - start }
  }

  // Batch metafield resolution: same pattern as reindexAll
  const matchingRawMetafields = await Promise.all(
    matchingProducts.map(product => fetchProductMetafieldsAdmin(product.id))
  )

  const matchingGids: string[] = []
  for (const rawMfs of matchingRawMetafields) {
    for (const mf of rawMfs) {
      if (mf.type === 'list.metaobject_reference' || mf.type === 'metaobject_reference') {
        for (const gid of parseMetaobjectGIDs(mf.value)) {
          if (!matchingGids.includes(gid)) matchingGids.push(gid)
        }
      }
    }
  }

  const matchingResolvedLabels = await resolveMetaobjectLabelsBatch(matchingGids)

  const FEATURES_KEY = 'shopify.vehicle-features'

  const enrichedProducts: ShopifyProduct[] = matchingProducts.map((product, i) => {
    const rawMfs = matchingRawMetafields[i]
    const specFields = rawMfs.filter(mf => `${mf.namespace}.${mf.key}` !== FEATURES_KEY)
    const featuresMf = rawMfs.find(mf => `${mf.namespace}.${mf.key}` === FEATURES_KEY) ?? null

    const resolvedSpecs: ResolvedSpec[] = []
    for (const mf of specFields) {
      let value: string | null = null
      if (mf.type === 'list.metaobject_reference') {
        const labels = parseMetaobjectGIDs(mf.value)
          .map(gid => matchingResolvedLabels.get(gid))
          .filter((v): v is string => Boolean(v))
        value = labels.join(', ') || null
      } else if (mf.type === 'metaobject_reference') {
        const gid = parseMetaobjectGIDs(mf.value)[0]
        value = gid ? (matchingResolvedLabels.get(gid) ?? null) : null
      } else {
        value = mf.value || null
      }
      if (!value) continue
      resolvedSpecs.push({
        namespace: mf.namespace,
        key: mf.key,
        label: metafieldLabel(mf),
        value,
      } satisfies ResolvedSpec)
    }

    const resolvedFeatures = featuresMf
      ? parseMetaobjectGIDs(featuresMf.value)
          .map(gid => matchingResolvedLabels.get(gid))
          .filter((v): v is string => Boolean(v))
      : []

    const getResolved = (ns: string, key: string) =>
      resolvedSpecs.find(s => s.namespace === ns && s.key === key)?.value ?? null

    return {
      ...product,
      resolvedSpecs,
      resolvedFeatures,
      year: getResolved('custom', 'model_year')
        ? { value: getResolved('custom', 'model_year')!, type: 'number_integer' }
        : null,
      transmission: {
        value: getResolved('shopify', 'transmission-type'),
        type: 'list.metaobject_reference',
      },
      condition: {
        value: getResolved('shopify', 'item-condition'),
        type: 'list.metaobject_reference',
      },
      fuelType: { value: getResolved('shopify', 'fuel-supply'), type: 'list.metaobject_reference' },
      driveType: { value: getResolved('shopify', 'drive-type'), type: 'list.metaobject_reference' },
      vehicleFeatures:
        resolvedFeatures.length > 0
          ? { value: resolvedFeatures.join(','), type: featuresMf?.type ?? null }
          : null,
    }
  })

  const chunks = buildChunksAndVectors(enrichedProducts)
  const texts = enrichedProducts.map(product => {
    const collections = product.collections?.edges.map(e => e.node.handle) ?? []
    return chunkFromShopifyProduct(product, collections).text
  })

  const vectors = await embedDocuments(texts)

  let indexed = 0
  let failed = 0

  for (let i = 0; i < chunks.length; i += QDRANT_UPSERT_BATCH) {
    const batch = chunks.slice(i, i + QDRANT_UPSERT_BATCH)
    const vectorSlice = vectors.slice(i, i + QDRANT_UPSERT_BATCH)
    try {
      await upsertBatchWithRetry(
        client,
        batch.map((item, j) => ({
          id: item.id,
          vector: vectorSlice[j],
          payload: item.payload as Record<string, unknown>,
        }))
      )
      indexed += batch.length
    } catch (err) {
      failed += batch.length
      console.error(
        `[rag/indexer] Incremental batch upsert failed: ${err instanceof Error ? err.message : String(err)}`
      )
    }
  }

  await setLastReindex(Date.now())

  return { indexed, failed, deleted: missingHandles.length, durationMs: Date.now() - start }
}

export async function deleteFromIndex(handles: string[]): Promise<void> {
  const client = getQdrantClient()
  await deleteByIds(client, handles)
}

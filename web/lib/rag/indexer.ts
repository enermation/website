import 'server-only'

import type { QdrantClient } from '@qdrant/qdrant-js'
import { GET_ALL_PRODUCTS_FOR_INDEX } from '@/lib/queries'
import { chunkFromShopifyProduct } from '@/lib/rag/chunk'
import { getQdrantClient } from '@/lib/rag/clients'
import {
  QDRANT_COLLECTION,
  QDRANT_DENSE_VECTOR,
  QDRANT_DISTANCE,
  QDRANT_SPARSE_VECTOR,
  QDRANT_UPSERT_BATCH,
  QDRANT_VECTOR_SIZE,
} from '@/lib/rag/constants'
import { embedDocuments } from '@/lib/rag/embed'
import { setLastReindex } from '@/lib/rag/queue'
import { withRetry } from '@/lib/rag/retry'
import { toSparseVector } from '@/lib/rag/tokenizer'
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

const PAYLOAD_INDEXES: Array<{ field_name: string; field_schema: string }> = [
  { field_name: 'handle', field_schema: 'keyword' },
  { field_name: 'make', field_schema: 'keyword' },
  { field_name: 'model', field_schema: 'keyword' },
  { field_name: 'year', field_schema: 'keyword' },
  { field_name: 'fuelType', field_schema: 'keyword' },
  { field_name: 'transmission', field_schema: 'keyword' },
  { field_name: 'condition', field_schema: 'keyword' },
  { field_name: 'driveType', field_schema: 'keyword' },
  { field_name: 'available', field_schema: 'bool' },
  { field_name: 'priceAmount', field_schema: 'float' },
]

async function createFreshCollection(client: QdrantClient): Promise<void> {
  await client.createCollection(QDRANT_COLLECTION, {
    vectors: {
      [QDRANT_DENSE_VECTOR]: {
        size: QDRANT_VECTOR_SIZE,
        distance: QDRANT_DISTANCE as 'Cosine',
      },
    },
    sparse_vectors: {
      [QDRANT_SPARSE_VECTOR]: {
        index: { on_disk: false },
      },
    },
    quantization_config: {
      scalar: { type: 'int8', quantile: 0.99 },
    },
  })
  await Promise.all(
    PAYLOAD_INDEXES.map(({ field_name, field_schema }) =>
      client.createPayloadIndex(QDRANT_COLLECTION, { field_name, field_schema } as Parameters<
        QdrantClient['createPayloadIndex']
      >[1])
    )
  )
}

async function ensureCollection(client: QdrantClient): Promise<void> {
  const exists = await client.collectionExists(QDRANT_COLLECTION)
  if (!exists) {
    await createFreshCollection(client)
  }
}

type UpsertItem = {
  id: number
  dense: number[]
  sparse: { indices: number[]; values: number[] }
  payload: Record<string, unknown>
}

async function upsertBatchWithRetry(client: QdrantClient, items: UpsertItem[]): Promise<void> {
  await withRetry(
    async () => {
      await client.upsert(QDRANT_COLLECTION, {
        points: items.map(item => ({
          id: item.id,
          vector: {
            [QDRANT_DENSE_VECTOR]: item.dense,
            [QDRANT_SPARSE_VECTOR]: item.sparse,
          },
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
      await client.delete(QDRANT_COLLECTION, { points: intIds })
    },
    { retries: 6 }
  )
}

function buildChunks(
  enrichedProducts: ShopifyProduct[]
): Array<{ id: number; handle: string; text: string; payload: ProductChunkMetadata }> {
  return enrichedProducts.map(product => {
    const collections = product.collections?.edges.map(e => e.node.handle) ?? []
    const chunk = chunkFromShopifyProduct(product, collections)
    return {
      id: handleToIntId(chunk.id),
      handle: chunk.id,
      text: chunk.text,
      payload: chunk.metadata,
    }
  })
}

// ── Shared metafield enrichment ───────────────────────────────────────────────

const FEATURES_KEY = 'shopify.vehicle-features'

async function enrichProducts(rawProducts: ShopifyProduct[]): Promise<ShopifyProduct[]> {
  const allRawMetafields = await Promise.all(
    rawProducts.map(p => fetchProductMetafieldsAdmin(p.id))
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

  return rawProducts.map((product, i) => {
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
}

// ── Shared upsert pipeline ────────────────────────────────────────────────────

async function upsertProducts(
  client: QdrantClient,
  enrichedProducts: ShopifyProduct[],
  logPrefix: string
): Promise<{ indexed: number; failed: number }> {
  const chunks = buildChunks(enrichedProducts)
  const denseVectors = await embedDocuments(chunks.map(c => c.text))

  let indexed = 0
  let failed = 0

  for (let i = 0; i < chunks.length; i += QDRANT_UPSERT_BATCH) {
    const batchChunks = chunks.slice(i, i + QDRANT_UPSERT_BATCH)
    const batchDense = denseVectors.slice(i, i + QDRANT_UPSERT_BATCH)
    try {
      await upsertBatchWithRetry(
        client,
        batchChunks.map((chunk, j) => ({
          id: chunk.id,
          dense: batchDense[j],
          sparse: toSparseVector(chunk.text),
          payload: chunk.payload as Record<string, unknown>,
        }))
      )
      indexed += batchChunks.length
    } catch (err) {
      failed += batchChunks.length
      console.error(
        `${logPrefix} Batch upsert failed: ${err instanceof Error ? err.message : String(err)}`
      )
    }
  }

  return { indexed, failed }
}

// ── Shopify product fetcher ───────────────────────────────────────────────────

async function fetchAllShopifyProducts(): Promise<ShopifyProduct[]> {
  const shopify = getClient()
  const products: ShopifyProduct[] = []
  let cursor: string | undefined
  let hasNextPage = true

  while (hasNextPage) {
    const { data } = await shopify.request<{
      products: {
        edges: { cursor: string; node: ShopifyProduct }[]
        pageInfo: { hasNextPage: boolean; endCursor: string }
      }
    }>(GET_ALL_PRODUCTS_FOR_INDEX, { variables: { first: 100, cursor } })

    products.push(...(data?.products.edges.map(e => e.node) ?? []))
    hasNextPage = data?.products.pageInfo.hasNextPage ?? false
    cursor = data?.products.pageInfo.endCursor
  }

  return products
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function reindexAll(options: { fresh?: boolean } = {}): Promise<{
  indexed: number
  failed: number
  durationMs: number
}> {
  const start = Date.now()
  const client = getQdrantClient()

  if (options.fresh) {
    try {
      await client.deleteCollection(QDRANT_COLLECTION)
    } catch {
      /* didn't exist */
    }
    await createFreshCollection(client)
  } else {
    await ensureCollection(client)
  }

  const rawProducts = await fetchAllShopifyProducts()
  const enriched = await enrichProducts(rawProducts)
  const { indexed, failed } = await upsertProducts(client, enriched, '[rag/indexer]')

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

  const handleSet = new Set(handles)
  const allProducts = await fetchAllShopifyProducts()
  const matchingProducts = allProducts.filter(p => handleSet.has(p.handle))
  const foundHandles = new Set(matchingProducts.map(p => p.handle))
  const missingHandles = handles.filter(h => !foundHandles.has(h))

  await deleteByIds(client, missingHandles)

  if (matchingProducts.length === 0) {
    await setLastReindex(Date.now())
    return { indexed: 0, failed: 0, deleted: missingHandles.length, durationMs: Date.now() - start }
  }

  const enriched = await enrichProducts(matchingProducts)
  const { indexed, failed } = await upsertProducts(client, enriched, '[rag/indexer/incremental]')

  await setLastReindex(Date.now())
  return { indexed, failed, deleted: missingHandles.length, durationMs: Date.now() - start }
}

export async function deleteFromIndex(handles: string[]): Promise<void> {
  const client = getQdrantClient()
  await deleteByIds(client, handles)
}

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
import { UpsertError } from '@/lib/rag/errors'
import { enqueueJob, setLastReindex } from '@/lib/rag/queue'
import { withRetry } from '@/lib/rag/retry'
import type { ProductChunkMetadata } from '@/lib/rag/types'
import { getClient, resolveVehicleMetafields } from '@/lib/shopify'
import type { ShopifyProduct } from '@/lib/types'

async function ensureCollection(client: QdrantClient): Promise<void> {
  const exists = await client.collectionExists(QDRANT_COLLECTION)
  if (!exists) {
    await client.createCollection(QDRANT_COLLECTION, {
      vectors: {
        size: QDRANT_VECTOR_SIZE,
        distance: QDRANT_DISTANCE as 'Cosine',
      },
    })
  }
}

async function upsertBatchWithRetry(
  client: QdrantClient,
  items: Array<{ id: string; vector: number[]; payload: Record<string, unknown> }>
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
  await withRetry(
    async () => {
      await client.delete(QDRANT_COLLECTION, {
        points: ids,
      })
    },
    { retries: 6 }
  )
}

function buildChunksAndVectors(
  enrichedProducts: ShopifyProduct[]
): Array<{ id: string; vector: number[]; payload: ProductChunkMetadata }> {
  return enrichedProducts.map(product => {
    const collections = product.collections?.edges.map(e => e.node.handle) ?? []
    const chunk = chunkFromShopifyProduct(product, collections)
    return {
      id: chunk.id,
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

  const enrichedProducts = await Promise.all(
    allProducts.map(product => resolveVehicleMetafields(product))
  )

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

  const enrichedProducts = await Promise.all(
    matchingProducts.map(product => resolveVehicleMetafields(product))
  )

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

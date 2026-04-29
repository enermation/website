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

  const chunks = enrichedProducts.map(product => {
    const collections = product.collections?.edges.map(e => e.node.handle) ?? []
    return chunkFromShopifyProduct(product, collections)
  })

  const texts = chunks.map(c => c.text)
  const vectors = await embedDocuments(texts)

  const items = chunks.map((chunk, i) => ({
    id: chunk.id,
    vector: vectors[i],
    payload: chunk.metadata as Record<string, unknown>,
  }))

  let indexed = 0
  let failed = 0

  for (let i = 0; i < items.length; i += QDRANT_UPSERT_BATCH) {
    const batch = items.slice(i, i + QDRANT_UPSERT_BATCH)
    try {
      await client.upsert(QDRANT_COLLECTION, {
        points: batch.map(item => ({
          id: item.id,
          vector: item.vector,
          payload: item.payload,
        })),
      })
      indexed += batch.length
    } catch {
      failed += batch.length
    }
  }

  return { indexed, failed, durationMs: Date.now() - start }
}

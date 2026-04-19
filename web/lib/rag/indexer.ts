import 'server-only'

import { GET_ALL_PRODUCTS_FOR_INDEX } from '@/lib/queries'
import { chunkFromShopifyProduct } from '@/lib/rag/chunk'
import { getVectorIndex } from '@/lib/rag/clients'
import { UPSTASH_UPSERT_BATCH } from '@/lib/rag/constants'
import { embedDocuments } from '@/lib/rag/embed'
import type { ProductChunkMetadata } from '@/lib/rag/types'
import { getClient } from '@/lib/shopify'
import type { ShopifyProduct } from '@/lib/types'

export async function reindexAll(options: { fresh?: boolean } = {}): Promise<{
  upserted: number
  pages: number
}> {
  const index = getVectorIndex()

  if (options.fresh) {
    await index.reset()
  }

  const client = getClient()
  const allProducts: ShopifyProduct[] = []
  let cursor: string | undefined
  let hasNextPage = true
  let pageCount = 0

  while (hasNextPage) {
    const { data } = await client.request<{
      products: {
        edges: { cursor: string; node: ShopifyProduct }[]
        pageInfo: { hasNextPage: boolean; endCursor: string }
      }
    }>(GET_ALL_PRODUCTS_FOR_INDEX, {
      variables: { first: 100, cursor },
    })

    const products = data?.products.edges.map(e => e.node) ?? []
    allProducts.push(...products)
    pageCount++
    hasNextPage = data?.products.pageInfo.hasNextPage ?? false
    cursor = data?.products.pageInfo.endCursor
  }

  const chunks = allProducts.map(product => {
    const collections = product.collections?.edges.map(e => e.node.handle) ?? []
    return chunkFromShopifyProduct(product, collections)
  })

  const texts = chunks.map(c => c.text)
  const vectors = await embedDocuments(texts)

  const items = chunks.map((chunk, i) => ({
    id: chunk.id,
    vector: vectors[i],
    metadata: chunk.metadata,
  }))

  let upserted = 0

  for (let i = 0; i < items.length; i += UPSTASH_UPSERT_BATCH) {
    const batch = items.slice(i, i + UPSTASH_UPSERT_BATCH)
    await index.upsert(
      batch.map(item => ({
        id: item.id,
        vector: item.vector,
        metadata: item.metadata as ProductChunkMetadata,
      }))
    )
    upserted += batch.length
  }

  return { upserted, pages: pageCount }
}

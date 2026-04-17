import { createStorefrontApiClient } from '@shopify/storefront-api-client'
import { cacheLife, cacheTag } from 'next/cache'
import {
  GET_COLLECTIONS,
  GET_PRODUCT_BY_HANDLE,
  GET_PRODUCTS_IN_COLLECTION,
  GET_SHOP_INFO,
  SEARCH_PRODUCTS,
} from '@/lib/queries'
import type { ShopifyCollection, ShopifyProduct, ShopifyShopInfo } from '@/lib/types'

function getRequiredEnv(
  name: 'PUBLIC_STORE_DOMAIN' | 'PUBLIC_STOREFRONT_API_TOKEN' | 'PRIVATE_STOREFRONT_API_TOKEN'
) {
  const value = process.env[name]?.trim()

  if (!value) {
    throw new Error(`Missing required Shopify environment variable: ${name}`)
  }

  return value
}

export function getClient() {
  return createStorefrontApiClient({
    storeDomain: getRequiredEnv('PUBLIC_STORE_DOMAIN'),
    apiVersion: '2026-04',
    privateAccessToken: getRequiredEnv('PRIVATE_STOREFRONT_API_TOKEN'),
  })
}

// ── Cached data fetchers ──────────────────────────────────────────────────────

export async function fetchCollections(): Promise<ShopifyCollection[]> {
  'use cache'
  cacheLife('hours')
  cacheTag('collections')

  const { data } = await getClient().request<{
    collections: { edges: { node: ShopifyCollection }[] }
  }>(GET_COLLECTIONS)

  return data?.collections.edges.map(e => e.node) ?? []
}

export async function fetchCollectionProducts(
  handle: string,
  options: { sortKey: string; reverse?: boolean; filter?: { vendor: string }[]; first?: number }
): Promise<{
  id: string
  title: string
  description: string | null
  image: { url: string; altText: string | null } | null
  products: ShopifyProduct[]
} | null> {
  'use cache'
  cacheLife('minutes')
  cacheTag('products', `collection-${handle}`)

  const { data } = await getClient().request<{
    collection: {
      id: string
      title: string
      description: string | null
      image: { url: string; altText: string | null } | null
      products: { edges: { node: ShopifyProduct }[] }
    } | null
  }>(GET_PRODUCTS_IN_COLLECTION, { variables: { handle, ...options } })

  if (!data?.collection) return null

  const { title, description, image, products } = data?.collection ?? {}
  return data?.collection ? { id, title, description, image, products } : null
}

export async function fetchProduct(handle: string): Promise<ShopifyProduct | null> {
  'use cache'
  cacheLife('minutes')
  cacheTag('products', `product-${handle}`)

  const { data } = await getClient().request<{ product: ShopifyProduct | null }>(
    GET_PRODUCT_BY_HANDLE,
    { variables: { handle } }
  )

  return data?.product ?? null
}

export async function fetchShopInfo(): Promise<ShopifyShopInfo | null> {
  'use cache'
  cacheLife('days')
  cacheTag('shop')

  const { data } = await getClient().request<{ shop: ShopifyShopInfo | null }>(GET_SHOP_INFO)

  return data?.shop ?? null
}

// ── Search (no caching — always dynamic) ──────────────────────────────────────

export type SearchResult = {
  id: string
  title: string
  handle: string
  vendor: string
  availableForSale: boolean
  image: { url: string; altText: string | null } | null
  price: { amount: string; currencyCode: string }
}

export async function searchProducts(query: string, first = 10): Promise<SearchResult[]> {
  if (!query.trim()) return []

  const { data } = await getClient().request<{
    search: { nodes: ShopifyProduct[] }
  }>(SEARCH_PRODUCTS, { variables: { query, first } })

  return (
    data?.search.nodes.map(node => ({
      id: node.id,
      title: node.title,
      handle: node.handle,
      vendor: node.vendor,
      availableForSale: node.availableForSale,
      image: node.images.edges[0]?.node ?? null,
      price: node.priceRange.minVariantPrice,
    })) ?? []
  )
}

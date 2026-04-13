import { createStorefrontApiClient } from '@shopify/storefront-api-client'
import { cacheLife, cacheTag } from 'next/cache'
import {
  GET_COLLECTIONS,
  GET_PRODUCT_BY_HANDLE,
  GET_PRODUCTS_IN_COLLECTION,
  GET_SHOP_INFO,
} from '@/lib/queries'
import type { ShopifyCollection, ShopifyProduct, ShopifyShopInfo } from '@/lib/types'

function getRequiredEnv(name: 'SHOPIFY_STORE_DOMAIN' | 'SHOPIFY_STOREFRONT_ACCESS_TOKEN') {
  const value = process.env[name]?.trim()

  if (!value) {
    throw new Error(`Missing required Shopify environment variable: ${name}`)
  }

  return value
}

export function getClient() {
  return createStorefrontApiClient({
    storeDomain: getRequiredEnv('SHOPIFY_STORE_DOMAIN'),
    apiVersion: '2026-04',
    publicAccessToken: getRequiredEnv('SHOPIFY_STOREFRONT_ACCESS_TOKEN'),
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
): Promise<{ id: string; title: string; products: ShopifyProduct[] } | null> {
  'use cache'
  cacheLife('minutes')
  cacheTag('products', `collection-${handle}`)

  const { data } = await getClient().request<{
    collection: {
      id: string
      title: string
      products: { edges: { node: ShopifyProduct }[] }
    } | null
  }>(GET_PRODUCTS_IN_COLLECTION, { variables: { handle, ...options } })

  if (!data?.collection) return null

  return {
    id: data.collection.id,
    title: data.collection.title,
    products: data.collection.products.edges.map(e => e.node),
  }
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

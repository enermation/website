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

// ── Admin API client (for metaobject resolution) ──────────────────────────────

function getAdminClient() {
  return createStorefrontApiClient({
    storeDomain: getRequiredEnv('PUBLIC_STORE_DOMAIN', ['SHOPIFY_STORE_DOMAIN']),
    apiVersion: '2026-04',
    privateAccessToken: process.env.SHOPIFY_ADMIN_ACCESS_TOKEN ?? '',
  })
}

function getRequiredEnv(
  canonicalName: 'PUBLIC_STORE_DOMAIN' | 'PRIVATE_STOREFRONT_API_TOKEN',
  aliases: string[] = []
) {
  const candidates = [canonicalName, ...aliases]

  for (const name of candidates) {
    const value = process.env[name]?.trim()

    if (value) {
      return value
    }
  }

  const aliasText = aliases.length > 0 ? ` (also checked: ${aliases.join(', ')})` : ''
  throw new Error(`Missing required Shopify environment variable: ${canonicalName}${aliasText}`)
}

export function getClient() {
  return createStorefrontApiClient({
    storeDomain: getRequiredEnv('PUBLIC_STORE_DOMAIN', ['SHOPIFY_STORE_DOMAIN']),
    apiVersion: '2026-04',
    privateAccessToken: getRequiredEnv('PRIVATE_STOREFRONT_API_TOKEN', [
      'SHOPIFY_STOREFRONT_ACCESS_TOKEN',
      'PUBLIC_STOREFRONT_API_TOKEN',
    ]),
  })
}

// ── Metaobject resolution ─────────────────────────────────────────────────────
//
// Metafield values of type list.metaobject_reference contain JSON arrays of GIDs:
//   e.g. '["gid://shopify/Metaobject/193218642106"]'
//
// This resolver fetches the label from each referenced metaobject so we get
// human-readable strings like "Automatic" instead of raw GIDs.

type MetaobjectField = { key: string; value: string }

type Metaobject = {
  id: string
  type: string
  handle: string
  fields: MetaobjectField[]
}

function parseMetaobjectGIDs(value: string | null): string[] {
  if (!value) return []
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : []
  } catch {
    return []
  }
}

function metaobjectLabel(metaobject: Metaobject | null): string | null {
  return metaobject?.fields.find(f => f.key === 'label')?.value ?? null
}

// Resolves a list.metaobject_reference metafield value to its first label.
// Returns null if no metaobjects found or none have a label.
async function resolveMetaobjectLabel(value: string | null): Promise<string | null> {
  const gids = parseMetaobjectGIDs(value)
  if (gids.length === 0) {
    console.log('[resolveMetaobjectLabel] no GIDs, returning null')
    return null
  }

  console.log('[resolveMetaobjectLabel] fetching metaobject:', gids[0])

  const { data, errors } = await getAdminClient().request<{ metaobject: Metaobject | null }>(
    `{ metaobject(id: "${gids[0]}") { id type handle fields { key value } } }`
  )

  if (errors) {
    console.error('[resolveMetaobjectLabel] errors:', JSON.stringify(errors))
    return null
  }

  const label = metaobjectLabel(data?.metaobject ?? null)
  console.log('[resolveMetaobjectLabel] resolved label:', label)
  return label
}

// Resolves all vehicle metafields on a product. Call this after fetching a product
// to enrich it with human-readable vehicle data.
export async function resolveVehicleMetafields(product: ShopifyProduct): Promise<ShopifyProduct> {
  console.log('[resolveVehicleMetafields] product:', product.title)
  console.log('[resolveVehicleMetafields] raw transmission:', product.transmission)
  console.log('[resolveVehicleMetafields] raw condition:', product.condition)
  console.log('[resolveVehicleMetafields] raw fuelType:', product.fuelType)
  console.log('[resolveVehicleMetafields] raw driveType:', product.driveType)

  const [transmissionLabel, conditionLabel, fuelTypeLabel, driveTypeLabel] = await Promise.all([
    resolveMetaobjectLabel(product.transmission?.value ?? null),
    resolveMetaobjectLabel(product.condition?.value ?? null),
    resolveMetaobjectLabel(product.fuelType?.value ?? null),
    resolveMetaobjectLabel(product.driveType?.value ?? null),
  ])

  console.log('[resolveVehicleMetafields] resolved:', {
    transmissionLabel,
    conditionLabel,
    fuelTypeLabel,
    driveTypeLabel,
  })

  return {
    ...product,
    // These are still ShopifyMetafield-shaped for compat, but we resolve in place
    transmission: { value: transmissionLabel, type: product.transmission?.type ?? null },
    condition: { value: conditionLabel, type: product.condition?.type ?? null },
    fuelType: { value: fuelTypeLabel, type: product.fuelType?.type ?? null },
    driveType: { value: driveTypeLabel, type: product.driveType?.type ?? null },
  }
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
  options?: { sortKey?: string; reverse?: boolean; filter?: { vendor: string }[]; first?: number }
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

  const { title, description, image, products } = data.collection

  const resolved = await Promise.all(products.edges.map(e => resolveVehicleMetafields(e.node)))

  return {
    id: data.collection.id,
    title,
    description,
    image,
    products: resolved,
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

  if (!data?.product) return null

  return resolveVehicleMetafields(data.product)
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

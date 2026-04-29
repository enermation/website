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

// ── Admin API (for metafield + metaobject resolution) ─────────────────────────
//
// The Storefront API lacks `unauthenticated_read_metafields` scope in the
// Headless channel, so metafields are fetched server-side via the Admin API.

async function adminGraphQL<T>(query: string): Promise<{ data: T | null }> {
  const domain = process.env.PUBLIC_STORE_DOMAIN ?? process.env.SHOPIFY_ADMIN_STORE_DOMAIN ?? ''
  const token = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN ?? ''
  const res = await fetch(`https://${domain}/admin/api/2026-04/graphql.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token },
    body: JSON.stringify({ query }),
  })
  return res.json() as Promise<{ data: T | null }>
}

type RawMetafield = { namespace: string; key: string; value: string; type: string }

async function fetchProductMetafieldsAdmin(productId: string): Promise<RawMetafield[]> {
  const { data } = await adminGraphQL<{
    product: { metafields: { edges: { node: RawMetafield }[] } } | null
  }>(
    `{ product(id: "${productId}") { metafields(first: 20) { edges { node { namespace key value type } } } } }`
  )
  return data?.product?.metafields?.edges.map(e => e.node) ?? []
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

async function resolveMetaobjectLabel(value: string | null): Promise<string | null> {
  const gids = parseMetaobjectGIDs(value)
  if (gids.length === 0) return null
  const { data } = await adminGraphQL<{ metaobject: Metaobject | null }>(
    `{ metaobject(id: "${gids[0]}") { id type handle fields { key value } } }`
  )
  return metaobjectLabel(data?.metaobject ?? null)
}

// Fetches vehicle metafields via Admin API (Storefront API lacks the required
// unauthenticated_read_metafields scope in the Headless channel), then resolves
// list.metaobject_reference GIDs to human-readable labels.
export async function resolveVehicleMetafields(product: ShopifyProduct): Promise<ShopifyProduct> {
  const raw = await fetchProductMetafieldsAdmin(product.id)
  const get = (ns: string, key: string) =>
    raw.find(m => m.namespace === ns && m.key === key) ?? null

  const yearMf = get('custom', 'model_year')
  const transmissionMf = get('shopify', 'transmission-type')
  const conditionMf = get('shopify', 'item-condition')
  const fuelTypeMf = get('shopify', 'fuel-supply')
  const driveTypeMf = get('shopify', 'drive-type')

  const [transmissionLabel, conditionLabel, fuelTypeLabel, driveTypeLabel] = await Promise.all([
    resolveMetaobjectLabel(transmissionMf?.value ?? null),
    resolveMetaobjectLabel(conditionMf?.value ?? null),
    resolveMetaobjectLabel(fuelTypeMf?.value ?? null),
    resolveMetaobjectLabel(driveTypeMf?.value ?? null),
  ])

  return {
    ...product,
    year: yearMf ? { value: yearMf.value, type: yearMf.type } : null,
    transmission: { value: transmissionLabel, type: transmissionMf?.type ?? null },
    condition: { value: conditionLabel, type: conditionMf?.type ?? null },
    fuelType: { value: fuelTypeLabel, type: fuelTypeMf?.type ?? null },
    driveType: { value: driveTypeLabel, type: driveTypeMf?.type ?? null },
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

import { createStorefrontApiClient } from '@shopify/storefront-api-client'
import { cacheLife, cacheTag } from 'next/cache'
import {
  GET_ARTICLE_BY_HANDLE,
  GET_BLOG_BY_HANDLE,
  GET_COLLECTION_BY_HANDLE_ADMIN,
  GET_COLLECTIONS,
  GET_PRODUCT_BY_HANDLE,
  GET_PRODUCTS_ADMIN,
  GET_PRODUCTS_IN_COLLECTION,
  GET_SHOP_INFO,
  RESOLVE_METAOBJECTS_BATCH,
  SEARCH_PRODUCTS,
} from '@/lib/queries'
import type {
  ResolvedSpec,
  ShopifyArticle,
  ShopifyBlog,
  ShopifyCollection,
  ShopifyProduct,
  ShopifyShopInfo,
} from '@/lib/types'

// ── Admin API (for metafield + metaobject resolution) ─────────────────────────
//
// The Storefront API lacks `unauthenticated_read_metafields` scope in the
// Headless channel, so metafields are fetched server-side via the Admin API.

export async function adminGraphQL<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<{ data: T | null }> {
  const domain = process.env.PUBLIC_STORE_DOMAIN ?? process.env.SHOPIFY_ADMIN_STORE_DOMAIN ?? ''
  const token = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN ?? ''
  const res = await fetch(`https://${domain}/admin/api/2026-04/graphql.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token },
    body: JSON.stringify({ query, ...(variables ? { variables } : {}) }),
  })
  return res.json() as Promise<{ data: T | null }>
}

type RawMetafield = {
  namespace: string
  key: string
  value: string
  type: string
  definition: { name: string } | null
}

async function fetchProductMetafieldsAdmin(productId: string): Promise<RawMetafield[]> {
  const { data } = await adminGraphQL<{
    product: { metafields: { edges: { node: RawMetafield }[] } } | null
  }>(
    `{ product(id: "${productId}") { metafields(first: 50) { edges { node { namespace key value type definition { name } } } } } }`
  )
  return data?.product?.metafields?.edges.map(e => e.node) ?? []
}

function metafieldLabel(mf: RawMetafield): string {
  if (mf.definition?.name) return mf.definition.name
  return mf.key.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
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

async function resolveAllMetaobjectLabels(value: string | null): Promise<string[]> {
  const gids = parseMetaobjectGIDs(value)
  if (gids.length === 0) return []
  const results = await Promise.all(
    gids.map(async gid => {
      const { data } = await adminGraphQL<{ metaobject: Metaobject | null }>(
        `{ metaobject(id: "${gid}") { id type handle fields { key value } } }`
      )
      return metaobjectLabel(data?.metaobject ?? null)
    })
  )
  return results.filter((l): l is string => l !== null)
}

// Fetches ALL product metafields via Admin API and resolves them dynamically.
// - list.metaobject_reference / metaobject_reference → resolved to labels via Admin API
// - All other types → raw value used directly
// - vehicle-features is separated into resolvedFeatures (not a spec row)
// Adding new metafields in Shopify automatically surfaces them here.
export async function resolveVehicleMetafields(product: ShopifyProduct): Promise<ShopifyProduct> {
  const raw = await fetchProductMetafieldsAdmin(product.id)

  const FEATURES_KEY = 'shopify.vehicle-features'
  const specFields = raw.filter(mf => `${mf.namespace}.${mf.key}` !== FEATURES_KEY)
  const featuresMf = raw.find(mf => `${mf.namespace}.${mf.key}` === FEATURES_KEY) ?? null

  const resolvedSpecsRaw = await Promise.all(
    specFields.map(async mf => {
      let value: string | null = null
      if (mf.type === 'list.metaobject_reference') {
        const labels = await resolveAllMetaobjectLabels(mf.value)
        value = labels.join(', ') || null
      } else if (mf.type === 'metaobject_reference') {
        value = await resolveMetaobjectLabel(mf.value)
      } else {
        value = mf.value || null
      }
      if (!value) return null
      return {
        namespace: mf.namespace,
        key: mf.key,
        label: metafieldLabel(mf),
        value,
      } satisfies ResolvedSpec
    })
  )

  const resolvedSpecs = resolvedSpecsRaw.filter((s): s is ResolvedSpec => s !== null)
  const resolvedFeatures = await resolveAllMetaobjectLabels(featuresMf?.value ?? null)

  const getResolved = (ns: string, key: string) =>
    resolvedSpecs.find(s => s.namespace === ns && s.key === key)?.value ?? null

  return {
    ...product,
    resolvedSpecs,
    resolvedFeatures,
    // Named fields kept for RAG chunk compatibility
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
}

// ── Admin API: Batch metaobject resolution ──────────────────────────────────────
//
// Replaces per-GID metaobject(id: ...) calls with a single nodes(ids: [...]) query.
// For N metaobject fields across M products, this reduces N*M HTTP requests to 1.

type MetaobjectNode = {
  id: string
  type: string
  handle: string
  fields: { key: string; value: string }[]
}

export async function resolveMetaobjectLabelsBatch(gids: string[]): Promise<Map<string, string>> {
  const uniqueGids = [...new Set(gids)]
  if (uniqueGids.length === 0) return new Map()

  const { data } = await adminGraphQL<{ nodes: (MetaobjectNode | null)[] }>(
    RESOLVE_METAOBJECTS_BATCH,
    { ids: uniqueGids }
  )

  const map = new Map<string, string>()
  for (const node of data?.nodes ?? []) {
    if (!node) continue
    const label = node.fields.find(f => f.key === 'label')?.value ?? node.handle
    map.set(node.id, label)
  }
  return map
}

// ── Admin API: Collection products ──────────────────────────────────────────────
//
// Fetches all products in a collection via Admin API with all vehicle metafields
// inlined in a single query — no per-product metafield calls needed.

// Raw product shape returned by GET_PRODUCTS_ADMIN (Admin API) with aliased metafields
type RawAdminProductMetafield = { value: string | null }
type RawAdminProduct = {
  id: string
  title: string
  handle: string
  vendor: string
  description?: string
  createdAt?: string
  tags?: string[]
  images: {
    edges: { node: { url: string; altText: string | null; width?: number; height?: number } }[]
  }
  priceRange: {
    minVariantPrice: { amount: string; currencyCode: string }
    maxVariantPrice?: { amount: string; currencyCode: string }
  }
  // Aliased metafield responses from Admin API
  vehicle_make: RawAdminProductMetafield | null
  vehicle_model: RawAdminProductMetafield | null
  vehicle_year: RawAdminProductMetafield | null
  vehicle_mileage: RawAdminProductMetafield | null
  vehicle_colour: RawAdminProductMetafield | null
  vehicle_fuel_type: RawAdminProductMetafield | null
  vehicle_transmission: RawAdminProductMetafield | null
  vehicle_origin_country: RawAdminProductMetafield | null
  vehicle_condition: RawAdminProductMetafield | null
  vehicle_engine: RawAdminProductMetafield | null
  shopify_transmission_type: { value: string | null; type?: string | null } | null
  shopify_item_condition: { value: string | null; type?: string | null } | null
  shopify_fuel_supply: { value: string | null; type?: string | null } | null
  shopify_drive_type: { value: string | null; type?: string | null } | null
  shopify_vehicle_features: { value: string | null; type?: string | null } | null
}

function buildProductFromRawAdmin(
  node: RawAdminProduct,
  resolvedSpecs: ResolvedSpec[],
  resolvedFeatures: string[]
): ShopifyProduct {
  // Helper to get a raw vehicle text metafield value
  const getVehicleText = (field: RawAdminProductMetafield | null): string => {
    return field?.value ?? ''
  }

  // Helper to resolve a shopify.* metaobject field from resolvedSpecs
  const getShopifyResolved = (key: string): string | null => {
    return resolvedSpecs.find(s => s.namespace === 'shopify' && s.key === key)?.value ?? null
  }

  return {
    id: node.id,
    title: node.title,
    handle: node.handle,
    vendor: node.vendor,
    description: node.description ?? '',
    availableForSale: true, // Admin API doesn't expose this; assume available
    createdAt: node.createdAt,
    tags: node.tags,
    images: node.images,
    priceRange: node.priceRange,
    variants: { edges: [] }, // Admin API doesn't expose variants on the product connection
    resolvedSpecs,
    resolvedFeatures,
    // Inlined vehicle fields from actual metafields
    make: { value: getVehicleText(node.vehicle_make) || null, type: 'single_line_text_field' },
    model: { value: getVehicleText(node.vehicle_model) || null, type: 'single_line_text_field' },
    year: { value: getVehicleText(node.vehicle_year) || null, type: 'number_integer' },
    mileage: {
      value: getVehicleText(node.vehicle_mileage) || null,
      type: 'single_line_text_field',
    },
    colour: { value: getVehicleText(node.vehicle_colour) || null, type: 'single_line_text_field' },
    fuelType: {
      value: (getShopifyResolved('fuel-supply') ?? getVehicleText(node.vehicle_fuel_type)) || null,
      type: 'list.metaobject_reference',
    },
    transmission: {
      value:
        (getShopifyResolved('transmission-type') ?? getVehicleText(node.vehicle_transmission)) ||
        null,
      type: 'list.metaobject_reference',
    },
    condition: {
      value:
        (getShopifyResolved('item-condition') ?? getVehicleText(node.vehicle_condition)) || null,
      type: 'list.metaobject_reference',
    },
    driveType: {
      value: getShopifyResolved('drive-type') || null,
      type: 'list.metaobject_reference',
    },
    originCountry: {
      value: getVehicleText(node.vehicle_origin_country) || null,
      type: 'single_line_text_field',
    },
    engine: { value: getVehicleText(node.vehicle_engine) || null, type: 'single_line_text_field' },
    vehicleFeatures:
      resolvedFeatures.length > 0
        ? { value: resolvedFeatures.join(','), type: 'list.metaobject_reference' }
        : null,
  }
}

export async function fetchCollectionByHandleAdmin(handle: string) {
  'use cache'
  cacheLife('hours')
  cacheTag('collections')

  const { data } = await adminGraphQL<{
    collectionByHandle: {
      id: string
      title: string
      description: string | null
      image: { url: string; altText: string | null } | null
    } | null
  }>(GET_COLLECTION_BY_HANDLE_ADMIN, { handle })

  const node = data?.collectionByHandle
  if (!node) return null
  return { id: node.id, title: node.title, description: node.description, image: node.image }
}

export async function fetchCollectionProductsAdmin(
  handle: string,
  options?: {
    sortKey?: string
    reverse?: boolean
    first?: number
  }
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

  const collection = await fetchCollectionByHandleAdmin(handle)
  if (!collection) return null

  const { data } = await adminGraphQL<{
    collection: {
      title: string
      description: string | null
      image: { url: string; altText: string | null } | null
      products: {
        pageInfo: { hasNextPage: boolean; endCursor: string }
        edges: { node: RawAdminProduct }[]
      }
    } | null
  }>(GET_PRODUCTS_ADMIN, {
    collectionId: collection.id,
    first: options?.first ?? 250,
    sortKey: options?.sortKey ?? 'CREATED',
    reverse: options?.reverse ?? true,
  })

  if (!data?.collection) return null

  // Collect all metaobject GIDs across all products for batch resolution
  const allGids: string[] = []
  const productGids: Map<string, string[]> = new Map()

  const shopifyMetaobjectFields = [
    'shopify_transmission_type',
    'shopify_item_condition',
    'shopify_fuel_supply',
    'shopify_drive_type',
    'shopify_vehicle_features',
  ] as const

  for (const { node } of data.collection.products.edges) {
    const gids: string[] = []
    for (const key of shopifyMetaobjectFields) {
      const mf = node[key]
      if (mf?.value) {
        try {
          const parsed = JSON.parse(mf.value) as string[]
          if (Array.isArray(parsed)) {
            for (const gid of parsed) {
              if (typeof gid === 'string') {
                gids.push(gid)
                if (!allGids.includes(gid)) allGids.push(gid)
              }
            }
          }
        } catch {
          /* skip malformed JSON */
        }
      }
    }
    productGids.set(node.id, gids)
  }

  // Batch-resolve all metaobject labels in ONE query
  const resolvedLabels = await resolveMetaobjectLabelsBatch(allGids)

  // Build resolved specs and features per product
  const products: ShopifyProduct[] = data.collection.products.edges.map(({ node }) => {
    // Build resolvedSpecs from vehicle.* text metafields
    const resolvedSpecs: ResolvedSpec[] = [
      { namespace: 'vehicle', key: 'make', label: 'Make', value: node.vehicle_make?.value ?? '' },
      {
        namespace: 'vehicle',
        key: 'model',
        label: 'Model',
        value: node.vehicle_model?.value ?? '',
      },
      { namespace: 'vehicle', key: 'year', label: 'Year', value: node.vehicle_year?.value ?? '' },
      {
        namespace: 'vehicle',
        key: 'mileage',
        label: 'Mileage',
        value: node.vehicle_mileage?.value ?? '',
      },
      {
        namespace: 'vehicle',
        key: 'colour',
        label: 'Colour',
        value: node.vehicle_colour?.value ?? '',
      },
      {
        namespace: 'vehicle',
        key: 'fuel_type',
        label: 'Fuel Type',
        value: node.vehicle_fuel_type?.value ?? '',
      },
      {
        namespace: 'vehicle',
        key: 'transmission',
        label: 'Transmission',
        value: node.vehicle_transmission?.value ?? '',
      },
      {
        namespace: 'vehicle',
        key: 'origin_country',
        label: 'Origin Country',
        value: node.vehicle_origin_country?.value ?? '',
      },
      {
        namespace: 'vehicle',
        key: 'condition',
        label: 'Condition',
        value: node.vehicle_condition?.value ?? '',
      },
      {
        namespace: 'vehicle',
        key: 'engine',
        label: 'Engine',
        value: node.vehicle_engine?.value ?? '',
      },
    ].filter(s => s.value)

    // Resolve shopify.* metaobject fields and merge into resolvedSpecs
    type ShopifyMetaobjectField = { value: string | null; type?: string | null } | null
    const shopifyFields: [string, ShopifyMetaobjectField, string][] = [
      ['transmission-type', node.shopify_transmission_type, 'Transmission'],
      ['item-condition', node.shopify_item_condition, 'Condition'],
      ['fuel-supply', node.shopify_fuel_supply, 'Fuel Supply'],
      ['drive-type', node.shopify_drive_type, 'Drive Type'],
    ]
    for (const [key, mf, labelKey] of shopifyFields) {
      if (mf?.value) {
        try {
          const gids = JSON.parse(mf.value) as string[]
          const labels = gids
            .map(gid => resolvedLabels.get(gid))
            .filter((v): v is string => Boolean(v))
          if (labels.length > 0) {
            resolvedSpecs.push({
              namespace: 'shopify',
              key,
              label: labelKey,
              value: labels.join(', '),
            })
          }
        } catch {
          /* skip */
        }
      }
    }

    // Resolve vehicle-features
    let resolvedFeatures: string[] = []
    if (node.shopify_vehicle_features?.value) {
      try {
        const gids = JSON.parse(node.shopify_vehicle_features.value) as string[]
        resolvedFeatures = gids
          .map(gid => resolvedLabels.get(gid))
          .filter((v): v is string => Boolean(v))
      } catch {
        /* skip */
      }
    }

    return buildProductFromRawAdmin(node, resolvedSpecs, resolvedFeatures)
  })

  return {
    id: collection.id,
    title: data.collection.title,
    description: data.collection.description,
    image: data.collection.image,
    products,
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

// ── Blog ──────────────────────────────────────────────────────────────────────

export async function fetchBlogByHandle(blogHandle: string): Promise<{
  id: string
  handle: string
  title: string
  description: string | null
  articles: ShopifyArticle[]
} | null> {
  const { data, errors } = await getClient().request<{
    blog: {
      id: string
      handle: string
      title: string
      articles: { edges: { node: ShopifyArticle }[] }
    } | null
  }>(GET_BLOG_BY_HANDLE, { variables: { handle: blogHandle } })

  if (errors) {
    console.error('[fetchBlogByHandle] GraphQL errors:', errors)
  }

  if (!data?.blog) return null

  const { id, handle, title, description, articles } = data.blog
  return {
    id,
    handle,
    title,
    description: description ?? null,
    articles: articles.edges.map(e => e.node),
  }
}

export async function fetchArticleByHandle(
  blogHandle: string,
  articleHandle: string
): Promise<ShopifyArticle | null> {
  'use cache'
  cacheLife('minutes')
  cacheTag('blog', `blog-${blogHandle}`, `article-${articleHandle}`)

  const { data } = await getClient().request<{
    blog: { articleByHandle: ShopifyArticle | null } | null
  }>(GET_ARTICLE_BY_HANDLE, { variables: { blogHandle, articleHandle } })

  return data?.blog?.articleByHandle ?? null
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

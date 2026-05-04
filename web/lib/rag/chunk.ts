import 'server-only'

import type { ProductChunkMetadata } from '@/lib/rag/types'
import type { ShopifyProduct } from '@/lib/types'
import { parseVehicleFromTitle } from '@/lib/utils'

function orDash(value: string | null | undefined): string {
  return value ?? '—'
}

// Only Shopify standard metafields get dedicated typed fields in ProductChunkMetadata.
// These have stable namespace+key combos guaranteed by Shopify's taxonomy.
// Everything else flows into `specs` dynamically under its Shopify definition label.
const SHOPIFY_STANDARD_KEYS = new Set([
  'custom.model_year',
  'shopify.fuel-supply',
  'shopify.transmission-type',
  'shopify.item-condition',
  'shopify.drive-type',
  'shopify.vehicle-features',
])

export function chunkFromShopifyProduct(
  product: ShopifyProduct,
  collectionHandles: string[]
): { id: string; text: string; metadata: ProductChunkMetadata } {
  const resolvedSpecs = product.resolvedSpecs ?? []

  const getSpec = (namespace: string, key: string) =>
    resolvedSpecs.find(s => s.namespace === namespace && s.key === key)?.value ?? null

  // Derive make/model from title — independent of metafield key naming
  const { make, model } = parseVehicleFromTitle(product.title)

  // Shopify standard vehicle metafields
  const year = getSpec('custom', 'model_year')
  const fuelType = getSpec('shopify', 'fuel-supply')
  const transmission = getSpec('shopify', 'transmission-type')
  const condition = getSpec('shopify', 'item-condition')
  const driveType = getSpec('shopify', 'drive-type')

  // Dynamic specs: ALL resolved metafields not in the Shopify standard set.
  // Keyed by stable `namespace.key` (immutable per Shopify API — namespace+key cannot change after definition creation).
  // Label is stored separately since it is mutable (can be renamed in Shopify admin).
  const specs: Record<string, { label: string; value: string }> = {}
  for (const s of resolvedSpecs) {
    if (!SHOPIFY_STANDARD_KEYS.has(`${s.namespace}.${s.key}`)) {
      specs[`${s.namespace}.${s.key}`] = { label: s.label, value: s.value }
    }
  }

  const collections = collectionHandles.length > 0 ? collectionHandles.join(', ') : '—'

  // Full text for dense embedding — every metafield label+value for max semantic coverage
  const allSpecLines = resolvedSpecs
    .filter(s => `${s.namespace}.${s.key}` !== 'shopify.vehicle-features')
    .map(s => `${s.label}: ${s.value}`)
    .join('\n')

  // Vehicle features (shopify.vehicle-features) — resolved to human-readable labels,
  // included in embedding text so queries like "sunroof" or "air conditioning" match
  const featuresLine =
    product.resolvedFeatures && product.resolvedFeatures.length > 0
      ? `Features: ${product.resolvedFeatures.join(', ')}`
      : ''

  const text = [
    `Title: ${product.title}`,
    `Vendor: ${product.vendor || '—'}`,
    `Collections: ${collections}`,
    `Make: ${orDash(make)} | Model: ${orDash(model)} | Year: ${orDash(year)}`,
    `Fuel: ${orDash(fuelType)} | Transmission: ${orDash(transmission)} | Drive: ${orDash(driveType)}`,
    `Condition: ${orDash(condition)}`,
    allSpecLines,
    featuresLine,
    `Description: ${product.description.slice(0, 1500)}`,
  ]
    .filter(line => line.trim() !== '')
    .join('\n')

  // textSnippet: dynamic specs (using display label) + description start — used in LLM prompt
  const specsText = Object.values(specs)
    .map(({ label, value }) => `${label}: ${value}`)
    .join(' | ')
  const descSnippet = product.description.replace(/\s+/g, ' ').trim().slice(0, 160)
  const textSnippet = [specsText, descSnippet].filter(Boolean).join(' — ').slice(0, 500)

  const imageUrl = product.images.edges[0]?.node.url ?? null

  const metadata: ProductChunkMetadata = {
    productId: product.id,
    handle: product.handle,
    title: product.title,
    priceAmount: product.priceRange.minVariantPrice.amount,
    priceCurrency: product.priceRange.minVariantPrice.currencyCode,
    collectionHandles,
    vendor: product.vendor || null,
    make,
    model,
    year,
    fuelType,
    transmission,
    condition,
    driveType,
    features: product.resolvedFeatures ?? [],
    specs,
    imageUrl,
    url: `/products/${product.handle}`,
    textSnippet,
    available: product.availableForSale,
  }

  return { id: product.handle, text, metadata }
}

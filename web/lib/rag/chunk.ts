import 'server-only'

import type { ProductChunkMetadata } from '@/lib/rag/types'
import type { ShopifyProduct } from '@/lib/types'
import { parseVehicleFromTitle } from '@/lib/utils'

function orDash(value: string | null | undefined): string {
  return value ?? '—'
}

// namespace.key of metafields that have a dedicated typed field in ProductChunkMetadata.
// These are excluded from the generic `specs` map to avoid duplication.
const DEDICATED_NS_KEYS = new Set([
  'custom.model_year',
  'shopify.fuel-supply',
  'shopify.transmission-type',
  'shopify.item-condition',
  'shopify.drive-type',
  'shopify.vehicle-features',
])

// Keys (namespace-agnostic) that also map to dedicated fields.
// buildProductFromRawAdmin resolves these by key only, so we match the same way.
const DEDICATED_KEY_ONLY = new Set([
  'make',
  'model',
  'mileage',
  'colour',
  'engine',
  'displacement',
  'engine_displacement',
  'origin_country',
])

export function chunkFromShopifyProduct(
  product: ShopifyProduct,
  collectionHandles: string[]
): { id: string; text: string; metadata: ProductChunkMetadata } {
  const resolvedSpecs = product.resolvedSpecs ?? []

  const getSpec = (namespace: string, key: string) =>
    resolvedSpecs.find(s => s.namespace === namespace && s.key === key)?.value ?? null

  const getSpecByKey = (key: string) => resolvedSpecs.find(s => s.key === key)?.value ?? null

  // Core vehicle identity — derived from title and metafields
  const { make: makeFromTitle, model: modelFromTitle } = parseVehicleFromTitle(product.title)
  const make = makeFromTitle ?? getSpecByKey('make')
  const model = modelFromTitle ?? getSpecByKey('model')

  // Structured/named metafields
  const year = getSpec('custom', 'model_year')
  const fuelType = getSpec('shopify', 'fuel-supply')
  const transmission = getSpec('shopify', 'transmission-type')
  const condition = getSpec('shopify', 'item-condition')
  const driveType = getSpec('shopify', 'drive-type')
  const mileage = getSpecByKey('mileage')
  const colour = getSpecByKey('colour')
  const engine = getSpecByKey('engine')
  const displacement = getSpecByKey('displacement') ?? getSpecByKey('engine_displacement')
  const originCountry = getSpecByKey('origin_country')

  // Generic specs: every resolved metafield not already captured above
  const specs: Record<string, string> = {}
  for (const s of resolvedSpecs) {
    if (!DEDICATED_NS_KEYS.has(`${s.namespace}.${s.key}`) && !DEDICATED_KEY_ONLY.has(s.key)) {
      specs[s.label] = s.value
    }
  }

  // Full spec lines for embedding text — include every resolved metafield for max semantic coverage
  const allSpecLines = resolvedSpecs
    .filter(s => `${s.namespace}.${s.key}` !== 'shopify.vehicle-features')
    .map(s => `${s.label}: ${s.value}`)
    .join('\n')

  const collections = collectionHandles.length > 0 ? collectionHandles.join(', ') : '—'

  const text = [
    `Title: ${product.title}`,
    `Vendor: ${product.vendor || '—'}`,
    `Collections: ${collections}`,
    `Make: ${orDash(make)} | Model: ${orDash(model)} | Year: ${orDash(year)}`,
    `Fuel: ${orDash(fuelType)} | Transmission: ${orDash(transmission)} | Drive: ${orDash(driveType)}`,
    `Condition: ${orDash(condition)}`,
    mileage ? `Mileage: ${mileage}` : '',
    displacement ? `Displacement: ${displacement}` : '',
    colour ? `Colour: ${colour}` : '',
    engine ? `Engine: ${engine}` : '',
    originCountry ? `Origin: ${originCountry}` : '',
    allSpecLines,
    `Description: ${product.description.slice(0, 1500)}`,
  ]
    .filter(line => line.trim() !== '')
    .join('\n')

  // textSnippet: non-dedicated specs + description start — what the LLM prompt shows
  const extraSpecsText = [
    mileage ? `Mileage: ${mileage}` : null,
    displacement ? `Displacement: ${displacement}` : null,
    colour ? `Colour: ${colour}` : null,
    engine ? `Engine: ${engine}` : null,
    originCountry ? `Origin: ${originCountry}` : null,
    driveType ? `Drive: ${driveType}` : null,
    ...Object.entries(specs).map(([k, v]) => `${k}: ${v}`),
  ]
    .filter(Boolean)
    .join(' | ')

  const descSnippet = product.description.replace(/\s+/g, ' ').trim().slice(0, 160)
  const textSnippet = [extraSpecsText, descSnippet].filter(Boolean).join(' — ').slice(0, 500)

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
    mileage,
    colour,
    engine,
    displacement,
    originCountry,
    specs,
    imageUrl,
    url: `/products/${product.handle}`,
    textSnippet,
    available: product.availableForSale,
  }

  return { id: product.handle, text, metadata }
}

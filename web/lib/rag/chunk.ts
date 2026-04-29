import 'server-only'

import type { ProductChunkMetadata } from '@/lib/rag/types'
import type { ShopifyProduct } from '@/lib/types'
import { parseVehicleFromTitle } from '@/lib/utils'

function orDash(value: string | null | undefined): string {
  return value ?? '—'
}

export function chunkFromShopifyProduct(
  product: ShopifyProduct,
  collectionHandles: string[]
): { id: string; text: string; metadata: ProductChunkMetadata } {
  const resolvedSpecs = product.resolvedSpecs ?? []
  const getSpec = (namespace: string, key: string) =>
    resolvedSpecs.find(s => s.namespace === namespace && s.key === key)?.value ?? null

  const { make: makeFromTitle, model: modelFromTitle } = parseVehicleFromTitle(product.title)
  const make = makeFromTitle
  const model = modelFromTitle

  const year = getSpec('custom', 'model_year')
  const fuelType = getSpec('shopify', 'fuel-supply')
  const transmission = getSpec('shopify', 'transmission-type')
  const condition = getSpec('shopify', 'item-condition')
  const driveType = getSpec('shopify', 'drive-type')

  // All remaining resolvedSpecs as dynamic lines (exclude vehicle-features)
  const additionalSpecLines = resolvedSpecs
    .filter(s => !['shopify.vehicle-features'].includes(`${s.namespace}.${s.key}`))
    .map(s => `${s.label}: ${s.value}`)
    .join('\n')

  const collections = collectionHandles.length > 0 ? collectionHandles.join(', ') : '—'

  const text = [
    `Title: ${product.title}`,
    `Vendor: ${product.vendor || '—'}`,
    `Collections: ${collections}`,
    `Make: ${orDash(make)} | Model: ${orDash(model)} | Year: ${orDash(year)}`,
    `Fuel: ${orDash(fuelType)} | Transmission: ${orDash(transmission)}`,
    `Condition: ${orDash(condition)}`,
    additionalSpecLines,
    `Description: ${product.description.slice(0, 1500)}`,
  ]
    .filter(line => line.trim() !== '')
    .join('\n')

  const descriptionSnippet = product.description.replace(/\s+/g, ' ').trim().slice(0, 240)

  const imageUrl = product.images.edges[0]?.node.url ?? null

  const metadata: ProductChunkMetadata = {
    productId: product.id,
    handle: product.handle,
    title: product.title,
    priceAmount: product.priceRange.minVariantPrice.amount,
    priceCurrency: product.priceRange.minVariantPrice.currencyCode,
    collectionHandles,
    vendor: product.vendor || null,
    make: makeFromTitle,
    model: modelFromTitle,
    year,
    fuelType,
    transmission,
    condition,
    driveType,
    imageUrl,
    url: `/products/${product.handle}`,
    textSnippet: descriptionSnippet,
    available: product.availableForSale,
  }

  return { id: product.handle, text, metadata }
}

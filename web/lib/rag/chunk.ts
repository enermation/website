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
  // Vehicle metafields (resolved via resolveVehicleMetafields in shopify.ts)
  // make/model are parsed from title, not stored as metafields
  // mileage, colour, originCountry, engine not set on Shopify
  const metafield = (mf: { value: string | null } | null): string | null => mf?.value ?? null

  const { make: makeFromTitle, model: modelFromTitle } = parseVehicleFromTitle(product.title)
  const make = makeFromTitle
  const model = modelFromTitle

  const collections = collectionHandles.length > 0 ? collectionHandles.join(', ') : '—'

  const text = [
    `Title: ${product.title}`,
    `Vendor: ${product.vendor || '—'}`,
    `Collections: ${collections}`,
    `Make: ${orDash(make)} | Model: ${orDash(model)} | Year: ${orDash(metafield(product.year))}`,
    `Engine: ${orDash(metafield(product.engine))} | Fuel: ${orDash(metafield(product.fuelType))} | Transmission: ${orDash(metafield(product.transmission))}`,
    `Mileage: ${orDash(metafield(product.mileage))} | Colour: ${orDash(metafield(product.colour))} | Condition: ${orDash(metafield(product.condition))}`,
    `Origin: ${orDash(metafield(product.originCountry))}`,
    `Description: ${product.description.slice(0, 1500)}`,
  ].join('\n')

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
    year: metafield(product.year),
    mileage: metafield(product.mileage),
    colour: metafield(product.colour),
    fuelType: metafield(product.fuelType),
    transmission: metafield(product.transmission),
    originCountry: metafield(product.originCountry),
    condition: metafield(product.condition),
    engine: metafield(product.engine),
    imageUrl,
    url: `/products/${product.handle}`,
    textSnippet: descriptionSnippet,
    available: product.availableForSale,
  }

  return { id: product.handle, text, metadata }
}

import { Armchair, Calendar, Gauge, Palette } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { productPage } from '@/lib/data'
import type { ShopifyProduct } from '@/lib/types'

type CarCardProps = {
  product: ShopifyProduct
}

export function CarCard({ product }: CarCardProps) {
  const image = product.images.edges[0]?.node
  const { amount, currencyCode } = product.priceRange.minVariantPrice
  const price = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currencyCode,
  }).format(parseFloat(amount))

  const firstVariant = product.variants.edges[0]?.node
  const variantTitle =
    firstVariant?.title && firstVariant.title !== 'Default Title' ? firstVariant.title : null
  const variantParts = variantTitle?.split(' / ').map(part => part.trim()) ?? []
  const variantYear = variantParts[0] && /^\d{4}$/.test(variantParts[0]) ? variantParts[0] : null
  const variantSummary = variantTitle
    ? variantParts.slice(variantYear ? 1 : 0).join(' / ') || variantTitle
    : null
  const mobileDetailCandidates = [
    variantYear,
    variantParts[1],
    variantParts[2],
    variantParts[3],
    product.vendor,
    variantSummary,
    product.availableForSale ? productPage.labels.available : productPage.labels.sold,
  ]
  const mobileDetails = Array.from(
    new Set(mobileDetailCandidates.filter((detail): detail is string => Boolean(detail)))
  ).slice(0, 4)

  return (
    <Link href={`/products/${product.handle}`} className="flex flex-col group">
      <div className="car-card-media relative h-56 overflow-hidden bg-gray-94 shrink-0 md:h-auto">
        {image && (
          <Image
            src={image.url}
            alt={image.altText ?? product.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(min-width: 1280px) 400px, (min-width: 768px) 33vw, 100vw"
          />
        )}
      </div>

      <h3 className="mt-3 px-1 font-sans text-lg font-normal leading-8 text-gray-7 md:font-display md:text-xl md:leading-snug">
        {product.title}
      </h3>

      <div className="mt-3 flex flex-col px-1 md:hidden">
        <p className="line-clamp-4 flex-1 font-body text-15 leading-7 text-gray-33">
          {product.description}
        </p>
        <p className="mt-3 font-heading text-lg font-semibold text-foreground">
          {product.availableForSale ? price : productPage.labels.reservedMoreWanted}
        </p>
      </div>

      <div className="mt-4 border-t border-gray-87 px-2 pt-3 pb-1 md:hidden">
        <div className="flex flex-col gap-3">
          {mobileDetails.map(detail => (
            <p key={detail} className="font-body text-13 font-medium text-foreground">
              {detail}
            </p>
          ))}
        </div>
      </div>

      <div className="mt-3 hidden grid-cols-2 gap-y-1 border-t border-gray-87 pt-2 md:grid">
        {product.vendor && (
          <div className="flex items-center gap-2 px-2 py-1">
            <Palette className="size-3.5 text-gray-7 shrink-0" />
            <span className="font-body font-medium text-13 text-foreground truncate">
              {product.vendor}
            </span>
          </div>
        )}
        {variantSummary && (
          <div className="flex items-center gap-2 px-2 py-1">
            <Armchair className="size-3.5 text-gray-7 shrink-0" />
            <span className="font-body font-medium text-13 text-foreground truncate">
              {variantSummary}
            </span>
          </div>
        )}
        <div className="flex items-center gap-2 px-2 py-1">
          <Gauge className="size-3.5 text-gray-7 shrink-0" />
          <span className="font-body font-medium text-13 text-foreground">
            {product.availableForSale ? productPage.labels.available : productPage.labels.sold}
          </span>
        </div>
        {variantYear && (
          <div className="flex items-center gap-2 px-2 py-1">
            <Calendar className="size-3.5 text-gray-7 shrink-0" />
            <span className="font-body font-medium text-13 text-foreground">{variantYear}</span>
          </div>
        )}
      </div>

      <div className="mt-3 hidden flex-1 flex-col px-1 pb-4 md:flex">
        <p className="font-body text-15 text-gray-33 leading-relaxed line-clamp-2 flex-1">
          {product.description}
        </p>
        <p className="font-heading font-semibold text-lg text-foreground mt-3">
          {product.availableForSale ? price : productPage.labels.reservedMoreWanted}
        </p>
      </div>
    </Link>
  )
}

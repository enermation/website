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

  return (
    <Link href={`/products/${product.handle}`} className="flex flex-col group">
      {/* Image */}
      <div className="relative aspect-[3/2] overflow-hidden bg-gray-94 shrink-0">
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

      {/* Title */}
      <h3 className="font-display font-normal text-xl text-gray-7 mt-3 px-1 leading-snug">
        {product.title}
      </h3>

      {/* Spec row */}
      <div className="grid grid-cols-2 border-t border-gray-87 mt-3 pt-2 gap-y-1">
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

      {/* Description + price */}
      <div className="flex flex-col flex-1 px-1 mt-3 pb-4">
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

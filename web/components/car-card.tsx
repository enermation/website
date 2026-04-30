import { Calendar, Cog, Fuel, ShieldCheck } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { productPage } from '@/lib/data'
import type { ShopifyProduct } from '@/lib/types'
import { cn, formatPrice } from '@/lib/utils'

type CarCardProps = {
  product: ShopifyProduct
}

export function CarCard({ product }: CarCardProps) {
  const image = product.images.edges[0]?.node
  const { amount, currencyCode } = product.priceRange.minVariantPrice
  const price = formatPrice(amount, currencyCode)

  const resolvedSpecs = product.resolvedSpecs ?? []
  const getSpec = (namespace: string, key: string) =>
    resolvedSpecs.find(s => s.namespace === namespace && s.key === key)?.value ?? null

  const year = getSpec('custom', 'model_year')
  const fuelType = getSpec('shopify', 'fuel-supply')
  const transmission = getSpec('shopify', 'transmission-type')
  const itemCondition = getSpec('shopify', 'item-condition')
  const isAvailable = product.availableForSale

  const specs = [
    { icon: Cog, label: transmission },
    { icon: Fuel, label: fuelType },
    { icon: ShieldCheck, label: itemCondition },
    { icon: Calendar, label: year },
  ].filter(row => row.label)

  return (
    <Link
      href={`/products/${product.handle}`}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
    >
      {/* Image */}
      <div className="car-card-media relative shrink-0 overflow-hidden">
        {image && (
          <Image
            src={image.url}
            alt={image.altText ?? product.title}
            fill
            className="object-cover"
            sizes="(min-width: 1280px) 400px, (min-width: 768px) 33vw, 100vw"
          />
        )}
      </div>

      {/* Content */}
      <div className="flex grow flex-col p-3">
        {/* Title */}
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-heading">
          {product.title}
        </h3>

        {/* Specs row */}
        {specs.length > 0 && (
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
            {specs.map(({ icon: IconComponent, label }) => (
              <div key={label} className="flex items-center gap-1">
                <IconComponent className="size-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Price */}
        <div className="mt-auto flex items-end justify-between pt-3">
          <p
            className={cn(
              'font-heading text-lg font-semibold',
              isAvailable ? 'text-brand-green' : 'text-brand-red'
            )}
          >
            {isAvailable ? price : productPage.labels.reservedMoreWanted}
          </p>
        </div>
      </div>
    </Link>
  )
}

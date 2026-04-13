import { mdiCalendar, mdiCar, mdiCarShiftPattern, mdiSpeedometer } from '@mdi/js'
import { Icon } from '@mdi/react'
import Image from 'next/image'
import Link from 'next/link'
import { productPage } from '@/lib/data'
import type { ShopifyProduct } from '@/lib/types'
import { formatPrice } from '@/lib/utils'

type CarCardProps = {
  product: ShopifyProduct
}

function metaValue(field: { value: string | null } | null): string | null {
  return field?.value ?? null
}

export function CarCard({ product }: CarCardProps) {
  const image = product.images.edges[0]?.node
  const { amount, currencyCode } = product.priceRange.minVariantPrice
  const price = formatPrice(amount, currencyCode)

  // Structured metafield values
  const make = metaValue(product.make) ?? product.vendor
  const year = metaValue(product.year)
  const transmission = metaValue(product.transmission)
  const fuelType = metaValue(product.fuelType)
  const mileage = metaValue(product.mileage)
  const colour = metaValue(product.colour)

  // Transmission/fuel combined display (e.g. "Automatic / Petrol")
  const transmissionFuel = [transmission, fuelType].filter(Boolean).join(' / ') || null

  // Desktop detail rows
  const desktopDetails = [
    { icon: mdiCar, label: make },
    { icon: mdiCarShiftPattern, label: transmissionFuel },
    {
      icon: mdiSpeedometer,
      label: product.availableForSale ? productPage.labels.available : productPage.labels.sold,
    },
    { icon: mdiCalendar, label: year },
  ].filter(row => row.label)

  // Mobile detail list (up to 4 items)
  const mobileDetails = [
    year,
    transmissionFuel,
    mileage,
    colour,
    make,
    product.availableForSale ? productPage.labels.available : productPage.labels.sold,
  ]
    .filter(Boolean)
    .slice(0, 4)

  return (
    <Link href={`/products/${product.handle}`} className="flex flex-col group">
      <div className="car-card-media relative h-56 overflow-hidden bg-surface-elevated shrink-0 md:h-auto">
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

      <h3 className="mt-3 px-1 font-sans text-lg font-normal leading-8 text-heading md:font-display md:text-xl md:leading-snug">
        {product.title}
      </h3>

      <div className="mt-3 flex flex-col px-1 md:hidden">
        <p className="line-clamp-4 flex-1 font-body text-15 leading-7 text-body">
          {product.description}
        </p>
        <p className="mt-3 font-heading text-lg font-semibold text-foreground">
          {product.availableForSale ? price : productPage.labels.reservedMoreWanted}
        </p>
      </div>

      <div className="mt-4 border-t border-border-subtle px-2 pt-3 pb-1 md:hidden">
        <div className="flex flex-col gap-3">
          {mobileDetails.map(detail => (
            <p key={detail} className="font-body text-13 font-medium text-foreground">
              {detail}
            </p>
          ))}
        </div>
      </div>

      <div className="mt-3 hidden grid-cols-2 gap-y-1 border-t border-border-subtle pt-2 md:grid">
        {desktopDetails.map(({ icon: iconPath, label }) => (
          <div key={label} className="flex items-center gap-2 px-2 py-1">
            <Icon path={iconPath} size={1} className="size-3.5 text-heading shrink-0" />
            <span className="font-body font-medium text-13 text-foreground truncate">{label}</span>
          </div>
        ))}
      </div>

      <div className="mt-3 hidden flex-1 flex-col px-1 pb-4 md:flex">
        <p className="font-body text-15 text-body leading-relaxed line-clamp-2 flex-1">
          {product.description}
        </p>
        <p className="font-heading font-semibold text-lg text-foreground mt-3">
          {product.availableForSale ? price : productPage.labels.reservedMoreWanted}
        </p>
      </div>
    </Link>
  )
}

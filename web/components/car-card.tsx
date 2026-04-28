import { mdiCalendar, mdiCar, mdiCarShiftPattern, mdiSpeedometer } from '@mdi/js'
import { Icon } from '@mdi/react'
import Image from 'next/image'
import Link from 'next/link'
import { productPage } from '@/lib/data'
import type { ShopifyProduct } from '@/lib/types'
import {
  cn,
  formatPrice,
  formatVehicleDescription,
  metaValue,
  parseVehicleFromTitle,
} from '@/lib/utils'

type CarCardProps = {
  product: ShopifyProduct
}

export function CarCard({ product }: CarCardProps) {
  const image = product.images.edges[0]?.node
  const { amount, currencyCode } = product.priceRange.minVariantPrice
  const price = formatPrice(amount, currencyCode)

  // Derive make from title — not stored as metafields
  const { make: makeFromTitle } = parseVehicleFromTitle(product.title)
  const make = makeFromTitle ?? product.vendor

  // Vehicle attributes from metafields
  const year = metaValue(product.year)
  const transmission = metaValue(product.transmission)
  const fuelType = metaValue(product.fuelType)

  // Mileage parsed from description (speedometer icon)
  const { specs } = formatVehicleDescription(product.description)
  const mileage = specs.find(s => s.label === 'Mileage')?.value ?? null

  // Combined transmission/fuel (e.g. "Automatic / Petrol")
  const transmissionFuel = [transmission, fuelType].filter(Boolean).join(' / ') || null

  // Mobile detail list (up to 4 items)
  const mobileDetails = [
    year,
    transmissionFuel,
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
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            sizes="(min-width: 1280px) 400px, (min-width: 768px) 33vw, 100vw"
          />
        )}
      </div>

      <h3 className="mt-3 px-1 font-sans text-lg font-normal leading-8 text-heading md:font-display md:text-xl md:leading-snug">
        {product.title}
      </h3>

      <div className="mt-3 flex flex-col px-1 md:hidden">
        {(() => {
          const { equipment } = formatVehicleDescription(product.description)
          return equipment.length > 0 ? (
            <ul className="flex flex-col gap-1">
              {equipment.slice(0, 6).map(item => (
                <li
                  key={item}
                  className="font-body text-13 text-body before:mr-2 before:content-['·']"
                >
                  {item}
                </li>
              ))}
              {equipment.length > 6 && (
                <li className="font-body text-13 text-muted-foreground">
                  +{equipment.length - 6} more
                </li>
              )}
            </ul>
          ) : (
            <p className="flex-1 font-body text-15 leading-7 text-body">{product.description}</p>
          )
        })()}
        <p
          className={cn(
            'mt-3 font-heading text-lg font-semibold',
            product.availableForSale ? 'text-brand-green' : 'text-brand-red'
          )}
        >
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
        {[
          { icon: mdiCar, label: make },
          { icon: mdiCarShiftPattern, label: transmissionFuel },
          { icon: mdiSpeedometer, label: mileage },
          { icon: mdiCalendar, label: year },
        ]
          .filter(row => row.label)
          .map(({ icon: iconPath, label }) => (
            <div key={label} className="flex items-center gap-2 px-2 py-1">
              <Icon path={iconPath} size={1} className="size-3.5 text-heading shrink-0" />
              <span className="font-body font-medium text-13 text-foreground truncate">
                {label}
              </span>
            </div>
          ))}
      </div>

      <div className="mt-3 hidden flex-1 flex-col px-1 pb-4 md:flex">
        {(() => {
          const { equipment } = formatVehicleDescription(product.description)
          return equipment.length > 0 ? (
            <ul className="flex flex-col gap-1">
              {equipment.slice(0, 8).map(item => (
                <li
                  key={item}
                  className="font-body text-13 text-body before:mr-2 before:content-['·']"
                >
                  {item}
                </li>
              ))}
              {equipment.length > 8 && (
                <li className="font-body text-13 text-muted-foreground">
                  +{equipment.length - 8} more
                </li>
              )}
            </ul>
          ) : (
            <p className="flex-1 font-body text-15 leading-7 text-body">{product.description}</p>
          )
        })()}
        <p
          className={cn(
            'font-heading font-semibold text-lg mt-3',
            product.availableForSale ? 'text-brand-green' : 'text-brand-red'
          )}
        >
          {product.availableForSale ? price : productPage.labels.reservedMoreWanted}
        </p>
      </div>
    </Link>
  )
}

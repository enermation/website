'use client'

import { mdiCalendar, mdiCar, mdiCarShiftPattern, mdiSpeedometer } from '@mdi/js'
import { Icon } from '@mdi/react'
import Image from 'next/image'
import Link from 'next/link'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { productPage } from '@/lib/data'
import type { ShopifyProductMinimal } from '@/lib/types'
import { cn, metaValue } from '@/lib/utils'

function formatPriceProduct(product: ShopifyProductMinimal): string {
  const { amount, currencyCode } = product.priceRange.minVariantPrice

  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currencyCode,
  }).format(parseFloat(amount))
}

function LatestArrivalCard({
  product,
  priority = false,
  index = 0,
}: {
  product: ShopifyProductMinimal
  priority?: boolean
  index?: number
}) {
  const image = product.images.edges[0]?.node
  const details = [
    { icon: mdiCalendar, label: metaValue(product.year) },
    { icon: mdiCar, label: metaValue(product.colour) },
    { icon: mdiSpeedometer, label: metaValue(product.mileage) },
    { icon: mdiCarShiftPattern, label: metaValue(product.transmission) },
  ].filter(detail => detail.label)

  const isAvailable = product.availableForSale

  return (
    <div
      className={cn(
        'group relative flex flex-col rounded-xl border border-border',
        'bg-card transition-colors duration-200 hover:border-border-strong',
        'grain-overlay latest-card-in'
      )}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* StripeBar top-left accent — visible on hover */}
      <div className="absolute left-3 top-3 z-10 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="h-0.5 w-6 bg-brand-green" />
        <div className="h-0.5 w-4 border border-white-solid" />
        <div className="h-0.5 w-4 bg-brand-red" />
      </div>

      <Link href={`/products/${product.handle}`} className="group relative flex flex-col">
        <AspectRatio ratio={3 / 2} className="overflow-hidden bg-surface-elevated">
          {image && (
            <Image
              src={image.url}
              alt={image.altText ?? product.title}
              fill
              priority={priority}
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(min-width: 1280px) 416px, (min-width: 768px) 33vw, 100vw"
            />
          )}

          {/* Hover overlay — specs panel with editorial icon containers */}
          {details.length > 0 && (
            <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <div className="grid grid-cols-2 gap-2.5 p-5">
                {details.map(({ icon: iconPath, label }) => (
                  <div key={label} className="flex items-center gap-2.5">
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-md border border-white-30 bg-white-20">
                      <Icon path={iconPath} size={1} className="size-3.5 text-on-dark" />
                    </div>
                    <span className="truncate font-heading text-13 font-medium text-on-dark">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reserved badge */}
          {!isAvailable && (
            <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full border border-brand-red/50 bg-black/60 px-2.5 py-1 backdrop-blur-xs">
              <div className="size-1.5 rounded-full bg-brand-red" />
              <span className="font-heading text-11 font-semibold uppercase tracking-wide text-on-dark">
                Reserved
              </span>
            </div>
          )}
        </AspectRatio>

        <div className="flex flex-1 flex-col gap-2 px-1 pt-4">
          {/* Title — matches collection card style */}
          <h3 className="font-display text-2xl font-normal leading-tight text-heading">
            {product.title}
          </h3>

          {/* Description */}
          <p className="line-clamp-2 font-body text-15 leading-relaxed text-body">
            {product.description}
          </p>

          {/* Price — matching collection card style */}
          <div className="mt-auto pt-2">
            <p
              className={cn(
                'font-heading text-lg font-semibold',
                isAvailable ? 'text-heading' : 'text-destructive'
              )}
            >
              {isAvailable ? formatPriceProduct(product) : productPage.labels.reservedMoreWanted}
            </p>
          </div>
        </div>
      </Link>
    </div>
  )
}

export function LatestArrivalsCarousel({ products }: { products: ShopifyProductMinimal[] }) {
  return (
    <Carousel
      opts={{
        align: 'start',
        loop: false,
      }}
      className="w-full"
    >
      <div className="mb-6 flex items-center justify-end gap-2">
        <CarouselPrevious className="static translate-y-0" />
        <CarouselNext className="static translate-y-0" />
      </div>
      <CarouselContent className="-ml-4">
        {products.map((product, index) => (
          <CarouselItem key={product.id} className="basis-full md:basis-1/2 lg:basis-1/3 pl-4">
            <LatestArrivalCard product={product} priority={index < 3} index={index} />
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  )
}

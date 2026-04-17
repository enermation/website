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
import { cn } from '@/lib/utils'

function metaValue(field: { value: string | null } | null): string | null {
  return field?.value ?? null
}

function formatPrice(product: ShopifyProductMinimal): string {
  const { amount, currencyCode } = product.priceRange.minVariantPrice

  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currencyCode,
  }).format(parseFloat(amount))
}

function LatestArrivalCard({
  product,
  priority = false,
}: {
  product: ShopifyProductMinimal
  priority?: boolean
}) {
  const image = product.images.edges[0]?.node
  const details = [
    { icon: mdiCalendar, label: metaValue(product.year) },
    { icon: mdiCar, label: metaValue(product.colour) },
    { icon: mdiSpeedometer, label: metaValue(product.mileage) },
    { icon: mdiCarShiftPattern, label: metaValue(product.transmission) },
  ].filter(detail => detail.label)

  return (
    <div className="flex flex-col bg-surface-dark">
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

          {/* Hover overlay — specs panel */}
          {details.length > 0 && (
            <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <div className="grid grid-cols-2 gap-2 p-4">
                {details.map(({ icon: iconPath, label }) => (
                  <div key={label} className="flex items-center gap-2">
                    <Icon path={iconPath} size={1} className="size-3.5 shrink-0 text-on-dark" />
                    <span className="truncate font-heading text-13 font-medium text-on-dark">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </AspectRatio>

        <div className="flex flex-1 flex-col gap-2 px-1 pt-4">
          <h3 className="font-display text-2xl leading-snug text-heading">{product.title}</h3>
          <p className="line-clamp-2 font-body text-15 leading-relaxed text-muted">
            {product.description}
          </p>
          <p className="font-heading text-lg font-semibold text-foreground">
            {product.availableForSale
              ? formatPrice(product)
              : productPage.labels.reservedMoreWanted}
          </p>
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
      <div className="flex items-center justify-end gap-2 mb-4">
        <CarouselPrevious className="static translate-y-0" />
        <CarouselNext className="static translate-y-0" />
      </div>
      <CarouselContent className="-ml-4">
        {products.map((product, index) => (
          <CarouselItem key={product.id} className="basis-full md:basis-1/2 lg:basis-1/3 pl-4">
            <LatestArrivalCard product={product} priority={index < 3} />
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  )
}

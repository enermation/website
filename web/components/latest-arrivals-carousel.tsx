'use client'

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import type { ShopifyProduct } from '@/lib/types'
import {
  mdiCalendar,
  mdiCar,
  mdiCarShiftPattern,
  mdiSpeedometer,
} from '@mdi/js'
import { Icon } from '@mdi/react'
import Image from 'next/image'
import Link from 'next/link'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { productPage } from '@/lib/data'
import { cn } from '@/lib/utils'

function metaValue(field: { value: string | null } | null): string | null {
  return field?.value ?? null
}

function formatPrice(product: ShopifyProduct): string {
  const { amount, currencyCode } = product.priceRange.minVariantPrice

  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currencyCode,
  }).format(parseFloat(amount))
}

function LatestArrivalCard({ product }: { product: ShopifyProduct }) {
  const image = product.images.edges[0]?.node
  const details = [
    { icon: mdiCalendar, label: metaValue(product.year) },
    { icon: mdiCar, label: metaValue(product.colour) },
    { icon: mdiSpeedometer, label: metaValue(product.mileage) },
    { icon: mdiCarShiftPattern, label: metaValue(product.transmission) },
  ].filter(detail => detail.label)

  return (
    <div className="flex flex-col">
      <Link href={`/products/${product.handle}`} className="group flex flex-col">
        <AspectRatio ratio={3 / 2} className="overflow-hidden bg-surface-elevated">
          {image && (
            <Image
              src={image.url}
              alt={image.altText ?? product.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(min-width: 1280px) 416px, (min-width: 768px) 33vw, 100vw"
            />
          )}
        </AspectRatio>

        <div className="flex flex-1 flex-col gap-3 px-1 pt-4">
          <h3 className="font-display text-xl leading-snug text-heading">{product.title}</h3>
          <p className="line-clamp-3 font-body text-15 leading-relaxed text-body">
            {product.description}
          </p>
          <p className="font-heading text-lg font-semibold text-foreground">
            {product.availableForSale ? formatPrice(product) : productPage.labels.reservedMoreWanted}
          </p>
        </div>

        {details.length > 0 && (
          <div className={cn('mt-4 grid grid-cols-2 gap-y-3 border-t border-subtle px-1 pt-3', details.length === 3 && 'md:grid-cols-3')}>
            {details.map(({ icon: iconPath, label }) => (
              <div key={label} className="flex items-center gap-2 pr-2">
                <Icon path={iconPath} size={1} className="size-3.5 shrink-0 text-heading" />
                <span className="truncate font-body text-13 font-medium text-foreground">
                  {label}
                </span>
              </div>
            ))}
          </div>
        )}
      </Link>
    </div>
  )
}

export function LatestArrivalsCarousel({ products }: { products: ShopifyProduct[] }) {
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
        {products.map(product => (
          <CarouselItem key={product.id} className="basis-full md:basis-1/2 lg:basis-1/3 pl-4">
            <LatestArrivalCard product={product} />
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  )
}

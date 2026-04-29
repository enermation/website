'use client'

import { Calendar, Car, Gauge, Settings } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { productPage } from '@/lib/data'
import type { ShopifyProduct } from '@/lib/types'
import { cn, formatPrice, metaValue } from '@/lib/utils'

export function LatestArrivalsCarousel({ products }: { products: ShopifyProduct[] }) {
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
        {products.map((product, index) => {
          const image = product.images.edges[0]?.node
          const { amount, currencyCode } = product.priceRange.minVariantPrice
          const price = formatPrice(amount, currencyCode)

          // Derive make from title — not stored as metafields
          const make = product.title.split(' ')[0] ?? product.vendor

          const year = metaValue(product.year)
          const transmission = metaValue(product.transmission)
          const fuelType = metaValue(product.fuelType)
          const mileage = (() => {
            const match = product.description.match(/Mileage[:\s]*([^\n,]+)/i)
            return match ? match[1].trim() : null
          })()

          const transmissionFuel = [transmission, fuelType].filter(Boolean).join(' / ') || null
          const isAvailable = product.availableForSale

          return (
            <CarouselItem key={product.id} className="basis-full md:basis-1/2 lg:basis-1/3 pl-4">
              <Link href={`/products/${product.handle}`} className="flex flex-col group">
                {/* Image */}
                <div className="car-card-media relative overflow-hidden bg-surface-elevated shrink-0 md:h-auto">
                  {image && (
                    <Image
                      src={image.url}
                      alt={image.altText ?? product.title}
                      fill
                      priority={index < 3}
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      sizes="(min-width: 1280px) 416px, (min-width: 768px) 33vw, 100vw"
                    />
                  )}
                </div>

                {/* Title */}
                <h3 className="mt-3 px-1 font-sans text-lg font-normal leading-8 text-heading md:font-display md:text-xl md:leading-snug">
                  {product.title}
                </h3>

                {/* Price — mobile */}
                <div className="mt-3 flex flex-col px-1 md:hidden">
                  <p
                    className={cn(
                      'mt-3 font-heading text-lg font-semibold',
                      isAvailable ? 'text-brand-green' : 'text-brand-red'
                    )}
                  >
                    {isAvailable ? price : productPage.labels.reservedMoreWanted}
                  </p>
                </div>

                {/* Details grid — mobile */}
                <div className="mt-4 grid grid-cols-2 gap-y-1 border-t border-border-subtle px-2 pt-3 pb-1 md:hidden">
                  {[
                    { icon: Car, label: make },
                    { icon: Settings, label: transmissionFuel },
                    { icon: Gauge, label: mileage },
                    { icon: Calendar, label: year },
                  ]
                    .filter(row => row.label)
                    .map(({ icon: IconComponent, label }) => (
                      <div key={label} className="flex items-center gap-2 px-2 py-1">
                        <IconComponent className="size-3.5 text-heading shrink-0" />
                        <span className="font-body font-medium text-13 text-foreground truncate">
                          {label}
                        </span>
                      </div>
                    ))}
                </div>

                {/* Details grid — desktop */}
                <div className="mt-3 hidden grid-cols-2 gap-y-1 border-t border-border-subtle pt-2 md:grid">
                  {[
                    { icon: Car, label: make },
                    { icon: Settings, label: transmissionFuel },
                    { icon: Gauge, label: mileage },
                    { icon: Calendar, label: year },
                  ]
                    .filter(row => row.label)
                    .map(({ icon: IconComponent, label }) => (
                      <div key={label} className="flex items-center gap-2 px-2 py-1">
                        <IconComponent className="size-3.5 text-heading shrink-0" />
                        <span className="font-body font-medium text-13 text-foreground truncate">
                          {label}
                        </span>
                      </div>
                    ))}
                </div>

                {/* Price — desktop */}
                <div className="mt-3 hidden flex-1 flex-col px-1 pb-4 md:flex">
                  <p
                    className={cn(
                      'font-heading font-semibold text-lg mt-3',
                      isAvailable ? 'text-brand-green' : 'text-brand-red'
                    )}
                  >
                    {isAvailable ? price : productPage.labels.reservedMoreWanted}
                  </p>
                </div>
              </Link>
            </CarouselItem>
          )
        })}
      </CarouselContent>
    </Carousel>
  )
}

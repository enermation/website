'use client'

import { Calendar, Cog, Fuel, ShieldCheck } from 'lucide-react'
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
import { cn, formatPrice } from '@/lib/utils'
import { WishlistButton } from './wishlist-button'

export function LatestArrivalsCarousel({ products }: { products: ShopifyProduct[] }) {
  return (
    <Carousel
      opts={{
        align: 'start',
        loop: false,
      }}
      className="w-full"
    >
      {/* Heading row */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="flex-1 text-center font-display text-xl font-normal text-heading md:text-2xl">
          Latest Arrivals for Sale
        </h2>
        <div className="flex items-center gap-2">
          <CarouselPrevious className="static translate-y-0" />
          <CarouselNext className="static translate-y-0" />
        </div>
      </div>

      <CarouselContent className="-ml-4">
        {products.map((product, index) => {
          const image = product.images.edges[0]?.node
          const { amount, currencyCode } = product.priceRange.minVariantPrice
          const price = formatPrice(amount, currencyCode)

          const resolvedSpecs = product.resolvedSpecs ?? []
          const getSpec = (ns: string, key: string) =>
            resolvedSpecs.find(s => s.namespace === ns && s.key === key)?.value ?? null

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
            <CarouselItem key={product.id} className="basis-[85%] pl-4 sm:basis-1/2 lg:basis-1/3">
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
                      priority={index < 3}
                      className="object-cover"
                      sizes="(min-width: 1280px) 416px, (min-width: 768px) 50vw, 85vw"
                    />
                  )}
                </div>

                {/* Content */}
                <div className="flex grow flex-col p-3">
                  {/* Title */}
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-heading">
                      {product.title}
                    </h3>
                    <WishlistButton
                      merchandiseId={product.variants.edges[0]?.node.id ?? ''}
                      productTitle={product.title}
                      className="mt-0.5 shrink-0 text-muted-foreground hover:text-destructive [&_svg]:size-4"
                    />
                  </div>

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

                  {/* Price footer */}
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
            </CarouselItem>
          )
        })}
      </CarouselContent>
    </Carousel>
  )
}

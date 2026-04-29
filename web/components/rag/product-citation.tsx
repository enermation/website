'use client'

import { Car } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import type { ProductCitationData } from '@/lib/rag/types'
import { cn, formatPrice } from '@/lib/utils'

interface ProductCitationProps {
  product: ProductCitationData
}

export function ProductCitation({ product }: ProductCitationProps) {
  const price = formatPrice(product.priceAmount, product.priceCurrency)
  const meta = [product.year, product.make, product.model].filter(Boolean).join(' · ')
  const specs = [product.fuelType, product.transmission, product.condition].filter(Boolean) as string[]

  return (
    <Link
      href={`/products/${product.handle}`}
      className={cn(
        'group flex overflow-hidden rounded-xl border border-border bg-card',
        'transition-all duration-200 hover:border-border/60 hover:shadow-md',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
      )}
    >
      {/* Image */}
      <div className="relative w-24 shrink-0 overflow-hidden bg-muted sm:w-32">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full min-h-20 items-center justify-center">
            <Car className="size-8 text-muted-foreground/30" />
          </div>
        )}

        {/* Status dot */}
        <div className="absolute left-2 top-2">
          {product.available ? (
            <span className="flex items-center gap-1 rounded-full bg-background/85 px-2 py-0.5 backdrop-blur-sm">
              <span className="size-1.5 rounded-full bg-brand-green" />
              <span className="font-body text-11 font-medium text-foreground">In stock</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 rounded-full bg-background/85 px-2 py-0.5 backdrop-blur-sm">
              <span className="size-1.5 rounded-full bg-muted-foreground" />
              <span className="font-body text-11 font-medium text-muted-foreground">Sold</span>
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col justify-between gap-2 p-3 sm:p-4">
        <div className="flex flex-col gap-0.5">
          {meta && (
            <p className="font-body text-11 uppercase tracking-wider text-muted-foreground">{meta}</p>
          )}
          <p className="line-clamp-2 font-heading text-sm font-semibold leading-snug text-foreground">
            {product.title}
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          {specs.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {specs.map(spec => (
                <span
                  key={spec}
                  className="rounded-md border border-border bg-muted px-1.5 py-0.5 font-body text-11 capitalize text-muted-foreground"
                >
                  {spec}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between">
            <p className="font-heading text-sm font-bold text-brand-green">{price}</p>
            <span className="font-body text-11 text-muted-foreground transition-colors group-hover:text-foreground">
              View details →
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

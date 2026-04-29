'use client'

import { CheckCircle } from 'lucide-react'
import { Banknote } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import type { ProductCitationData } from '@/lib/rag/types'
import { cn, formatPrice } from '@/lib/utils'

interface ProductCitationProps {
  product: ProductCitationData
}

export function ProductCitation({ product }: ProductCitationProps) {
  const price = formatPrice(product.priceAmount, product.priceCurrency)

  return (
    <Link
      href={`/products/${product.handle}`}
      className={cn(
        'flex items-center gap-3 rounded-lg border border-border bg-surface-elevated p-3',
        'transition-colors hover:border-brand-green hover:bg-surface-elevated/80'
      )}
    >
      {product.imageUrl ? (
        <div className="relative size-12 shrink-0 overflow-hidden rounded-md bg-muted">
          <Image src={product.imageUrl} alt={product.title} fill className="object-cover" />
        </div>
      ) : (
        <div className="flex size-12 shrink-0 items-center justify-center rounded-md bg-muted">
          <Banknote className="text-muted-foreground" />
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-center gap-2">
          {product.year && (
            <span className="font-body text-11 uppercase tracking-wider text-muted-foreground">
              {product.year}
            </span>
          )}
          {product.make && (
            <span className="font-body text-11 uppercase tracking-wider text-muted-foreground">
              {product.make}
            </span>
          )}
          {product.model && (
            <span className="font-body text-11 uppercase tracking-wider text-muted-foreground">
              {product.model}
            </span>
          )}
        </div>
        <p className="truncate font-heading text-sm font-medium text-foreground">{product.title}</p>
        <p className="font-heading text-sm font-semibold text-brand-green">{price}</p>
      </div>

      {product.available ? (
        <CheckCircle className="shrink-0 text-brand-green" />
      ) : (
        <span className="shrink-0 font-body text-11 uppercase tracking-wider text-muted-foreground">
          Sold
        </span>
      )}
    </Link>
  )
}

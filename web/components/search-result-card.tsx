import Image from 'next/image'
import Link from 'next/link'
import type { SearchResult } from '@/lib/shopify'
import { cn } from '@/lib/utils'
import { WishlistButton } from './wishlist-button'

type SearchResultCardProps = {
  result: SearchResult
  index: number
}

export function SearchResultCard({ result, index }: SearchResultCardProps) {
  return (
    <Link
      href={`/products/${result.handle}`}
      className={cn(
        'group flex flex-col rounded-2xl border border-gray-90 bg-card overflow-hidden transition-colors hover:border-brand-green',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
      )}
    >
      <div className="relative aspect-3-2 overflow-hidden bg-muted">
        {result.image ? (
          <Image
            src={result.image.url}
            alt={result.image.altText ?? result.title}
            fill
            priority={index < 6}
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform group-hover:scale-105"
          />
        ) : null}
        <div className="absolute right-2 top-2">
          <WishlistButton
            merchandiseId={result.handle}
            productTitle={result.title}
            className="bg-card/80 text-muted-foreground hover:text-destructive [&_svg]:size-4"
          />
        </div>
      </div>
      <div className="flex flex-col gap-1 p-4">
        <p className="font-heading text-13 font-semibold text-foreground line-clamp-1">
          {result.title}
        </p>
        <p className="font-body text-sm text-muted-foreground">
          {result.price.currencyCode} {result.price.amount}
        </p>
        {!result.availableForSale && (
          <p className="font-heading text-11 font-semibold uppercase tracking-wide text-destructive">
            Sold
          </p>
        )}
      </div>
    </Link>
  )
}

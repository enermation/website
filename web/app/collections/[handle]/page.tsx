import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { AnimatedSection } from '@/components/animated-section'
import { CarCard } from '@/components/car-card'
import { EditorialFeed } from '@/components/editorial-feed'
import { SiteHeader } from '@/components/site-header'
import { collectionStories } from '@/lib/data'
import { fetchCollectionProducts, fetchCollections } from '@/lib/shopify'
import type { ShopifyProduct } from '@/lib/types'
import { cn } from '@/lib/utils'
import { FilterBar } from './filter-bar'

// ── Types ─────────────────────────────────────────────────────────────────────

type MakeOption = {
  label: string
  count: number
}

// ── Sort key mapping ──────────────────────────────────────────────────────────

function getSortConfig(sort?: string): { sortKey: string; reverse?: boolean } {
  switch (sort) {
    case 'price-asc':
      return { sortKey: 'PRICE', reverse: false }
    case 'price-desc':
      return { sortKey: 'PRICE', reverse: true }
    case 'newest':
      return { sortKey: 'CREATED', reverse: true }
    default:
      return { sortKey: 'PRICE', reverse: true }
  }
}

function buildMakeOptions(products: ShopifyProduct[]): MakeOption[] {
  const counts = new Map<string, number>()

  for (const product of products) {
    // Prefer structured metafield make, fall back to vendor
    const make = product.make?.value?.trim() || product.vendor?.trim()
    if (!make) continue
    counts.set(make, (counts.get(make) ?? 0) + 1)
  }

  return [
    { label: 'Show All', count: products.length },
    ...Array.from(counts.entries())
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([label, count]) => ({ label, count })),
  ]
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function CollectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ handle: string }>
  searchParams: Promise<{ make?: string; sort?: string }>
}) {
  const { handle } = await params
  const { make, sort } = await searchParams

  const { sortKey, reverse } = getSortConfig(sort)
  const filter = make && make !== 'Show All' ? [{ vendor: make }] : undefined

  const [filteredCollection, allCollection, collectionLinks] = await Promise.all([
    fetchCollectionProducts(handle, { sortKey, reverse, filter }),
    fetchCollectionProducts(handle, { sortKey: 'BEST_SELLING', reverse: false }),
    fetchCollections(),
  ])

  if (!filteredCollection || !allCollection) notFound()

  const { title, description, image, products } = filteredCollection
  const makeOptions = buildMakeOptions(allCollection.products)
  const vehicleCount = products.length

  return (
    <>
      <SiteHeader />

      {/* Sub-navigation */}
      <nav className="hidden md:block bg-background border-b border-border">
        <div className="max-w-site mx-auto flex justify-center">
          {collectionLinks.map(collection => {
            const href = `/collections/${collection.handle}`
            const isActive = collection.handle === handle
            return (
              <Link
                key={collection.id}
                href={href}
                className={cn(
                  'font-heading font-semibold text-13 uppercase tracking-wide px-4 py-4 border-b-2 transition-colors',
                  isActive
                    ? 'border-foreground text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                )}
              >
                {collection.title}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Mobile sub-navigation */}
      <nav className="border-b border-border bg-background md:hidden">
        <div className="flex overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {collectionLinks.map(collection => {
            const href = `/collections/${collection.handle}`
            const isActive = collection.handle === handle
            return (
              <Link
                key={collection.id}
                href={href}
                className={cn(
                  'flex-none px-6 py-4 text-center font-heading text-13 font-semibold uppercase tracking-wide transition-colors border-b-2',
                  isActive
                    ? 'border-foreground text-foreground'
                    : 'border-transparent text-muted-foreground'
                )}
              >
                {collection.title}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Content */}
      <section className="relative bg-background py-3 md:py-6 overflow-hidden">
        <div className="relative z-10 max-w-site mx-auto px-3">
          <Suspense>
            <FilterBar makeOptions={makeOptions} currentMake={make} currentSort={sort} />
          </Suspense>

          {products.length === 0 ? (
            <p className="font-body text-15 text-muted-foreground text-center py-24">
              No products found{make && make !== 'Show All' ? ` for ${make}` : ''}.
            </p>
          ) : (
            <AnimatedSection className="mt-6 grid grid-cols-1 gap-y-6 md:grid-cols-3 md:gap-6">
              {products.map((product, i) => (
                <div
                  key={product.id}
                  data-reveal
                  className={cn('h-full', i === 0 ? 'md:col-span-2' : '')}
                >
                  <CarCard product={product} />
                </div>
              ))}
            </AnimatedSection>
          )}

          <EditorialFeed stories={collectionStories} />
        </div>
      </section>
    </>
  )
}

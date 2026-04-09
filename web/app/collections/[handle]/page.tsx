import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { CarCard } from '@/components/car-card'
import { SiteHeader } from '@/components/site-header'
import { showroomSubNav } from '@/lib/data'
import { GET_PRODUCTS_IN_COLLECTION } from '@/lib/queries'
import client from '@/lib/shopify'
import type { ShopifyProduct } from '@/lib/types'
import { cn } from '@/lib/utils'
import { FilterBar } from './filter-bar'

// ── Shopify response type ─────────────────────────────────────────────────────

type CollectionResponse = {
  collection: {
    id: string
    title: string
    products: { edges: { node: ShopifyProduct }[] }
  } | null
}

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
    const make = product.vendor?.trim()
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

  const [{ data: filteredData }, { data: allData }] = await Promise.all([
    client.request<CollectionResponse>(GET_PRODUCTS_IN_COLLECTION, {
      variables: { handle, sortKey, reverse, filter },
    }),
    client.request<CollectionResponse>(GET_PRODUCTS_IN_COLLECTION, {
      variables: { handle, sortKey: 'BEST_SELLING', reverse: false },
    }),
  ])

  if (!filteredData?.collection || !allData?.collection) notFound()

  const { title, products: productData } = filteredData.collection
  const products = productData.edges.map(e => e.node)
  const allProducts = allData.collection.products.edges.map(e => e.node)
  const makeOptions = buildMakeOptions(allProducts)

  return (
    <>
      <SiteHeader />

      {/* Sub-navigation */}
      <nav className="hidden md:block bg-background border-b border-gray-90">
        <div className="max-w-site mx-auto flex justify-center">
          {showroomSubNav.map(tab => {
            const isActive = tab.href === `/collections/${handle}`
            return (
              <Link
                key={tab.label}
                href={tab.href}
                className={cn(
                  'font-heading font-semibold text-13 uppercase tracking-wide px-4 py-4 border-b-2 transition-colors',
                  isActive
                    ? 'border-foreground text-foreground'
                    : 'border-transparent text-foreground/36 hover:text-foreground/60'
                )}
              >
                {tab.label}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Page title — driven by Shopify collection title */}
      <section className="bg-background border-b border-gray-90 px-3 py-10 text-center">
        <h1 className="font-sans text-section font-normal uppercase tracking-widest text-gray-7 md:font-display">
          {title}
        </h1>
        <div className="flex justify-center mt-6">
          <div className="flex items-center">
            <div className="h-1 w-10 bg-brand-green" />
            <div className="h-1 w-10 bg-white border border-gray-87" />
            <div className="h-1 w-10 bg-brand-red" />
          </div>
        </div>
      </section>

      <nav className="border-b border-gray-90 bg-background px-3 py-5 md:hidden">
        <div className="grid grid-cols-2">
          {showroomSubNav.map(tab => {
            const isActive = tab.href === `/collections/${handle}`
            return (
              <Link
                key={tab.label}
                href={tab.href}
                className={cn(
                  'flex justify-center px-4 py-3 text-center font-heading text-13 font-semibold uppercase tracking-wide transition-colors',
                  isActive
                    ? 'border-b-2 border-gray-90 text-foreground'
                    : 'border-b-2 border-transparent text-foreground/36'
                )}
              >
                {tab.label}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Content */}
      <section className="bg-background py-3 md:py-6">
        <div className="max-w-site mx-auto px-3">
          <Suspense>
            <FilterBar makeOptions={makeOptions} currentMake={make} currentSort={sort} />
          </Suspense>

          {products.length === 0 ? (
            <p className="font-body text-15 text-gray-33 text-center py-24">
              No products found{make && make !== 'Show All' ? ` for ${make}` : ''}.
            </p>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-y-6 md:grid-cols-3 md:gap-6">
              {products.map(product => (
                <CarCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}

import { format } from 'date-fns'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { AnimatedSection } from '@/components/animated-section'
import { BlogCardGrid } from '@/components/blog-card-grid'
import { CarCard } from '@/components/car-card'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { applyFilters, buildFilterDimensions } from '@/lib/filter-utils'
import { getFooterNavigation } from '@/lib/header-navigation'
import { fetchBlogByHandle, fetchCollectionProductsAdmin, fetchCollections } from '@/lib/shopify'
import type { ActiveFilters, ShopifyCollection } from '@/lib/types'
import { cn } from '@/lib/utils'
import { FilterBar } from './filter-bar'

export const revalidate = 86400

export async function generateStaticParams() {
  const collections = await fetchCollections()
  return collections.map(c => ({ handle: c.handle }))
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

// ── Metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>
}): Promise<Metadata> {
  const { handle } = await params
  const collection = await fetchCollectionProductsAdmin(handle, {
    sortKey: 'TITLE',
    reverse: false,
  }).catch(() => null)

  if (!collection) return {}
  return {
    title: `${collection.title} | Enermation`,
    description: collection.description ?? undefined,
    openGraph: {
      title: collection.title,
      description: collection.description ?? undefined,
      images: collection.image
        ? [{ url: collection.image.url, alt: collection.image.altText ?? collection.title }]
        : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
    },
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function CollectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ handle: string }>
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const { handle } = await params
  const rawParams = await searchParams
  const { sort, ...rawFilters } = rawParams

  const { sortKey, reverse } = getSortConfig(sort)

  // Active filters: all searchParams except 'sort', keyed by namespace.key spec ID
  const activeFilters: ActiveFilters = Object.fromEntries(
    Object.entries(rawFilters).filter(([, v]) => v && v !== 'Show All')
  )

  const [collection, collectionLinks, blog, footerNavigation] = await Promise.all([
    fetchCollectionProductsAdmin(handle, { sortKey, reverse }).catch(() => null),
    fetchCollections().catch(() => [] as ShopifyCollection[]),
    fetchBlogByHandle('news').catch(() => null),
    getFooterNavigation().catch(() => []),
  ])

  if (!collection) notFound()

  const allProducts = collection.products
  const dimensions = buildFilterDimensions(allProducts)
  const filteredProducts = applyFilters(allProducts, activeFilters)

  const totalCount = allProducts.length
  const filteredCount = filteredProducts.length

  return (
    <>
      <SiteHeader />

      {/* Sub-navigation */}
      <nav
        aria-label="Collection navigation"
        className="hidden md:block bg-background border-b border-border"
      >
        <div className="max-w-site mx-auto flex justify-center">
          {collectionLinks.map(collection => {
            const href = `/collections/${collection.handle}`
            const isActive = collection.handle === handle
            return (
              <Link
                key={collection.id}
                href={href}
                aria-current={isActive ? 'page' : undefined}
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
      <nav
        aria-label="Mobile collection navigation"
        className="border-b border-border bg-background md:hidden"
      >
        <div className="flex overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {collectionLinks.map(collection => {
            const href = `/collections/${collection.handle}`
            const isActive = collection.handle === handle
            return (
              <Link
                key={collection.id}
                href={href}
                aria-current={isActive ? 'page' : undefined}
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
            <FilterBar
              dimensions={dimensions}
              active={activeFilters}
              currentSort={sort}
              totalCount={totalCount}
              filteredCount={filteredCount}
            />
          </Suspense>

          {filteredProducts.length === 0 ? (
            <p className="font-body text-15 text-muted-foreground text-center py-24">
              No products found
              {Object.entries(activeFilters)
                .filter(([, v]) => v)
                .map(([k, v]) => ` · ${k}: ${v}`)
                .join('')}
              .
            </p>
          ) : (
            <AnimatedSection className="mt-6 grid grid-cols-1 gap-y-6 md:grid-cols-3 md:gap-6">
              {filteredProducts.map((product, i) => (
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

          {blog && blog.articles.length > 0 && (
            <section className="mt-16">
              <BlogCardGrid
                tagline="Latest"
                heading="From The Journal"
                description=""
                posts={blog.articles.map(article => ({
                  id: article.id,
                  title: article.title,
                  summary: article.excerpt ?? '',
                  label: article.tags[0] ?? 'Article',
                  author: article.author.name,
                  published: format(new Date(article.publishedAt), 'd MMM yyyy'),
                  url: `/blog/${blog.handle}/${article.handle}`,
                  image: article.image?.url ?? '',
                }))}
              />
            </section>
          )}
        </div>
      </section>

      <SiteFooter exploreGroups={footerNavigation} />
    </>
  )
}

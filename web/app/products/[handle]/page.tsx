import { ChevronRightIcon } from 'lucide-react'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { AnimatedSection } from '@/components/animated-section'
import { CarCard } from '@/components/car-card'
import { SiteHeader } from '@/components/site-header'
import { StripeBar } from '@/components/stripe-bar'
import { productPage, relatedStories } from '@/lib/data'
import { fetchCollectionProducts, fetchProduct } from '@/lib/shopify'
import { truncateForMeta } from '@/lib/text'
import { ImageGallery } from './image-gallery'
import { ProductInfoPanel } from './product-info-panel'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>
}): Promise<Metadata> {
  const { handle } = await params
  const product = await fetchProduct(handle)

  if (!product) return {}

  const description = product.description ?? ''
  const truncated = truncateForMeta(description, 157)
  return {
    title: `${product.title} | Enermation`,
    description: truncated,
  }
}

async function SimilarCarsSection({
  collectionHandle,
  currentProductHandle,
  showroomHref,
}: {
  collectionHandle: string
  currentProductHandle: string
  showroomHref: string
}) {
  const collection = await fetchCollectionProducts(collectionHandle, {
    sortKey: 'BEST_SELLING',
    reverse: false,
  })

  const similarCars =
    collection?.products.filter(product => product.handle !== currentProductHandle).slice(0, 3) ??
    []

  if (similarCars.length === 0) {
    return (
      <section className="bg-muted py-12 md:py-16">
        <div className="mx-auto max-w-site px-4 md:px-6">
          <div className="mb-8 flex items-center justify-between md:mb-10">
            <h2 className="font-display text-2xl uppercase tracking-widest text-heading md:text-section">
              {productPage.sections.youMayAlsoLike}
            </h2>
            <div className="hidden md:block">
              <StripeBar />
            </div>
          </div>
          <p className="font-body text-15 text-muted-foreground">No similar listings found.</p>
          <div className="mt-8 flex justify-center md:mt-12">
            <Link
              href={showroomHref}
              className="border-2 border-foreground px-8 py-3 text-center font-heading text-13 font-semibold uppercase tracking-wider text-foreground transition-colors hover:bg-foreground hover:text-background"
            >
              {productPage.labels.viewAllStockForSale}
            </Link>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-muted py-12 md:py-16">
      <div className="mx-auto max-w-site px-4 md:px-6">
        <div className="mb-8 flex items-center justify-between md:mb-10">
          <h2 className="font-display text-2xl uppercase tracking-widest text-heading md:text-section">
            {productPage.sections.youMayAlsoLike}
          </h2>
          <div className="hidden md:block">
            <StripeBar />
          </div>
        </div>
        <AnimatedSection className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {similarCars.map(car => (
            <div key={car.id} data-reveal>
              <CarCard product={car} />
            </div>
          ))}
        </AnimatedSection>
        <div className="mt-8 flex justify-center md:mt-12">
          <Link
            href={showroomHref}
            className="border-2 border-foreground px-8 py-3 text-center font-heading text-13 font-semibold uppercase tracking-wider text-foreground transition-colors hover:bg-foreground hover:text-background"
          >
            {productPage.labels.viewAllStockForSale}
          </Link>
        </div>
      </div>
    </section>
  )
}

export default async function ProductPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params

  const product = await fetchProduct(handle)
  if (!product) notFound()

  const images = product.images.edges.map(edge => edge.node)
  const primaryCollection = product.collections?.edges[0]?.node ?? null
  const showroomHref = primaryCollection ? `/collections/${primaryCollection.handle}` : '/'
  const showroomLabel = primaryCollection?.title ?? productPage.breadcrumb.showroom

  const variants = product.variants.edges.map(edge => edge.node)

  return (
    <>
      <SiteHeader />

      {/* Desktop breadcrumb */}
      <nav aria-label="Breadcrumb" className="hidden border-b border-border bg-background md:block">
        <div className="mx-auto flex max-w-site items-center gap-2 px-6 py-3 font-heading text-13 text-body">
          <Link href="/" className="transition-colors hover:text-foreground scroll-mt-20">
            {productPage.breadcrumb.home}
          </Link>
          <span>/</span>
          <Link
            href={showroomHref}
            className="transition-colors hover:text-foreground scroll-mt-20"
          >
            {showroomLabel}
          </Link>
          <span>/</span>
          <span className="truncate text-foreground">{product.title}</span>
        </div>
      </nav>

      {/* Mobile breadcrumb */}
      <nav aria-label="Breadcrumb" className="border-b border-border bg-background md:hidden">
        <div className="mx-auto flex max-w-site items-center gap-1 px-4 py-3 font-heading text-13 text-body">
          <Link href="/" className="transition-colors hover:text-foreground scroll-mt-20">
            {productPage.breadcrumb.home}
          </Link>
          <ChevronRightIcon className="size-3 text-muted-foreground" aria-hidden="true" />
          <Link
            href={showroomHref}
            className="transition-colors hover:text-foreground scroll-mt-20"
          >
            {showroomLabel}
          </Link>
          <ChevronRightIcon className="size-3 text-muted-foreground" aria-hidden="true" />
          <span className="truncate text-foreground">{product.title}</span>
        </div>
      </nav>

      {/* Full-width gallery */}
      <section className="bg-background">
        <div className="mx-auto max-w-site px-4 md:px-6 md:pt-6">
          <ImageGallery images={images} />
        </div>
      </section>

      {/* Product content — 4-column grid: main + sidebar */}
      <section className="bg-background">
        <div className="mx-auto max-w-site px-4 py-6 md:px-6 md:py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 md:gap-10">
            {/* Main content */}
            <div className="md:col-span-3">
              <ProductInfoPanel
                vendor={product.vendor}
                title={product.title}
                availableForSale={product.availableForSale}
                description={product.description}
                variants={variants}
                defaultVariantId={variants[0]?.id}
                resolvedSpecs={product.resolvedSpecs ?? []}
                resolvedFeatures={product.resolvedFeatures ?? []}
              />
            </div>

            {/* Sidebar — seller info + CTA */}
            <aside className="hidden md:col-span-1 md:flex md:flex-col md:gap-5">
              <div className="sticky top-6 flex flex-col gap-4 rounded-2xl border border-border border-t-2 bg-surface-elevated p-6">
                <div className="flex flex-col gap-1">
                  <p className="font-body text-11 uppercase tracking-widest text-muted-foreground">
                    {product.vendor}
                  </p>
                  <p className="font-heading text-base font-semibold text-foreground">
                    {showroomLabel}
                  </p>
                </div>

                <Link
                  href={showroomHref}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-brand-green bg-brand-green px-4 py-3 font-heading text-13 font-semibold uppercase tracking-widest text-background transition-colors hover:border-brand-red hover:bg-brand-red"
                >
                  View All Stock
                  <ChevronRightIcon className="size-4" />
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {primaryCollection && (
        <Suspense fallback={<div className="bg-muted py-12 md:py-16" />}>
          <SimilarCarsSection
            collectionHandle={primaryCollection.handle}
            currentProductHandle={product.handle}
            showroomHref={showroomHref}
          />
        </Suspense>
      )}

      {/* Related stories */}
      <section className="border-t border-border bg-background py-12 md:py-16">
        <div className="mx-auto max-w-site px-4 md:px-6">
          <h2 className="mb-8 font-display text-2xl uppercase tracking-widest text-heading md:mb-10 md:text-section">
            {productPage.sections.relatedStories}
          </h2>
          <AnimatedSection className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {relatedStories.map(story => (
              <Link
                key={story.id}
                href={story.href}
                data-reveal
                className="group flex flex-col gap-3"
              >
                <div className="car-card-media relative overflow-hidden bg-surface-elevated">
                  <Image
                    src={story.image}
                    alt={story.title}
                    fill
                    loading="lazy"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(min-width: 1280px) 400px, (min-width: 768px) 33vw, 100vw"
                  />
                </div>
                <div className="flex items-center gap-2 font-heading text-13 text-body">
                  <span>{story.date}</span>
                  <span>|</span>
                  <span>{story.category}</span>
                </div>
                <h3 className="font-display text-base leading-snug text-heading transition-colors group-hover:text-brand-green">
                  {story.title}
                </h3>
              </Link>
            ))}
          </AnimatedSection>
        </div>
      </section>
    </>
  )
}

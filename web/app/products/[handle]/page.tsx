import { mdiChevronRight } from '@mdi/js'
import { Icon } from '@mdi/react'
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
import { formatPrice } from '@/lib/utils'
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

  return {
    title: `${product.title} | Enermation`,
    description: product.description.slice(0, 160),
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

  if (similarCars.length === 0) return null

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

  const { amount, currencyCode } = product.priceRange.minVariantPrice
  const price = formatPrice(amount, currencyCode)

  const firstVariant = product.variants.edges[0]?.node
  const specOptions =
    firstVariant?.selectedOptions?.filter(
      option => option.name !== 'Title' && option.value !== 'Default Title'
    ) ?? []

  return (
    <>
      <SiteHeader />

      {/* Desktop breadcrumb */}
      <nav className="hidden border-b border-border bg-background md:block">
        <div className="mx-auto flex max-w-site items-center gap-2 px-6 py-3 font-heading text-13 text-body">
          <Link href="/" className="transition-colors hover:text-foreground">
            {productPage.breadcrumb.home}
          </Link>
          <span>/</span>
          <Link href={showroomHref} className="transition-colors hover:text-foreground">
            {showroomLabel}
          </Link>
          <span>/</span>
          <span className="truncate text-foreground">{product.title}</span>
        </div>
      </nav>

      {/* Mobile breadcrumb */}
      <nav className="border-b border-border bg-background md:hidden">
        <div className="mx-auto flex max-w-site items-center gap-1 px-4 py-3 font-heading text-13 text-body">
          <Link href="/" className="transition-colors hover:text-foreground">
            {productPage.breadcrumb.home}
          </Link>
          <Icon
            path={mdiChevronRight}
            size={1}
            className="size-3 text-muted-foreground"
            aria-hidden="true"
          />
          <Link href={showroomHref} className="transition-colors hover:text-foreground">
            {showroomLabel}
          </Link>
          <Icon
            path={mdiChevronRight}
            size={1}
            className="size-3 text-muted-foreground"
            aria-hidden="true"
          />
          <span className="truncate text-foreground">{product.title}</span>
        </div>
      </nav>

      {/* 2-column product section */}
      <section className="bg-background">
        <div className="mx-auto max-w-site">
          <div className="product-page-grid lg:gap-10 lg:px-6 lg:pt-8 lg:pb-12">
            {/* Gallery column — edge-to-edge on mobile */}
            <div>
              <ImageGallery images={images} />
            </div>

            {/* Info panel — sticky on desktop */}
            <div className="info-panel-sticky px-4 py-6 lg:px-0 lg:py-0">
              <ProductInfoPanel
                vendor={product.vendor}
                title={product.title}
                price={price}
                availableForSale={product.availableForSale}
                description={product.description}
                specOptions={specOptions}
                merchandiseId={firstVariant?.id ?? ''}
              />
            </div>
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

import { mdiCar, mdiChevronRight } from '@mdi/js'
import { Icon } from '@mdi/react'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { AddToCartButton } from '@/components/add-to-cart-button'
import { CarCard } from '@/components/car-card'
import { ProductSpecs1 } from '@/components/product-specs1'
import { SiteHeader } from '@/components/site-header'
import { StripeBar } from '@/components/stripe-bar'
import { Badge } from '@/components/ui/badge'
import { productPage, relatedStories } from '@/lib/data'
import { GET_PRODUCT_BY_HANDLE, GET_PRODUCTS_IN_COLLECTION, GET_SHOP_INFO } from '@/lib/queries'
import { getClient } from '@/lib/shopify'
import type { ShopifyProduct, ShopifyShopInfo } from '@/lib/types'
import { cn } from '@/lib/utils'
import { ImageGallery } from './image-gallery'

type ProductResponse = {
  product: ShopifyProduct | null
}

type CollectionResponse = {
  collection: {
    id: string
    title: string
    products: { edges: { node: ShopifyProduct }[] }
  } | null
}

type ShopResponse = {
  shop: ShopifyShopInfo | null
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>
}): Promise<Metadata> {
  const { handle } = await params
  const shopify = await getClient()
  const { data } = await shopify.request<ProductResponse>(GET_PRODUCT_BY_HANDLE, {
    variables: { handle },
  })

  if (!data?.product) return {}

  return {
    title: `${data.product.title} | Enermation`,
    description: data.product.description.slice(0, 160),
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
  const shopify = await getClient()
  const { data: collectionData } = await shopify.request<CollectionResponse>(
    GET_PRODUCTS_IN_COLLECTION,
    {
      variables: { handle: collectionHandle, sortKey: 'BEST_SELLING', reverse: false },
    }
  )

  const similarCars =
    collectionData?.collection?.products.edges
      .map(edge => edge.node)
      .filter(product => product.handle !== currentProductHandle)
      .slice(0, 3) ?? []

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
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {similarCars.map(car => (
            <CarCard key={car.id} product={car} />
          ))}
        </div>
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
  const shopify = await getClient()

  const [{ data: productData }, { data: shopData }] = await Promise.all([
    shopify.request<ProductResponse>(GET_PRODUCT_BY_HANDLE, {
      variables: { handle },
    }),
    shopify.request<ShopResponse>(GET_SHOP_INFO),
  ])

  if (!productData?.product) notFound()

  const product = productData.product
  const _shop = shopData?.shop ?? null
  const images = product.images.edges.map(edge => edge.node)
  const primaryCollection = product.collections?.edges[0]?.node ?? null
  const showroomHref = primaryCollection ? `/collections/${primaryCollection.handle}` : '/'
  const showroomLabel = primaryCollection?.title ?? productPage.breadcrumb.showroom

  const { amount, currencyCode } = product.priceRange.minVariantPrice
  const price = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currencyCode,
  }).format(parseFloat(amount))

  const firstVariant = product.variants.edges[0]?.node
  const specOptions =
    firstVariant?.selectedOptions?.filter(
      option => option.name !== 'Title' && option.value !== 'Default Title'
    ) ?? []

  return (
    <>
      <SiteHeader />

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

      <div className="bg-background">
        <div className="mx-auto max-w-site pt-0 md:px-6 md:pt-6">
          <ImageGallery images={images} />
        </div>
      </div>

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

      <section className="bg-background">
        <div className="mx-auto max-w-site px-4 py-6 md:px-6 md:py-10">
          <div className="grid grid-cols-1 items-start gap-10">
            <div className="flex flex-col gap-6 md:gap-8">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between md:gap-6">
                <div className="flex flex-col gap-1">
                  {product.vendor && (
                    <p className="font-body text-13 uppercase tracking-widest text-body">
                      {product.vendor}
                    </p>
                  )}
                  <h1 className="font-display text-2xl leading-tight text-heading md:text-3xl md:leading-snug">
                    {product.title}
                  </h1>
                </div>

                <div className="flex shrink-0 flex-col items-start gap-2 md:items-end">
                  <p className="whitespace-nowrap font-heading text-2xl font-semibold text-foreground">
                    {product.availableForSale ? price : productPage.labels.reserved}
                  </p>
                  <Badge
                    variant="outline"
                    className={cn(
                      'h-auto rounded-none px-3 py-1 font-heading text-13 font-semibold uppercase tracking-wide',
                      product.availableForSale
                        ? 'border-brand-green text-brand-green'
                        : 'border-muted-foreground text-muted-foreground'
                    )}
                  >
                    {product.availableForSale
                      ? productPage.labels.available
                      : productPage.labels.sold}
                  </Badge>
                </div>
              </div>

              <AddToCartButton
                merchandiseId={firstVariant?.id ?? ''}
                availableForSale={product.availableForSale}
              />

              {product.description ? (
                <div className="flex flex-col gap-3">
                  <h2 className="font-display text-xl text-balance text-heading">
                    {productPage.sections.aboutThisListing}
                  </h2>
                  <p className="whitespace-pre-line break-words font-body text-15 leading-relaxed text-body">
                    {product.description}
                  </p>
                </div>
              ) : null}

              {(() => {
                const specs = [
                  ...(product.vendor
                    ? [{ label: productPage.labels.brand, value: product.vendor }]
                    : []),
                  ...specOptions.map(option => ({ label: option.name, value: option.value })),
                  {
                    label: productPage.labels.status,
                    value: product.availableForSale
                      ? productPage.labels.available
                      : productPage.labels.soldOrReserved,
                  },
                  {
                    label: productPage.labels.price,
                    value: product.availableForSale ? price : productPage.labels.reserved,
                  },
                ]

                const categories = [
                  {
                    id: 'details',
                    name: productPage.sections.listingDetails,
                    icon: <Icon path={mdiCar} size={1} className="size-4" />,
                    specs,
                  },
                ]

                return <ProductSpecs1 categories={categories} title="" className="py-0" />
              })()}
            </div>
          </div>
        </div>
      </section>

      {primaryCollection && (
        <SimilarCarsSection
          collectionHandle={primaryCollection.handle}
          currentProductHandle={product.handle}
          showroomHref={showroomHref}
        />
      )}

      <section className="border-t border-border bg-background py-12 md:py-16">
        <div className="mx-auto max-w-site px-4 md:px-6">
          <h2 className="mb-8 font-display text-2xl uppercase tracking-widest text-heading md:mb-10 md:text-section">
            {productPage.sections.relatedStories}
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {relatedStories.map(story => (
              <Link key={story.id} href={story.href} className="group flex flex-col gap-3">
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
          </div>
        </div>
      </section>
    </>
  )
}

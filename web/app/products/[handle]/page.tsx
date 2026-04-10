import {
  mdiAccount,
  mdiCalendar,
  mdiCar,
  mdiChevronRight,
  mdiPhone,
  mdiSpeedometer,
  mdiTableChair,
} from '@mdi/js'
import { Icon } from '@mdi/react'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CarCard } from '@/components/car-card'
import { SiteHeader } from '@/components/site-header'
import { StripeBar } from '@/components/stripe-bar'
import { Badge } from '@/components/ui/badge'
import { footerContactInfo, productPage, relatedStories } from '@/lib/data'
import { GET_PRODUCT_BY_HANDLE, GET_PRODUCTS_IN_COLLECTION, GET_SHOP_INFO } from '@/lib/queries'
import { getClient } from '@/lib/shopify'
import type { ShopifyProduct, ShopifyShopInfo } from '@/lib/types'
import { cn } from '@/lib/utils'
import { ContactSection } from './contact-section'
import { EnquiryForm } from './enquiry-form'
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

function getSpecIcon(name: string): string {
  const normalizedName = name.toLowerCase()

  if (normalizedName.includes('year') || normalizedName.includes('reg')) {
    return mdiCalendar
  }

  if (
    normalizedName.includes('mileage') ||
    normalizedName.includes('miles') ||
    normalizedName.includes('odometer')
  ) {
    return mdiSpeedometer
  }

  if (
    normalizedName.includes('interior') ||
    normalizedName.includes('trim') ||
    normalizedName.includes('upholstery')
  ) {
    return mdiTableChair
  }

  return mdiCar
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
  const shop = shopData?.shop ?? null
  const images = product.images.edges.map(edge => edge.node)
  const primaryCollection = product.collections?.edges[0]?.node ?? null
  const showroomHref = primaryCollection ? `/collections/${primaryCollection.handle}` : '/'
  const showroomLabel = primaryCollection?.title ?? productPage.breadcrumb.showroom
  const sellerName = product.vendor?.trim() || shop?.name || productPage.breadcrumb.showroom
  const sellerWebsite = shop?.primaryDomain?.url ?? null

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
  const mobileSpecs = specOptions.slice(0, 4)

  const collectionData = primaryCollection
    ? await shopify.request<CollectionResponse>(GET_PRODUCTS_IN_COLLECTION, {
        variables: { handle: primaryCollection.handle, sortKey: 'BEST_SELLING', reverse: false },
      })
    : null

  const similarCars =
    collectionData?.data?.collection?.products.edges
      .map(edge => edge.node)
      .filter(collectionProduct => collectionProduct.handle !== handle)
      .slice(0, 3) ?? []

  return (
    <>
      <SiteHeader />

      <nav className="hidden border-b border-gray-90 bg-background md:block">
        <div className="mx-auto flex max-w-site items-center gap-2 px-6 py-3 font-heading text-13 text-gray-33">
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

      <nav className="border-b border-gray-90 bg-background md:hidden">
        <div className="mx-auto flex max-w-site items-center gap-1 px-4 py-3 font-heading text-13 text-gray-33">
          <Link href="/" className="transition-colors hover:text-foreground">
            {productPage.breadcrumb.home}
          </Link>
          <Icon path={mdiChevronRight} size={1} className="size-3 text-gray-60" />
          <Link href={showroomHref} className="transition-colors hover:text-foreground">
            {showroomLabel}
          </Link>
          <Icon path={mdiChevronRight} size={1} className="size-3 text-gray-60" />
          <span className="truncate text-foreground">{product.title}</span>
        </div>
      </nav>

      <section className="bg-background">
        <div className="mx-auto max-w-site px-4 py-6 md:px-6 md:py-10">
          <div className="grid grid-cols-1 items-start gap-10 md:grid-cols-4">
            <div className="col-span-3 flex flex-col gap-6 md:gap-8">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between md:gap-6">
                <div className="flex flex-col gap-1">
                  {product.vendor && (
                    <p className="font-body text-13 uppercase tracking-widest text-gray-33">
                      {product.vendor}
                    </p>
                  )}
                  <h1 className="font-display text-2xl leading-tight text-gray-7 md:text-3xl md:leading-snug">
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
                        : 'border-gray-33 text-gray-33'
                    )}
                  >
                    {product.availableForSale
                      ? productPage.labels.available
                      : productPage.labels.sold}
                  </Badge>
                </div>
              </div>

              {specOptions.length > 0 && (
                <>
                  <div className="grid grid-cols-2 gap-px border-y border-gray-90 bg-gray-90 md:hidden">
                    {mobileSpecs.map(option => {
                      const iconPath = getSpecIcon(option.name)

                      return (
                        <div
                          key={option.name}
                          className="flex items-start gap-3 bg-background px-4 py-3"
                        >
                          <div className="mt-0.5 flex size-9 items-center justify-center rounded-full bg-gray-98">
                            <Icon path={iconPath} size={1} className="size-4 text-gray-33" />
                          </div>
                          <div className="flex min-w-0 flex-col gap-0.5">
                            <span className="font-heading text-13 uppercase tracking-wide text-gray-33">
                              {option.name}
                            </span>
                            <span className="truncate font-body text-15 text-foreground">
                              {option.value}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div className="hidden border-y border-gray-90 md:flex">
                    {specOptions.map((option, index) => (
                      <div
                        key={option.name}
                        className={cn(
                          'flex flex-1 flex-col gap-0.5 px-6 py-4',
                          index > 0 && 'border-l border-gray-90',
                          index === 0 && 'pl-0'
                        )}
                      >
                        <span className="font-display text-lg text-gray-7">{option.value}</span>
                        <span className="font-body text-13 text-gray-33">{option.name}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {product.description && (
                <div className="flex flex-col gap-3">
                  <h2 className="font-display text-xl text-gray-7">
                    {productPage.sections.aboutThisListing}
                  </h2>
                  <p className="whitespace-pre-line font-body text-15 leading-relaxed text-gray-33">
                    {product.description}
                  </p>
                </div>
              )}

              <div className="flex flex-col gap-3">
                <h2 className="font-display text-xl text-gray-7">
                  {productPage.sections.listingDetails}
                </h2>
                <dl className="divide-y divide-gray-90 border-y border-gray-90 md:border-y-0">
                  {product.vendor && (
                    <div className="flex items-start justify-between gap-4 py-3">
                      <dt className="font-body text-13 text-gray-33">{productPage.labels.brand}</dt>
                      <dd className="text-right font-body text-13 text-foreground">
                        {product.vendor}
                      </dd>
                    </div>
                  )}
                  {specOptions.map(option => (
                    <div key={option.name} className="flex items-start justify-between gap-4 py-3">
                      <dt className="font-body text-13 text-gray-33">{option.name}</dt>
                      <dd className="text-right font-body text-13 text-foreground">
                        {option.value}
                      </dd>
                    </div>
                  ))}
                  <div className="flex items-start justify-between gap-4 py-3">
                    <dt className="font-body text-13 text-gray-33">{productPage.labels.status}</dt>
                    <dd
                      className={cn(
                        'text-right font-body text-13',
                        product.availableForSale ? 'text-brand-green' : 'text-gray-33'
                      )}
                    >
                      {product.availableForSale
                        ? productPage.labels.available
                        : productPage.labels.soldOrReserved}
                    </dd>
                  </div>
                  <div className="flex items-start justify-between gap-4 py-3">
                    <dt className="font-body text-13 text-gray-33">{productPage.labels.price}</dt>
                    <dd className="text-right font-heading text-13 font-semibold text-foreground">
                      {product.availableForSale ? price : productPage.labels.reserved}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="flex flex-col gap-4 md:hidden">
                <h2 className="font-display text-xl text-gray-7">
                  {productPage.sections.askAQuestion}
                </h2>
                <div className="flex items-start gap-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gray-90">
                    <Icon path={mdiAccount} size={1} className="size-5 text-gray-33" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="font-body text-13 font-medium text-foreground">{sellerName}</p>
                    <p className="font-body text-13 text-gray-33">
                      {productPage.labels.specialistExportBroker}
                    </p>
                    <a
                      href={`tel:${footerContactInfo.phone.replace(/\s/g, '')}`}
                      className="mt-1 flex items-center gap-1.5 font-body text-13 text-brand-green transition-opacity hover:opacity-80"
                    >
                      <Icon path={mdiPhone} size={1} className="size-3.5" />
                      {productPage.labels.callUs}
                    </a>
                  </div>
                </div>
                <ContactSection productTitle={product.title} />
              </div>

              <div className="hidden flex-col gap-4 md:flex">
                <h2 className="font-display text-xl text-gray-7">
                  {productPage.sections.askAQuestion}
                </h2>
                <div className="flex items-start gap-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gray-90">
                    <Icon path={mdiAccount} size={1} className="size-5 text-gray-33" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="font-body text-13 font-medium text-foreground">{sellerName}</p>
                    <p className="font-body text-13 text-gray-33">
                      {productPage.labels.specialistExportBroker}
                    </p>
                    <a
                      href={`tel:${footerContactInfo.phone.replace(/\s/g, '')}`}
                      className="mt-1 flex items-center gap-1.5 font-body text-13 text-brand-green transition-opacity hover:opacity-80"
                    >
                      <Icon path={mdiPhone} size={1} className="size-3.5" />
                      {productPage.labels.callUs}
                    </a>
                  </div>
                </div>
              </div>

              <div className="hidden flex-col gap-3 md:flex">
                <h2 className="font-display text-xl text-gray-7">
                  {productPage.sections.contactAgent}
                </h2>
                <ContactSection productTitle={product.title} />
              </div>

              <div className="flex flex-col gap-4 border-t border-gray-90 pt-6 md:pt-8">
                <h2 className="font-display text-xl text-gray-7">
                  {productPage.sections.forSaleBy}
                </h2>

                <div className="flex flex-col gap-1">
                  <Link
                    href={showroomHref}
                    className="font-body text-13 font-medium text-foreground transition-colors hover:text-brand-green"
                  >
                    {sellerName}
                  </Link>
                </div>

                <div className="flex flex-col gap-1">
                  <p className="font-body text-13 font-medium text-gray-33">Collection</p>
                  <p className="font-body text-13 leading-relaxed text-foreground">
                    {showroomLabel}
                  </p>
                </div>

                <dl className="divide-y divide-gray-90">
                  {sellerWebsite && (
                    <div className="flex flex-col gap-0.5 py-3">
                      <dt className="font-body text-13 text-gray-33">Website</dt>
                      <dd>
                        <a
                          href={sellerWebsite}
                          className="font-body text-13 text-foreground transition-colors hover:text-brand-green"
                        >
                          {sellerWebsite}
                        </a>
                      </dd>
                    </div>
                  )}
                  <div className="flex flex-col gap-0.5 py-3">
                    <dt className="font-body text-13 text-gray-33">
                      {productPage.labels.phoneNumber}
                    </dt>
                    <dd>
                      <a
                        href={`tel:${footerContactInfo.phone.replace(/\s/g, '')}`}
                        className="font-body text-13 text-foreground transition-colors hover:text-brand-green"
                      >
                        {footerContactInfo.phone}
                      </a>
                    </dd>
                  </div>
                  <div className="flex flex-col gap-0.5 py-3">
                    <dt className="font-body text-13 text-gray-33">{productPage.labels.email}</dt>
                    <dd>
                      <a
                        href={`mailto:${footerContactInfo.email}`}
                        className="font-body text-13 text-foreground transition-colors hover:text-brand-green"
                      >
                        {footerContactInfo.email}
                      </a>
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            <aside className="sticky top-6 hidden flex-col gap-5 border border-gray-90 p-6 md:col-span-1 md:flex">
              <div className="flex items-start gap-3 border-b border-gray-90 pb-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gray-90">
                  <Icon path={mdiAccount} size={1} className="size-5 text-gray-33" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <p className="font-body text-13 font-medium text-foreground">{sellerName}</p>
                  <p className="font-body text-13 text-gray-33">
                    {productPage.labels.specialistDealer}
                  </p>
                  <a
                    href={`tel:${footerContactInfo.phone.replace(/\s/g, '')}`}
                    className="mt-1 flex items-center gap-1.5 font-body text-13 text-brand-green transition-opacity hover:opacity-80"
                  >
                    <Icon path={mdiPhone} size={1} className="size-3.5" />
                    {productPage.labels.callAgent}
                  </a>
                </div>
              </div>

              <EnquiryForm productTitle={product.title} />

              <div className="border-t border-gray-90 pt-4">
                <Link
                  href={showroomHref}
                  className="font-body text-13 text-foreground transition-colors hover:text-brand-green"
                >
                  {sellerName} - {productPage.labels.viewAllStock}
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {similarCars.length > 0 && (
        <section className="bg-gray-98 py-12 md:py-16">
          <div className="mx-auto max-w-site px-4 md:px-6">
            <div className="mb-8 flex items-center justify-between md:mb-10">
              <h2 className="font-display text-2xl uppercase tracking-widest text-gray-7 md:text-section">
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
      )}

      <section className="border-t border-gray-90 bg-background py-12 md:py-16">
        <div className="mx-auto max-w-site px-4 md:px-6">
          <h2 className="mb-8 font-display text-2xl uppercase tracking-widest text-gray-7 md:mb-10 md:text-section">
            {productPage.sections.relatedStories}
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {relatedStories.map(story => (
              <Link key={story.id} href={story.href} className="group flex flex-col gap-3">
                <div className="car-card-media relative overflow-hidden bg-gray-94">
                  <Image
                    src={story.image}
                    alt={story.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(min-width: 1280px) 400px, (min-width: 768px) 33vw, 100vw"
                  />
                </div>
                <div className="flex items-center gap-2 font-heading text-13 text-gray-33">
                  <span>{story.date}</span>
                  <span>|</span>
                  <span>{story.category}</span>
                </div>
                <h3 className="font-display text-base leading-snug text-gray-7 transition-colors group-hover:text-brand-green">
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

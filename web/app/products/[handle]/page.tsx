import { ChevronLeft, ChevronRight, Heart, Images, Phone, TriangleAlert, User } from 'lucide-react'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SiteHeader } from '@/components/site-header'
import { Badge } from '@/components/ui/badge'
import { dealerInfo, footerContactInfo, productPage, relatedStories } from '@/lib/data'
import {
  GET_PRODUCT_BY_HANDLE,
  GET_RELATED_PRODUCTS_IN_COLLECTION,
  GET_SHOP_INFO,
} from '@/lib/queries'
import { getClient } from '@/lib/shopify'
import type { ShopifyProduct, ShopifySelectedOption, ShopifyShopInfo } from '@/lib/types'
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

type DetailRow = {
  label: string
  value: string
}

function metafieldValue(field: { value: string | null } | null | undefined): string | null {
  const value = field?.value?.trim()
  return value && value.length > 0 ? value : null
}

function optionValue(options: ShopifySelectedOption[], keys: string[]): string | null {
  const normalizedKeys = keys.map(key => normalizeToken(key))

  for (const option of options) {
    const normalizedName = normalizeToken(option.name)
    if (normalizedKeys.some(key => normalizedName.includes(key))) {
      const value = option.value.trim()
      if (value.length > 0) return value
    }
  }

  return null
}

function normalizeToken(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function firstDefined(...values: Array<string | null | undefined>): string | null {
  for (const value of values) {
    if (value && value.trim().length > 0) return value
  }

  return null
}

function formatListedDate(isoDate: string | undefined): string {
  if (!isoDate) return productPage.labels.notSpecified

  const parsedDate = new Date(isoDate)
  if (Number.isNaN(parsedDate.getTime())) return productPage.labels.notSpecified

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(parsedDate)
}

function formatPrice(amount: string, currencyCode: string): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currencyCode,
  }).format(parseFloat(amount))
}

function buildListingReference(handle: string): string {
  return handle.replace(/[^a-z0-9]/gi, '').toUpperCase()
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
  const phoneHref = `tel:${footerContactInfo.phone.replace(/\s/g, '')}`
  const reportListingHref = `mailto:${footerContactInfo.email}?subject=${encodeURIComponent(
    `${productPage.labels.reportListingSubjectPrefix} ${product.title}`
  )}`

  const { amount, currencyCode } = product.priceRange.minVariantPrice
  const price = formatPrice(amount, currencyCode)

  const firstVariant = product.variants.edges[0]?.node
  const selectedOptions = firstVariant?.selectedOptions ?? []

  const vehicleYear = firstDefined(
    metafieldValue(product.year),
    optionValue(selectedOptions, ['year', 'reg'])
  )
  const vehicleMileage = firstDefined(
    metafieldValue(product.mileage),
    optionValue(selectedOptions, ['mileage', 'miles', 'odometer'])
  )
  const vehicleEngine = firstDefined(
    metafieldValue(product.engine),
    optionValue(selectedOptions, ['engine'])
  )
  const vehicleGearbox = firstDefined(
    metafieldValue(product.transmission),
    optionValue(selectedOptions, ['gearbox', 'transmission'])
  )
  const vehicleFuelType = firstDefined(
    metafieldValue(product.fuelType),
    optionValue(selectedOptions, ['fuel'])
  )
  const vehicleColor = firstDefined(
    metafieldValue(product.colour),
    optionValue(selectedOptions, ['colour', 'color'])
  )
  const vehicleCondition = firstDefined(
    metafieldValue(product.condition),
    optionValue(selectedOptions, ['condition'])
  )
  const vehicleLocation = firstDefined(
    metafieldValue(product.originCountry),
    optionValue(selectedOptions, ['location']),
    showroomLabel
  )
  const vehicleAddress = firstDefined(optionValue(selectedOptions, ['address']), dealerInfo.address)
  const vehicleCarType = optionValue(selectedOptions, ['car type', 'body', 'vehicle type'])
  const vehicleDriveTrain = optionValue(selectedOptions, ['drive train', 'drivetrain'])
  const vehiclePower = optionValue(selectedOptions, ['power', 'horsepower', 'hp'])
  const vehicleVin = optionValue(selectedOptions, ['vin'])
  const vehicleInteriorColor = optionValue(selectedOptions, ['interior color', 'interior', 'trim'])
  const vehicleVatType = optionValue(selectedOptions, ['vat']) ?? productPage.labels.noDutyPaid
  const vehicleLicense = optionValue(selectedOptions, [
    'license number',
    'licence number',
    'license',
  ])
  const listingReference = buildListingReference(product.handle)
  const listedDate = formatListedDate(product.createdAt)
  const fallbackValue = productPage.labels.notSpecified

  const summarySpecs = [
    { label: productPage.labels.year, value: vehicleYear ?? fallbackValue },
    { label: productPage.labels.mileage, value: vehicleMileage ?? fallbackValue },
    { label: productPage.labels.engine, value: vehicleEngine ?? fallbackValue },
    { label: productPage.labels.gearbox, value: vehicleGearbox ?? fallbackValue },
    { label: productPage.labels.fuelType, value: vehicleFuelType ?? fallbackValue },
  ]

  const detailRows: DetailRow[] = [
    { label: productPage.labels.vatType, value: vehicleVatType ?? fallbackValue },
    { label: productPage.labels.year, value: vehicleYear ?? fallbackValue },
    { label: productPage.labels.location, value: vehicleLocation ?? fallbackValue },
    { label: productPage.labels.address, value: vehicleAddress ?? fallbackValue },
    { label: productPage.labels.mileage, value: vehicleMileage ?? fallbackValue },
    { label: productPage.labels.engine, value: vehicleEngine ?? fallbackValue },
    { label: productPage.labels.gearbox, value: vehicleGearbox ?? fallbackValue },
    { label: productPage.labels.carType, value: vehicleCarType ?? fallbackValue },
    { label: productPage.labels.driveTrain, value: vehicleDriveTrain ?? fallbackValue },
    { label: productPage.labels.fuelType, value: vehicleFuelType ?? fallbackValue },
    { label: productPage.labels.power, value: vehiclePower ?? fallbackValue },
    { label: productPage.labels.condition, value: vehicleCondition ?? fallbackValue },
    { label: productPage.labels.vin, value: vehicleVin ?? fallbackValue },
    { label: productPage.labels.color, value: vehicleColor ?? fallbackValue },
    { label: productPage.labels.interiorColor, value: vehicleInteriorColor ?? fallbackValue },
    { label: productPage.labels.internalReference, value: listingReference || fallbackValue },
    { label: productPage.labels.licenseNumber, value: vehicleLicense ?? fallbackValue },
  ]

  const collectionData = primaryCollection
    ? await shopify.request<CollectionResponse>(GET_RELATED_PRODUCTS_IN_COLLECTION, {
        variables: {
          handle: primaryCollection.handle,
          sortKey: 'BEST_SELLING',
          reverse: false,
          first: 4,
        },
      })
    : null

  const similarCars =
    collectionData?.data?.collection?.products.edges
      .map(edge => edge.node)
      .filter(collectionProduct => collectionProduct.handle !== handle)
      .slice(0, 3) ?? []
  const listingCount = collectionData?.data?.collection?.products.edges.length ?? 1
  const listingCountLabel = `${listingCount} ${
    listingCount === 1
      ? productPage.labels.listingForSaleSingular
      : productPage.labels.listingsForSalePlural
  }`

  return (
    <>
      <SiteHeader />

      <nav className="hidden border-b border-gray-90 bg-background md:block">
        <div className="mx-auto flex max-w-listing items-center gap-2 px-4 py-3 font-heading text-13 text-gray-33 md:px-6 xl:px-0">
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
        <div className="mx-auto max-w-listing px-0 pt-0 md:pt-6">
          <ImageGallery images={images} />
        </div>
      </div>

      <nav className="border-b border-gray-90 bg-background md:hidden">
        <div className="mx-auto flex max-w-listing items-center gap-1 px-4 py-3 font-heading text-13 text-gray-33">
          <Link href="/" className="transition-colors hover:text-foreground">
            {productPage.breadcrumb.home}
          </Link>
          <ChevronRight className="size-3 text-gray-60" />
          <Link href={showroomHref} className="transition-colors hover:text-foreground">
            {showroomLabel}
          </Link>
          <ChevronRight className="size-3 text-gray-60" />
          <span className="truncate text-foreground">{product.title}</span>
        </div>
      </nav>

      <section className="bg-background">
        <div className="mx-auto max-w-listing px-4 py-6 md:px-6 md:py-10 xl:px-0">
          <div className="grid grid-cols-1 items-start gap-12 xl:grid-cols-4">
            <div className="flex flex-col gap-8 xl:col-span-3">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between md:gap-6">
                <div className="flex flex-col gap-1">
                  <h1 className="font-display text-2xl leading-tight text-gray-7 md:text-section md:leading-tight">
                    {product.title}
                  </h1>
                  <p className="font-body text-15 text-gray-33">
                    {vehicleLocation ?? showroomLabel}
                  </p>
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

              <div className="overflow-x-auto border-y border-gray-90 py-4">
                <div className="flex min-w-max items-start gap-14">
                  {summarySpecs.map(spec => (
                    <div key={spec.label} className="flex flex-col">
                      <span className="font-body text-15 text-foreground">{spec.value}</span>
                      <span className="font-body text-15 text-gray-33">{spec.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {product.description && (
                <div className="border-t border-gray-90 pt-6 md:pt-8">
                  <h2 className="font-display text-xl text-gray-7 md:text-3xl">
                    {productPage.sections.aboutThisListing}
                  </h2>
                  <p className="mt-4 whitespace-pre-line font-body text-15 leading-relaxed text-gray-33">
                    {product.description}
                  </p>
                </div>
              )}

              <div className="border-t border-gray-90 pt-6 md:pt-8">
                <h2 className="font-display text-xl text-gray-7 md:text-3xl">
                  {productPage.sections.listingDetails}
                </h2>
                <dl className="mt-4 divide-y divide-gray-90 border-y border-gray-90">
                  {detailRows.map(row => (
                    <div key={row.label} className="flex items-start gap-8 py-3">
                      <dt className="w-40 shrink-0 font-body text-15 text-gray-33">{row.label}</dt>
                      <dd className="flex-1 font-body text-15 text-foreground">{row.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="border-t border-gray-90 pt-6 md:pt-8">
                <h2 className="font-display text-xl text-gray-7 md:text-3xl">
                  {productPage.sections.askAQuestion}
                </h2>

                <div className="mt-5 flex items-start gap-4">
                  <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-gray-98">
                    <User className="size-7 text-gray-33" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="font-body text-15 font-medium text-foreground">{sellerName}</p>
                    <p className="font-body text-13 text-gray-33">{dealerInfo.memberSinceLabel}</p>
                    <a
                      href={phoneHref}
                      className="mt-2 inline-flex items-center gap-1.5 font-body text-13 text-brand-green transition-opacity hover:opacity-80"
                    >
                      <Phone className="size-4" />
                      {productPage.labels.callAgent}
                    </a>
                  </div>
                </div>

                <p className="mt-8 font-heading text-15 font-semibold text-foreground">
                  {productPage.sections.contactAgent}
                </p>
                <div className="mt-3">
                  <ContactSection productTitle={product.title} />
                </div>
              </div>

              <div className="border-t border-gray-90 pt-6 md:pt-8">
                <h2 className="font-display text-xl text-gray-7 md:text-3xl">
                  {productPage.sections.forSaleBy}
                </h2>

                <div className="mt-5 flex items-center gap-3">
                  <Link
                    href={showroomHref}
                    className="font-body text-15 font-medium text-foreground transition-colors hover:text-brand-green"
                  >
                    {sellerName}
                  </Link>
                  <span className="font-body text-15 text-gray-33">{listingCountLabel}</span>
                </div>

                <div className="mt-6 flex flex-col gap-2">
                  <h3 className="font-body text-15 text-gray-33">
                    {productPage.labels.aboutDealer}
                  </h3>
                  <p className="line-clamp-3 font-body text-15 leading-relaxed text-foreground">
                    {dealerInfo.about}
                  </p>
                  <Link
                    href={showroomHref}
                    className="w-fit font-body text-15 text-foreground underline transition-colors hover:text-brand-green"
                  >
                    {productPage.labels.viewMore}
                  </Link>
                </div>

                <div className="mt-6 flex flex-col gap-4">
                  <div>
                    <h3 className="font-body text-15 text-gray-33">
                      {productPage.labels.listingAgent}
                    </h3>
                    <p className="mt-1 font-body text-15 text-foreground">
                      {dealerInfo.listingAgentValue}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-body text-15 text-gray-33">
                      {productPage.labels.registeredOnPlatform}
                    </h3>
                    <p className="mt-1 font-body text-15 text-foreground">
                      {dealerInfo.registeredYear}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-body text-15 text-gray-33">{productPage.labels.address}</h3>
                    <p className="mt-1 font-body text-15 text-foreground">
                      {dealerInfo.address || fallbackValue}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-body text-15 text-gray-33">
                      {productPage.labels.phoneNumber}
                    </h3>
                    <a
                      href={phoneHref}
                      className="mt-2 inline-flex items-center rounded-none border border-gray-90 px-4 py-2 font-heading text-13 font-semibold uppercase tracking-wide text-foreground transition-colors hover:bg-gray-98"
                    >
                      {productPage.labels.showPhoneNumber}
                    </a>
                  </div>

                  <div>
                    <h3 className="font-body text-15 text-gray-33">
                      {productPage.labels.internalReference}
                    </h3>
                    <p className="mt-1 font-body text-15 text-foreground">
                      {listingReference || fallbackValue}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-body text-15 text-gray-33">{productPage.labels.listed}</h3>
                    <p className="mt-1 font-body text-15 text-foreground">{listedDate}</p>
                  </div>

                  {sellerWebsite && (
                    <div>
                      <h3 className="font-body text-15 text-gray-33">
                        {productPage.labels.website}
                      </h3>
                      <a
                        href={sellerWebsite}
                        className="mt-1 inline-block font-body text-15 text-foreground underline transition-colors hover:text-brand-green"
                      >
                        {sellerWebsite}
                      </a>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-end">
                  <a
                    href={reportListingHref}
                    className="inline-flex items-center gap-2 border border-gray-90 px-4 py-2 font-heading text-13 font-semibold uppercase tracking-wide text-gray-33 transition-colors hover:bg-gray-98"
                  >
                    <TriangleAlert className="size-3.5" />
                    {productPage.labels.reportListing}
                  </a>
                </div>
              </div>
            </div>

            <aside className="xl:sticky xl:top-6 xl:col-span-1">
              <EnquiryForm
                productTitle={product.title}
                sellerName={sellerName}
                showroomHref={showroomHref}
                listingCountLabel={listingCountLabel}
              />
            </aside>
          </div>
        </div>
      </section>

      {similarCars.length > 0 && (
        <section className="border-t border-gray-90 bg-background py-12 md:py-16">
          <div className="mx-auto max-w-listing px-4 md:px-6 xl:px-0">
            <div className="mb-8 flex items-center justify-between md:mb-10">
              <h2 className="font-display text-2xl uppercase tracking-widest text-gray-7 md:text-section">
                {productPage.sections.youMayAlsoLike}
              </h2>
              <div className="hidden items-center gap-2 md:flex">
                <button
                  type="button"
                  disabled
                  className="flex size-10 items-center justify-center rounded-full border border-gray-90 text-gray-33 opacity-50"
                >
                  <ChevronLeft className="size-5" />
                </button>
                <button
                  type="button"
                  disabled
                  className="flex size-10 items-center justify-center rounded-full border border-gray-90 text-gray-33 opacity-50"
                >
                  <ChevronRight className="size-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {similarCars.map(car => {
                const cardImage = car.images.edges[0]?.node
                const cardPrice = formatPrice(
                  car.priceRange.minVariantPrice.amount,
                  car.priceRange.minVariantPrice.currencyCode
                )
                const cardLocation =
                  firstDefined(metafieldValue(car.originCountry), showroomLabel) ?? fallbackValue
                const cardPhotoCount = Math.max(1, car.images.edges.length)

                return (
                  <Link
                    key={car.id}
                    href={`/products/${car.handle}`}
                    className="group border border-gray-90 bg-background"
                  >
                    <div className="similar-listing-media relative overflow-hidden bg-gray-94">
                      {cardImage && (
                        <Image
                          src={cardImage.url}
                          alt={cardImage.altText ?? car.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(min-width: 1280px) 560px, (min-width: 768px) 33vw, 100vw"
                        />
                      )}
                      <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black-30 to-transparent" />
                      <div className="absolute right-3 top-3 flex size-10 items-center justify-center rounded-full bg-white-solid">
                        <Heart className="size-5 text-gray-7" strokeWidth={1.8} />
                      </div>
                      <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-md bg-black-40 px-2 py-1 font-heading text-11 uppercase tracking-wide text-white-solid">
                        <Images className="size-3.5" />
                        <span>1 / {cardPhotoCount}</span>
                      </div>
                    </div>

                    <div className="space-y-1 p-4">
                      <p className="font-heading text-lg font-semibold text-foreground">
                        {car.availableForSale ? cardPrice : productPage.labels.reserved}
                      </p>
                      <p className="font-body text-15 text-foreground">{car.title}</p>
                      <p className="font-body text-13 text-gray-33">{cardLocation}</p>
                    </div>
                  </Link>
                )
              })}
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
        <div className="mx-auto max-w-listing px-4 md:px-6 xl:px-0">
          <h2 className="mb-8 font-display text-2xl uppercase tracking-widest text-gray-7 md:mb-10 md:text-section">
            {productPage.sections.relatedStories}
          </h2>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {relatedStories.map(story => (
              <Link key={story.id} href={story.href} className="group flex items-start gap-4">
                <div className="story-row-media relative w-44 shrink-0 overflow-hidden bg-gray-94">
                  <Image
                    src={story.image}
                    alt={story.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(min-width: 1280px) 195px, (min-width: 768px) 30vw, 100vw"
                  />
                </div>

                <div className="flex min-w-0 flex-col gap-2">
                  <p className="font-heading text-11 uppercase tracking-wide text-gray-33">
                    {story.date} · {story.category}
                  </p>
                  <h3 className="line-clamp-2 font-body text-15 leading-relaxed text-foreground transition-colors group-hover:text-brand-green">
                    {story.title}
                  </h3>
                  <p className="line-clamp-2 font-body text-13 leading-relaxed text-gray-33">
                    {story.excerpt}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

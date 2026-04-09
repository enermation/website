import { Phone, User } from 'lucide-react'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CarCard } from '@/components/car-card'
import { SiteHeader } from '@/components/site-header'
import { StripeBar } from '@/components/stripe-bar'
import { Badge } from '@/components/ui/badge'
import {
  dealerInfo,
  footerContactInfo,
  primaryShowroomCollectionHandle,
  primaryShowroomCollectionHref,
  productPage,
  relatedStories,
} from '@/lib/data'
import { GET_PRODUCT_BY_HANDLE, GET_PRODUCTS_IN_COLLECTION } from '@/lib/queries'
import client from '@/lib/shopify'
import type { ShopifyProduct } from '@/lib/types'
import { cn } from '@/lib/utils'
import { ContactSection } from './contact-section'
import { EnquiryForm } from './enquiry-form'
import { ImageGallery } from './image-gallery'

// Response types

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

// Metadata

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>
}): Promise<Metadata> {
  const { handle } = await params
  const { data } = await client.request<ProductResponse>(GET_PRODUCT_BY_HANDLE, {
    variables: { handle },
  })
  if (!data?.product) return {}
  return {
    title: `${data.product.title} | Enermation`,
    description: data.product.description.slice(0, 160),
  }
}

// Page

export default async function ProductPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params

  const [{ data: productData }, { data: collectionData }] = await Promise.all([
    client.request<ProductResponse>(GET_PRODUCT_BY_HANDLE, {
      variables: { handle },
    }),
    client.request<CollectionResponse>(GET_PRODUCTS_IN_COLLECTION, {
      variables: { handle: primaryShowroomCollectionHandle },
    }),
  ])

  if (!productData?.product) notFound()

  const product = productData.product
  const images = product.images.edges.map(e => e.node)

  const { amount, currencyCode } = product.priceRange.minVariantPrice
  const price = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currencyCode,
  }).format(parseFloat(amount))

  const firstVariant = product.variants.edges[0]?.node
  const specOptions =
    firstVariant?.selectedOptions?.filter(o => o.name !== 'Title' && o.value !== 'Default Title') ??
    []

  const similarCars =
    collectionData?.collection?.products.edges
      .map(e => e.node)
      .filter(p => p.handle !== handle)
      .slice(0, 3) ?? []

  return (
    <>
      <SiteHeader />

      {/* Breadcrumb */}
      <nav className="bg-background border-b border-gray-90">
        <div className="max-w-site mx-auto px-6 py-3 flex items-center gap-2 font-heading text-13 text-gray-33">
          <Link href="/" className="hover:text-foreground transition-colors">
            {productPage.breadcrumb.home}
          </Link>
          <span>/</span>
          <Link
            href={primaryShowroomCollectionHref}
            className="hover:text-foreground transition-colors"
          >
            {productPage.breadcrumb.showroom}
          </Link>
          <span>/</span>
          <span className="text-foreground truncate">{product.title}</span>
        </div>
      </nav>

      {/* Mosaic gallery */}
      <div className="bg-background">
        <div className="max-w-site mx-auto px-6 pt-6">
          <ImageGallery images={images} />
        </div>
      </div>

      {/* Main body - 2-column */}
      <section className="bg-background">
        <div className="max-w-site mx-auto px-6 py-10">
          <div className="grid grid-cols-4 gap-10 items-start">
            {/* Left column (3/4) */}
            <div className="col-span-3 flex flex-col gap-8">
              {/* Title + price */}
              <div className="flex justify-between items-start gap-6">
                <div className="flex flex-col gap-1">
                  {product.vendor && (
                    <p className="font-body text-13 uppercase tracking-widest text-gray-33">
                      {product.vendor}
                    </p>
                  )}
                  <h1 className="font-display font-normal text-3xl text-gray-7 leading-snug">
                    {product.title}
                  </h1>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <p className="font-heading font-semibold text-2xl text-foreground whitespace-nowrap">
                    {product.availableForSale ? price : productPage.labels.reserved}
                  </p>
                  <Badge
                    variant="outline"
                    className={cn(
                      'font-heading font-semibold uppercase tracking-wide rounded-none h-auto px-3 py-1',
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

              {/* Specs bar */}
              {specOptions.length > 0 && (
                <div className="flex border-y border-gray-90">
                  {specOptions.map((opt, i) => (
                    <div
                      key={opt.name}
                      className={cn(
                        'flex flex-col gap-0.5 px-6 py-4 flex-1',
                        i > 0 && 'border-l border-gray-90',
                        i === 0 && 'pl-0'
                      )}
                    >
                      <span className="font-display font-normal text-lg text-gray-7">
                        {opt.value}
                      </span>
                      <span className="font-body text-13 text-gray-33">{opt.name}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* About this listing */}
              {product.description && (
                <div className="flex flex-col gap-3">
                  <h2 className="font-display font-normal text-xl text-gray-7">
                    {productPage.sections.aboutThisListing}
                  </h2>
                  <p className="font-body text-15 text-gray-33 leading-relaxed whitespace-pre-line">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Listing details */}
              <div className="flex flex-col gap-3">
                <h2 className="font-display font-normal text-xl text-gray-7">
                  {productPage.sections.listingDetails}
                </h2>
                <dl className="divide-y divide-gray-90">
                  {product.vendor && (
                    <div className="flex justify-between py-3">
                      <dt className="font-body text-13 text-gray-33">{productPage.labels.brand}</dt>
                      <dd className="font-body text-13 text-foreground">{product.vendor}</dd>
                    </div>
                  )}
                  {specOptions.map(opt => (
                    <div key={opt.name} className="flex justify-between py-3">
                      <dt className="font-body text-13 text-gray-33">{opt.name}</dt>
                      <dd className="font-body text-13 text-foreground">{opt.value}</dd>
                    </div>
                  ))}
                  <div className="flex justify-between py-3">
                    <dt className="font-body text-13 text-gray-33">{productPage.labels.status}</dt>
                    <dd
                      className={cn(
                        'font-body text-13',
                        product.availableForSale ? 'text-brand-green' : 'text-gray-33'
                      )}
                    >
                      {product.availableForSale
                        ? productPage.labels.available
                        : productPage.labels.soldOrReserved}
                    </dd>
                  </div>
                  <div className="flex justify-between py-3">
                    <dt className="font-body text-13 text-gray-33">{productPage.labels.price}</dt>
                    <dd className="font-heading font-semibold text-13 text-foreground">
                      {product.availableForSale ? price : productPage.labels.reserved}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Ask a Question */}
              <div className="flex flex-col gap-4">
                <h2 className="font-display font-normal text-xl text-gray-7">
                  {productPage.sections.askAQuestion}
                </h2>
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center size-10 rounded-full bg-gray-90 shrink-0">
                    <User className="size-5 text-gray-33" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="font-body font-medium text-13 text-foreground">
                      {dealerInfo.name}
                    </p>
                    <p className="font-body text-13 text-gray-33">
                      {productPage.labels.specialistExportBroker}
                    </p>
                    <a
                      href={`tel:${footerContactInfo.phone.replace(/\s/g, '')}`}
                      className="flex items-center gap-1.5 font-body text-13 text-brand-green hover:opacity-80 transition-opacity mt-1"
                    >
                      <Phone className="size-3.5" />
                      {productPage.labels.callUs}
                    </a>
                  </div>
                </div>
              </div>

              {/* Contact Agent */}
              <div className="flex flex-col gap-3">
                <h2 className="font-display font-normal text-xl text-gray-7">
                  {productPage.sections.contactAgent}
                </h2>
                <ContactSection productTitle={product.title} />
              </div>

              {/* For Sale By */}
              <div className="flex flex-col gap-4 border-t border-gray-90 pt-8">
                <h2 className="font-display font-normal text-xl text-gray-7">
                  {productPage.sections.forSaleBy}
                </h2>

                <div className="flex flex-col gap-1">
                  <Link
                    href={primaryShowroomCollectionHref}
                    className="font-body font-medium text-13 text-foreground hover:text-brand-green transition-colors"
                  >
                    {dealerInfo.name}
                  </Link>
                </div>

                <div className="flex flex-col gap-1">
                  <p className="font-body font-medium text-13 text-gray-33">About</p>
                  <p className="font-body text-13 text-foreground leading-relaxed">
                    {dealerInfo.about}
                  </p>
                </div>

                <dl className="divide-y divide-gray-90">
                  <div className="flex flex-col gap-0.5 py-3">
                    <dt className="font-body text-13 text-gray-33">{productPage.labels.address}</dt>
                    <dd className="font-body text-13 text-foreground">{dealerInfo.address}</dd>
                  </div>
                  <div className="flex flex-col gap-0.5 py-3">
                    <dt className="font-body text-13 text-gray-33">
                      {productPage.labels.phoneNumber}
                    </dt>
                    <dd>
                      <a
                        href={`tel:${footerContactInfo.phone.replace(/\s/g, '')}`}
                        className="font-body text-13 text-foreground hover:text-brand-green transition-colors"
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
                        className="font-body text-13 text-foreground hover:text-brand-green transition-colors"
                      >
                        {footerContactInfo.email}
                      </a>
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Right sidebar (1/4) */}
            <aside className="col-span-1 sticky top-6 flex flex-col gap-5 border border-gray-90 p-6">
              {/* Dealer info at top (mirrors Figma agent block) */}
              <div className="flex items-start gap-3 pb-4 border-b border-gray-90">
                <div className="flex items-center justify-center size-10 rounded-full bg-gray-90 shrink-0">
                  <User className="size-5 text-gray-33" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <p className="font-body font-medium text-13 text-foreground">{dealerInfo.name}</p>
                  <p className="font-body text-13 text-gray-33">
                    {productPage.labels.specialistDealer}
                  </p>
                  <a
                    href={`tel:${footerContactInfo.phone.replace(/\s/g, '')}`}
                    className="flex items-center gap-1.5 font-body text-13 text-brand-green hover:opacity-80 transition-opacity mt-1"
                  >
                    <Phone className="size-3.5" />
                    {productPage.labels.callAgent}
                  </a>
                </div>
              </div>

              {/* Enquiry form */}
              <EnquiryForm productTitle={product.title} />

              {/* Dealer footer in sidebar */}
              <div className="border-t border-gray-90 pt-4">
                <Link
                  href={primaryShowroomCollectionHref}
                  className="font-body text-13 text-foreground hover:text-brand-green transition-colors"
                >
                  {dealerInfo.name} - {productPage.labels.viewAllStock}
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* You May Also Like */}
      {similarCars.length > 0 && (
        <section className="bg-gray-98 py-16">
          <div className="max-w-site mx-auto px-6">
            <div className="flex items-center justify-between mb-10">
              <h2 className="font-display font-normal text-section uppercase tracking-widest text-gray-7">
                {productPage.sections.youMayAlsoLike}
              </h2>
              <StripeBar />
            </div>
            <div className="grid grid-cols-3 gap-6">
              {similarCars.map(car => (
                <CarCard key={car.id} product={car} />
              ))}
            </div>
            <div className="flex justify-center mt-12">
              <Link
                href={primaryShowroomCollectionHref}
                className="font-heading font-semibold text-13 uppercase tracking-wider border-2 border-foreground text-foreground px-8 py-3 hover:bg-foreground hover:text-background transition-colors"
              >
                {productPage.labels.viewAllStockForSale}
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Related Stories */}
      <section className="bg-background py-16 border-t border-gray-90">
        <div className="max-w-site mx-auto px-6">
          <h2 className="font-display font-normal text-section uppercase tracking-widest text-gray-7 mb-10">
            {productPage.sections.relatedStories}
          </h2>
          <div className="grid grid-cols-3 gap-6">
            {relatedStories.map(story => (
              <Link key={story.id} href={story.href} className="flex flex-col gap-3 group">
                <div className="relative aspect-[3/2] overflow-hidden bg-gray-94">
                  <Image
                    src={story.image}
                    alt={story.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(min-width: 1280px) 400px, 33vw"
                  />
                </div>
                <div className="flex items-center gap-2 font-heading text-13 text-gray-33">
                  <span>{story.date}</span>
                  <span>|</span>
                  <span>{story.category}</span>
                </div>
                <h3 className="font-display font-normal text-base text-gray-7 leading-snug group-hover:text-brand-green transition-colors">
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

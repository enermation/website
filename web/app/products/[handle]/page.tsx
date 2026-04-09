import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Calendar, Gauge, Palette, Armchair, User, Phone } from "lucide-react"
import type { Metadata } from "next"
import client from "@/lib/shopify"
import { GET_PRODUCT_BY_HANDLE, GET_PRODUCTS_IN_COLLECTION } from "@/lib/queries"
import type { ShopifyProduct } from "@/lib/types"
import { SiteHeader } from "@/components/site-header"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  footerContactInfo,
  dealerInfo,
  relatedStories,
  primaryShowroomCollectionHandle,
  primaryShowroomCollectionHref,
} from "@/lib/data"
import { ImageGallery } from "./image-gallery"
import { EnquiryForm } from "./enquiry-form"
import { ContactSection } from "./contact-section"

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

// Shared primitives

function StripeBar() {
  return (
    <div className="flex items-center">
      <div className="h-1 w-10 bg-brand-green" />
      <div className="h-1 w-10 bg-white border border-gray-87" />
      <div className="h-1 w-10 bg-brand-red" />
    </div>
  )
}

// Similar car card

function CarCard({ product }: { product: ShopifyProduct }) {
  const image = product.images.edges[0]?.node
  const { amount, currencyCode } = product.priceRange.minVariantPrice
  const price = new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: currencyCode,
  }).format(parseFloat(amount))

  const firstVariant = product.variants.edges[0]?.node
  const variantTitle =
    firstVariant?.title && firstVariant.title !== "Default Title"
      ? firstVariant.title
      : null

  return (
    <Link href={`/products/${product.handle}`} className="flex flex-col group">
      <div className="relative aspect-[3/2] overflow-hidden bg-gray-94 shrink-0">
        {image && (
          <Image
            src={image.url}
            alt={image.altText ?? product.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(min-width: 1280px) 400px, (min-width: 768px) 33vw, 100vw"
          />
        )}
      </div>

      <h3 className="font-inter font-normal text-xl text-gray-7 mt-3 px-1 leading-snug">
        {product.title}
      </h3>

      <div className="grid grid-cols-2 border-t border-gray-87 mt-3 pt-2 gap-y-1">
        {product.vendor && (
          <div className="flex items-center gap-2 px-2 py-1">
            <Palette className="size-3.5 text-gray-7 shrink-0" />
            <span className="font-roboto font-medium text-13 text-black truncate">
              {product.vendor}
            </span>
          </div>
        )}
        {variantTitle && (
          <div className="flex items-center gap-2 px-2 py-1">
            <Armchair className="size-3.5 text-gray-7 shrink-0" />
            <span className="font-roboto font-medium text-13 text-black truncate">
              {variantTitle}
            </span>
          </div>
        )}
        <div className="flex items-center gap-2 px-2 py-1">
          <Gauge className="size-3.5 text-gray-7 shrink-0" />
          <span className="font-roboto font-medium text-13 text-black">
            {product.availableForSale ? "Available" : "Sold"}
          </span>
        </div>
        <div className="flex items-center gap-2 px-2 py-1">
          <Calendar className="size-3.5 text-gray-7 shrink-0" />
          <span className="font-roboto font-medium text-13 text-black">2025</span>
        </div>
      </div>

      <div className="flex flex-col flex-1 px-1 mt-3 pb-4">
        <p className="font-roboto text-15 text-gray-33 leading-relaxed line-clamp-2 flex-1">
          {product.description}
        </p>
        <p className="font-montserrat font-semibold text-lg text-black mt-3">
          {product.availableForSale ? price : "Reserved - More Wanted"}
        </p>
      </div>
    </Link>
  )
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

export default async function ProductPage({
  params,
}: {
  params: Promise<{ handle: string }>
}) {
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
  const images = product.images.edges.map((e) => e.node)

  const { amount, currencyCode } = product.priceRange.minVariantPrice
  const price = new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: currencyCode,
  }).format(parseFloat(amount))

  const firstVariant = product.variants.edges[0]?.node
  const specOptions =
    firstVariant?.selectedOptions?.filter(
      (o) => o.name !== "Title" && o.value !== "Default Title"
    ) ?? []

  const similarCars =
    collectionData?.collection?.products.edges
      .map((e) => e.node)
      .filter((p) => p.handle !== handle)
      .slice(0, 3) ?? []

  return (
    <>
      <SiteHeader />

      {/* Breadcrumb */}
      <nav className="bg-white border-b border-gray-90">
        <div className="max-w-site mx-auto px-6 py-3 flex items-center gap-2 font-montserrat text-13 text-gray-33">
          <Link href="/" className="hover:text-black transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href={primaryShowroomCollectionHref} className="hover:text-black transition-colors">
            Showroom
          </Link>
          <span>/</span>
          <span className="text-black truncate">{product.title}</span>
        </div>
      </nav>

      {/* Mosaic gallery */}
      <div className="bg-white">
        <div className="max-w-site mx-auto px-6 pt-6">
          <ImageGallery images={images} />
        </div>
      </div>

      {/* Main body - 2-column */}
      <section className="bg-white">
        <div className="max-w-site mx-auto px-6 py-10">
          <div className="grid grid-cols-4 gap-10 items-start">

            {/* Left column (3/4) */}
            <div className="col-span-3 flex flex-col gap-8">

              {/* Title + price */}
              <div className="flex justify-between items-start gap-6">
                <div className="flex flex-col gap-1">
                  {product.vendor && (
                    <p className="font-roboto text-13 uppercase tracking-widest text-gray-33">
                      {product.vendor}
                    </p>
                  )}
                  <h1 className="font-inter font-normal text-3xl text-gray-7 leading-snug">
                    {product.title}
                  </h1>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <p className="font-montserrat font-semibold text-2xl text-black whitespace-nowrap">
                    {product.availableForSale ? price : "Reserved"}
                  </p>
                  <Badge
                    variant="outline"
                    className={cn(
                      "font-montserrat font-semibold uppercase tracking-wide rounded-none h-auto px-3 py-1",
                      product.availableForSale
                        ? "border-brand-green text-brand-green"
                        : "border-gray-33 text-gray-33"
                    )}
                  >
                    {product.availableForSale ? "Available" : "Sold"}
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
                        "flex flex-col gap-0.5 px-6 py-4 flex-1",
                        i > 0 && "border-l border-gray-90",
                        i === 0 && "pl-0"
                      )}
                    >
                      <span className="font-inter font-normal text-lg text-gray-7">
                        {opt.value}
                      </span>
                      <span className="font-roboto text-13 text-gray-33">
                        {opt.name}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* About this listing */}
              {product.description && (
                <div className="flex flex-col gap-3">
                  <h2 className="font-inter font-normal text-xl text-gray-7">
                    About This Listing
                  </h2>
                  <p className="font-roboto text-15 text-gray-33 leading-relaxed whitespace-pre-line">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Listing details */}
              <div className="flex flex-col gap-3">
                <h2 className="font-inter font-normal text-xl text-gray-7">
                  Listing Details
                </h2>
                <dl className="divide-y divide-gray-90">
                  {product.vendor && (
                    <div className="flex justify-between py-3">
                      <dt className="font-roboto text-13 text-gray-33">Brand</dt>
                      <dd className="font-roboto text-13 text-black">{product.vendor}</dd>
                    </div>
                  )}
                  {specOptions.map((opt) => (
                    <div key={opt.name} className="flex justify-between py-3">
                      <dt className="font-roboto text-13 text-gray-33">{opt.name}</dt>
                      <dd className="font-roboto text-13 text-black">{opt.value}</dd>
                    </div>
                  ))}
                  <div className="flex justify-between py-3">
                    <dt className="font-roboto text-13 text-gray-33">Status</dt>
                    <dd className={cn(
                      "font-roboto text-13",
                      product.availableForSale ? "text-brand-green" : "text-gray-33"
                    )}>
                      {product.availableForSale ? "Available" : "Sold / Reserved"}
                    </dd>
                  </div>
                  <div className="flex justify-between py-3">
                    <dt className="font-roboto text-13 text-gray-33">Price</dt>
                    <dd className="font-montserrat font-semibold text-13 text-black">
                      {product.availableForSale ? price : "Reserved"}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Ask a Question */}
              <div className="flex flex-col gap-4">
                <h2 className="font-inter font-normal text-xl text-gray-7">
                  Ask a Question
                </h2>
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center size-10 rounded-full bg-gray-90 shrink-0">
                    <User className="size-5 text-gray-33" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="font-roboto font-medium text-13 text-black">
                      {dealerInfo.name}
                    </p>
                    <p className="font-roboto text-13 text-gray-33">
                      Specialist vehicle export broker
                    </p>
                    <a
                      href={`tel:${footerContactInfo.phone.replace(/\s/g, "")}`}
                      className="flex items-center gap-1.5 font-roboto text-13 text-brand-green hover:opacity-80 transition-opacity mt-1"
                    >
                      <Phone className="size-3.5" />
                      Call Us
                    </a>
                  </div>
                </div>
              </div>

              {/* Contact Agent */}
              <div className="flex flex-col gap-3">
                <h2 className="font-inter font-normal text-xl text-gray-7">
                  Contact Agent
                </h2>
                <ContactSection productTitle={product.title} />
              </div>

              {/* For Sale By */}
              <div className="flex flex-col gap-4 border-t border-gray-90 pt-8">
                <h2 className="font-inter font-normal text-xl text-gray-7">
                  For Sale By
                </h2>

                <div className="flex flex-col gap-1">
                  <Link
                    href={primaryShowroomCollectionHref}
                    className="font-roboto font-medium text-13 text-black hover:text-brand-green transition-colors"
                  >
                    {dealerInfo.name}
                  </Link>
                </div>

                <div className="flex flex-col gap-1">
                  <p className="font-roboto font-medium text-13 text-gray-33">About</p>
                  <p className="font-roboto text-13 text-black leading-relaxed">
                    {dealerInfo.about}
                  </p>
                </div>

                <dl className="divide-y divide-gray-90">
                  <div className="flex flex-col gap-0.5 py-3">
                    <dt className="font-roboto text-13 text-gray-33">Address</dt>
                    <dd className="font-roboto text-13 text-black">{dealerInfo.address}</dd>
                  </div>
                  <div className="flex flex-col gap-0.5 py-3">
                    <dt className="font-roboto text-13 text-gray-33">Phone number</dt>
                    <dd>
                      <a
                        href={`tel:${footerContactInfo.phone.replace(/\s/g, "")}`}
                        className="font-roboto text-13 text-black hover:text-brand-green transition-colors"
                      >
                        {footerContactInfo.phone}
                      </a>
                    </dd>
                  </div>
                  <div className="flex flex-col gap-0.5 py-3">
                    <dt className="font-roboto text-13 text-gray-33">Email</dt>
                    <dd>
                      <a
                        href={`mailto:${footerContactInfo.email}`}
                        className="font-roboto text-13 text-black hover:text-brand-green transition-colors"
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
                  <p className="font-roboto font-medium text-13 text-black">
                    {dealerInfo.name}
                  </p>
                  <p className="font-roboto text-13 text-gray-33">Specialist dealer</p>
                  <a
                    href={`tel:${footerContactInfo.phone.replace(/\s/g, "")}`}
                    className="flex items-center gap-1.5 font-roboto text-13 text-brand-green hover:opacity-80 transition-opacity mt-1"
                  >
                    <Phone className="size-3.5" />
                    Call Agent
                  </a>
                </div>
              </div>

              {/* Enquiry form */}
              <EnquiryForm productTitle={product.title} />

              {/* Dealer footer in sidebar */}
              <div className="border-t border-gray-90 pt-4">
                <Link
                  href={primaryShowroomCollectionHref}
                  className="font-roboto text-13 text-black hover:text-brand-green transition-colors"
                >
                  {dealerInfo.name} - View all stock
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
              <h2 className="font-inter font-normal text-section uppercase tracking-widest text-gray-7">
                You May Also Like
              </h2>
              <StripeBar />
            </div>
            <div className="grid grid-cols-3 gap-6">
              {similarCars.map((car) => (
                <CarCard key={car.id} product={car} />
              ))}
            </div>
            <div className="flex justify-center mt-12">
              <Link
                href={primaryShowroomCollectionHref}
                className="font-montserrat font-semibold text-13 uppercase tracking-wider border-2 border-black text-black px-8 py-3 hover:bg-black hover:text-white transition-colors"
              >
                View all stock for sale
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Related Stories */}
      <section className="bg-white py-16 border-t border-gray-90">
        <div className="max-w-site mx-auto px-6">
          <h2 className="font-inter font-normal text-section uppercase tracking-widest text-gray-7 mb-10">
            Related Stories
          </h2>
          <div className="grid grid-cols-3 gap-6">
            {relatedStories.map((story) => (
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
                <div className="flex items-center gap-2 font-montserrat text-13 text-gray-33">
                  <span>{story.date}</span>
                  <span>|</span>
                  <span>{story.category}</span>
                </div>
                <h3 className="font-inter font-normal text-base text-gray-7 leading-snug group-hover:text-brand-green transition-colors">
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


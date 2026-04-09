import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { Calendar, Palette, Gauge, Armchair } from "lucide-react"
import client from "@/lib/shopify"
import { GET_PRODUCTS_IN_COLLECTION } from "@/lib/queries"
import type { ShopifyProduct } from "@/lib/types"
import { showroomSubNav, sortOptions } from "@/lib/data"
import { SiteHeader } from "@/components/site-header"
import { FilterBar } from "./filter-bar"
import { cn } from "@/lib/utils"

// ── Shopify response type ─────────────────────────────────────────────────────

type CollectionResponse = {
  collection: {
    id: string
    title: string
    products: { edges: { node: ShopifyProduct }[] }
  } | null
}

// ── Car card ─────────────────────────────────────────────────────────────────

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
  const variantParts = variantTitle?.split(" / ").map((part) => part.trim()) ?? []
  const variantYear =
    variantParts[0] && /^\d{4}$/.test(variantParts[0]) ? variantParts[0] : null
  const variantSummary = variantTitle
    ? variantParts.slice(variantYear ? 1 : 0).join(" / ") || variantTitle
    : null

  return (
    <Link href={`/products/${product.handle}`} className="flex flex-col group">
      {/* Image */}
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

      {/* Title */}
      <h3 className="font-inter font-normal text-xl text-gray-7 mt-3 px-1 leading-snug">
        {product.title}
      </h3>

      {/* Spec row */}
      <div className="grid grid-cols-2 border-t border-gray-87 mt-3 pt-2 gap-y-1">
        {product.vendor && (
          <div className="flex items-center gap-2 px-2 py-1">
            <Palette className="size-3.5 text-gray-7 shrink-0" />
            <span className="font-roboto font-medium text-13 text-black truncate">
              {product.vendor}
            </span>
          </div>
        )}
        {variantSummary && (
          <div className="flex items-center gap-2 px-2 py-1">
            <Armchair className="size-3.5 text-gray-7 shrink-0" />
            <span className="font-roboto font-medium text-13 text-black truncate">
              {variantSummary}
            </span>
          </div>
        )}
        <div className="flex items-center gap-2 px-2 py-1">
          <Gauge className="size-3.5 text-gray-7 shrink-0" />
          <span className="font-roboto font-medium text-13 text-black">
            {product.availableForSale ? "Available" : "Sold"}
          </span>
        </div>
        {variantYear && (
          <div className="flex items-center gap-2 px-2 py-1">
            <Calendar className="size-3.5 text-gray-7 shrink-0" />
            <span className="font-roboto font-medium text-13 text-black">{variantYear}</span>
          </div>
        )}
      </div>

      {/* Description + price */}
      <div className="flex flex-col flex-1 px-1 mt-3 pb-4">
        <p className="font-roboto text-15 text-gray-33 leading-relaxed line-clamp-2 flex-1">
          {product.description}
        </p>
        <p className="font-montserrat font-semibold text-lg text-black mt-3">
          {product.availableForSale ? price : "Reserved — More Wanted"}
        </p>
      </div>
    </Link>
  )
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

  const { data } = await client.request<CollectionResponse>(
    GET_PRODUCTS_IN_COLLECTION,
    { variables: { handle } }
  )

  if (!data?.collection) notFound()

  const { title, products: productData } = data.collection
  let products = productData.edges.map((e) => e.node)

  // Unique makes from vendor field
  const makes = [
    "Show All",
    ...Array.from(new Set(products.map((p) => p.vendor).filter(Boolean))).sort(),
  ]

  // Filter by make
  if (make && make !== "Show All") {
    products = products.filter((p) => p.vendor === make)
  }

  // Sort
  if (sort === "price-desc") {
    products = [...products].sort(
      (a, b) =>
        parseFloat(b.priceRange.minVariantPrice.amount) -
        parseFloat(a.priceRange.minVariantPrice.amount)
    )
  } else if (sort === "price-asc") {
    products = [...products].sort(
      (a, b) =>
        parseFloat(a.priceRange.minVariantPrice.amount) -
        parseFloat(b.priceRange.minVariantPrice.amount)
    )
  }

  return (
    <>
      <SiteHeader />

      {/* Sub-navigation */}
      <nav className="bg-white border-b border-gray-90">
        <div className="max-w-site mx-auto flex justify-center">
          {showroomSubNav.map((tab) => {
            const isActive = tab.href === `/collections/${handle}`
            return (
              <Link
                key={tab.label}
                href={tab.href}
                className={cn(
                  "font-montserrat font-semibold text-13 uppercase tracking-wide px-4 py-4 border-b-2 transition-colors",
                  isActive
                    ? "border-black text-black"
                    : "border-transparent text-black/36 hover:text-black/60"
                )}
              >
                {tab.label}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Page title — driven by Shopify collection title */}
      <section className="bg-white border-b border-gray-90 py-10 text-center">
        <h1 className="font-inter font-normal text-section uppercase tracking-widest text-gray-7">
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

      {/* Content */}
      <section className="bg-white py-6">
        <div className="max-w-site mx-auto px-3">
          <Suspense>
            <FilterBar makes={makes} currentMake={make} currentSort={sort} />
          </Suspense>

          {products.length === 0 ? (
            <p className="font-roboto text-15 text-gray-33 text-center py-24">
              No products found{make && make !== "Show All" ? ` for ${make}` : ""}.
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-6 mt-6">
              {products.map((product) => (
                <CarCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}

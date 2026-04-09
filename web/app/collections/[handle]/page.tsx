import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import client from "@/lib/shopify"
import { GET_PRODUCTS_IN_COLLECTION } from "@/lib/queries"
import type { ShopifyProduct } from "@/lib/types"
import { showroomSubNav } from "@/lib/data"
import { SiteHeader } from "@/components/site-header"
import { CarCard } from "@/components/car-card"
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

// ── Sort key mapping ──────────────────────────────────────────────────────────

function getSortConfig(sort?: string): { sortKey: string; reverse?: boolean } {
  switch (sort) {
    case "price-asc":
      return { sortKey: "PRICE", reverse: false }
    case "price-desc":
      return { sortKey: "PRICE", reverse: true }
    case "newest":
      return { sortKey: "CREATED", reverse: true }
    default:
      return { sortKey: "BEST_SELLING" }
  }
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
  const filter = make && make !== "Show All" ? [{ vendor: make }] : undefined

  const { data } = await client.request<CollectionResponse>(
    GET_PRODUCTS_IN_COLLECTION,
    { variables: { handle, sortKey, reverse, filter } }
  )

  if (!data?.collection) notFound()

  const { title, products: productData } = data.collection
  const products = productData.edges.map((e) => e.node)

  // Unique makes from vendor field
  const makes = [
    "Show All",
    ...Array.from(new Set(products.map((p) => p.vendor).filter(Boolean))).sort(),
  ]

  return (
    <>
      <SiteHeader />

      {/* Sub-navigation */}
      <nav className="bg-background border-b border-gray-90">
        <div className="max-w-site mx-auto flex justify-center">
          {showroomSubNav.map((tab) => {
            const isActive = tab.href === `/collections/${handle}`
            return (
              <Link
                key={tab.label}
                href={tab.href}
                className={cn(
                  "font-heading font-semibold text-13 uppercase tracking-wide px-4 py-4 border-b-2 transition-colors",
                  isActive
                    ? "border-foreground text-foreground"
                    : "border-transparent text-foreground/36 hover:text-foreground/60"
                )}
              >
                {tab.label}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Page title — driven by Shopify collection title */}
      <section className="bg-background border-b border-gray-90 py-10 text-center">
        <h1 className="font-display font-normal text-section uppercase tracking-widest text-gray-7">
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
      <section className="bg-background py-6">
        <div className="max-w-site mx-auto px-3">
          <Suspense>
            <FilterBar makes={makes} currentMake={make} currentSort={sort} />
          </Suspense>

          {products.length === 0 ? (
            <p className="font-body text-15 text-gray-33 text-center py-24">
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


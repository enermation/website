import {
  mdiCalendar,
  mdiCar,
  mdiCarShiftPattern,
  mdiChevronRight,
  mdiEmail,
  mdiSpeedometer,
} from '@mdi/js'
import { Icon } from '@mdi/react'
import Image from 'next/image'
import Link from 'next/link'
import { HeroCarousel } from '@/components/hero-carousel-wrapper'
import { SiteHeader } from '@/components/site-header'
import { InstagramIcon } from '@/components/social-icons'
import { StripeBar } from '@/components/stripe-bar'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { Card, CardContent } from '@/components/ui/card'
import {
  carsForSaleImage,
  instagramPosts,
  newsArticle,
  primaryShowroomCollectionHandle,
  primaryShowroomCollectionHref,
  productPage,
  sellYourCarImage,
  supplyingImage,
} from '@/lib/data'

import { GET_COLLECTIONS, GET_PRODUCTS_IN_COLLECTION } from '@/lib/queries'
import { getClient } from '@/lib/shopify'
import type { ShopifyCollection, ShopifyProduct } from '@/lib/types'
import { cn } from '@/lib/utils'

type CollectionProductsResponse = {
  collection: {
    id: string
    title: string
    products: { edges: { node: ShopifyProduct }[] }
  } | null
}

// ── Shared primitives ────────────────────────────────────────────────────────

function SectionHeading({ title, dark = false }: { title: string; dark?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-6 py-12">
      <h2
        className={cn(
          'font-display font-normal text-section uppercase tracking-widest text-center',
          dark ? 'text-on-dark' : 'text-heading'
        )}
      >
        {title}
      </h2>
      <StripeBar dark={dark} />
    </div>
  )
}

// ── Collection card (desktop) ─────────────────────────────────────────────────

function metaValue(field: { value: string | null } | null): string | null {
  return field?.value ?? null
}

function formatPrice(product: ShopifyProduct): string {
  const { amount, currencyCode } = product.priceRange.minVariantPrice

  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currencyCode,
  }).format(parseFloat(amount))
}

function LatestArrivalCard({ product }: { product: ShopifyProduct }) {
  const image = product.images.edges[0]?.node
  const details = [
    { icon: mdiCalendar, label: metaValue(product.year) },
    { icon: mdiCar, label: metaValue(product.colour) },
    { icon: mdiSpeedometer, label: metaValue(product.mileage) },
    { icon: mdiCarShiftPattern, label: metaValue(product.transmission) },
  ].filter(detail => detail.label)

  return (
    <Link href={`/products/${product.handle}`} className="group flex flex-col">
      <AspectRatio ratio={3 / 2} className="overflow-hidden bg-surface-elevated">
        {image && (
          <Image
            src={image.url}
            alt={image.altText ?? product.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(min-width: 1280px) 416px, (min-width: 768px) 33vw, 100vw"
          />
        )}
      </AspectRatio>

      <div className="flex flex-1 flex-col gap-3 px-1 pt-4">
        <h3 className="font-display text-xl leading-snug text-heading">{product.title}</h3>
        <p className="line-clamp-3 font-body text-15 leading-relaxed text-body">
          {product.description}
        </p>
        <p className="font-heading text-lg font-semibold text-foreground">
          {product.availableForSale ? formatPrice(product) : productPage.labels.reservedMoreWanted}
        </p>
      </div>

      {details.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-y-3 border-t border-subtle px-1 pt-3">
          {details.map(({ icon: iconPath, label }) => (
            <div key={label} className="flex items-center gap-2 pr-2">
              <Icon path={iconPath} size={1} className="size-3.5 shrink-0 text-heading" />
              <span className="truncate font-body text-13 font-medium text-foreground">
                {label}
              </span>
            </div>
          ))}
        </div>
      )}
    </Link>
  )
}

function CollectionCard({ collection }: { collection: ShopifyCollection }) {
  return (
    <Link href={`/collections/${collection.handle}`} className="flex flex-col group">
      <Card className="overflow-hidden p-0 ring-0">
        {collection.image && (
          <AspectRatio ratio={3 / 2} className="bg-surface-elevated">
            <Image
              src={collection.image.url}
              alt={collection.image.altText ?? collection.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(min-width: 1280px) 400px, (min-width: 768px) 33vw, 100vw"
            />
          </AspectRatio>
        )}
        <CardContent className="px-1 pt-3 pb-4 border-b border-subtle">
          <h3 className="font-display font-normal text-xl text-heading leading-snug">
            {collection.title}
          </h3>
          <p className="font-heading text-13 text-body mt-1 tracking-wide">Discover More</p>
        </CardContent>
      </Card>
    </Link>
  )
}

// ── Collection card (mobile) ──────────────────────────────────────────────────

function MobileCollectionCard({ collection }: { collection: ShopifyCollection }) {
  return (
    <Link
      href={`/collections/${collection.handle}`}
      className="block border-b border-subtle py-6 last:border-b-0"
    >
      <AspectRatio ratio={3 / 2} className="bg-surface-elevated mb-4">
        {collection.image && (
          <Image
            src={collection.image.url}
            alt={collection.image.altText ?? collection.title}
            fill
            className="object-cover"
            sizes="(max-width: 767px) calc(100vw - 1.5rem)"
          />
        )}
      </AspectRatio>
      <h3 className="mb-2 px-1 font-display text-2xl font-normal text-heading">
        {collection.title}
      </h3>
      <div className="flex items-center gap-2 px-1 font-heading text-13 text-body">
        <Icon path={mdiChevronRight} size={1} className="size-3 shrink-0" />
        <span>Discover More</span>
      </div>
    </Link>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function Home() {
  const shopify = await getClient()
  const [{ data: collectionsData }, { data: latestArrivalsData }] = await Promise.all([
    shopify.request<{
      collections: { edges: { node: ShopifyCollection }[] }
    }>(GET_COLLECTIONS),
    shopify.request<CollectionProductsResponse>(GET_PRODUCTS_IN_COLLECTION, {
      variables: {
        handle: primaryShowroomCollectionHandle,
        sortKey: 'CREATED',
        reverse: true,
        first: 6,
      },
    }),
  ])
  const collections = collectionsData?.collections.edges.map(e => e.node) ?? []
  const latestArrivals = latestArrivalsData?.collection?.products.edges.map(edge => edge.node) ?? []

  return (
    <>
      <SiteHeader />
      <main>
        {/* ── HERO ─────────────────────────────────────────────────────────── */}
        <HeroCarousel />

        {/* ── LATEST ARRIVALS / COLLECTIONS ─────────────────────────────── */}
        <section className="bg-card">
          <SectionHeading title="Latest Arrivals for Sale" />

          <div className="mx-auto max-w-site px-4 pb-14 md:px-6 md:pb-16">
            <div className="grid grid-cols-1 gap-y-10 md:grid-cols-3 md:gap-x-8 md:gap-y-12">
              {latestArrivals.map(product => (
                <LatestArrivalCard key={product.id} product={product} />
              ))}
            </div>
            <div className="mt-12 flex justify-center">
              <Link
                href={primaryShowroomCollectionHref}
                className="inline-flex shrink-0 items-center justify-center rounded-none border-2 border-strong bg-background px-8 py-3 font-heading font-semibold text-13 uppercase tracking-wider text-foreground transition-colors duration-200 hover:bg-foreground hover:text-background"
              >
                {productPage.labels.viewAllStockForSale}
              </Link>
            </div>
          </div>
        </section>

        <section className="bg-card">
          <SectionHeading title="Browse Our Collections" />

          {/* Mobile: collections list */}
          <div className="md:hidden px-3 pb-10">
            {collections.map(collection => (
              <MobileCollectionCard key={collection.id} collection={collection} />
            ))}
            <div className="flex justify-center mt-10">
              <Link
                href={primaryShowroomCollectionHref}
                className="inline-flex shrink-0 items-center justify-center rounded-none border-2 border-strong bg-background h-9 px-8 font-heading font-semibold text-13 uppercase tracking-wider text-foreground transition-colors duration-200 hover:bg-foreground hover:text-background"
              >
                View all collections
              </Link>
            </div>
          </div>

          {/* Desktop: collections grid */}
          <div className="hidden md:block max-w-site mx-auto px-6 pb-16">
            <div className="grid grid-cols-3 gap-8">
              {collections.map(collection => (
                <CollectionCard key={collection.id} collection={collection} />
              ))}
            </div>
            <div className="flex justify-center mt-12">
              <Link
                href={primaryShowroomCollectionHref}
                className="inline-flex shrink-0 items-center justify-center rounded-none border-2 border-strong bg-background h-9 px-8 font-heading font-semibold text-13 uppercase tracking-wider text-foreground transition-colors duration-200 hover:bg-foreground hover:text-background"
              >
                View all collections
              </Link>
            </div>
          </div>
        </section>

        {/* ── SUPPLYING THE FINEST SUPERCARS ────────────────────────────────── */}
        <section className="relative bg-surface-dark overflow-hidden">
          <Image src={supplyingImage} alt="" fill className="object-cover" aria-hidden="true" />
          <div
            className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/30"
            aria-hidden="true"
          />

          {/* Mobile layout: left-aligned, stacked heading */}
          <div className="md:hidden relative z-10 px-4 py-28">
            <h2 className="font-display font-normal text-banner uppercase tracking-widest text-on-dark leading-tight mb-8">
              Supplying
              <br />
              the
              <br />
              finest
              <br />
              Supercars
            </h2>
            <p className="font-body text-15 text-on-dark leading-relaxed mb-8">
              Based in Preston in Lancashire, close to Junction 31A of the M6 Motorway, Enermation
              stock a wide range of contemporary and classic Super Cars and sports cars for sale
              from such marques as Aston Martin, Bentley, Bugatti, Ferrari, Lamborghini, Pagani,
              Porsche and a great many more. Enermation Supercars are internationally renowned for
              offering a unique selection of some of the world&apos;s finest automobiles. With
              literally hundreds of beautiful cars supplied to a diverse customer base, Enermation
              is the premier and Number 1 Supercar dealer in the UK.
            </p>
            <Link
              href="/#about"
              className="inline-flex shrink-0 items-center justify-center rounded-none border-2 border-on-dark bg-transparent h-9 px-8 font-heading font-semibold text-13 uppercase tracking-wider text-on-dark transition-colors duration-200 hover:bg-on-dark hover:text-surface-dark"
            >
              Our Story
            </Link>
          </div>

          {/* Desktop layout: right-aligned half-width */}
          <div className="hidden md:flex relative z-10 max-w-site mx-auto py-32 px-20 justify-end">
            <div className="w-1/2 text-right">
              <h2 className="font-display font-normal text-banner uppercase tracking-widest text-on-dark leading-tight mb-8">
                Supplying the
                <br />
                finest Supercars
              </h2>
              <p className="font-body text-15 text-on-dark leading-relaxed mb-8">
                Based in Preston in Lancashire, close to Junction 31A of the M6 Motorway, Enermation
                stock a wide range of contemporary and classic Super Cars and sports cars for sale
                from such marques as Aston Martin, Bentley, Bugatti, Ferrari, Lamborghini, Pagani,
                Porsche and a great many more. Enermation Supercars are internationally renowned for
                offering a unique selection of some of the world&apos;s finest automobiles. With
                literally hundreds of beautiful cars supplied to a diverse customer base, Enermation
                is the premier and Number 1 Supercar dealer in the UK.
              </p>
              <Link
                href="/#about"
                className="inline-flex shrink-0 items-center justify-center rounded-none border-2 border-on-dark bg-transparent h-9 px-8 font-heading font-semibold text-13 uppercase tracking-wider text-on-dark transition-colors duration-200 hover:bg-on-dark hover:text-surface-dark"
              >
                Our Story
              </Link>
            </div>
          </div>
        </section>

        {/* ── CARS FOR SALE / SELL US YOUR CAR ─────────────────────────────── */}
        <section className="flex flex-col md:grid md:grid-cols-2">
          {[
            {
              image: carsForSaleImage,
              title: 'Cars For Sale',
              alt: 'A showroom floor filled with exotic supercars',
              href: primaryShowroomCollectionHref,
            },
            {
              image: sellYourCarImage,
              title: 'Sell Us Your Car',
              alt: 'A red Ferrari F40 — we buy supercars',
              href: '/#sell-your-car',
            },
          ].map(({ image, title, alt, href }) => (
            <Link key={title} href={href} className="relative overflow-hidden block">
              <div className="relative aspect-square md:aspect-video bg-surface-elevated">
                <Image
                  src={image}
                  alt={alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 767px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-black-40" />
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                <h2 className="font-display font-normal text-section uppercase tracking-widest text-on-dark">
                  {title}
                </h2>
                <p className="font-heading text-15 text-on-dark-muted tracking-widest">
                  Discover More
                </p>
                <div className="mt-4">
                  <StripeBar dark />
                </div>
              </div>
            </Link>
          ))}
        </section>

        {/* ── LATEST COMPANY NEWS ───────────────────────────────────────────── */}
        <section className="bg-card">
          <SectionHeading title="Latest Company News" />
        </section>

        {/* ── NEWS + INSTAGRAM + NEWSLETTER ────────────────────────────────── */}
        <section className="bg-muted py-16 px-4 md:pt-24 md:pb-16 md:px-20">
          <div className="max-w-site mx-auto">
            {/* Two-column layout on desktop, stacked on mobile */}
            <div className="flex flex-col gap-10 md:grid md:grid-cols-12 mb-16 md:mb-20">
              {/* Featured article */}
              <article className="md:col-span-7 md:pr-16">
                <AspectRatio ratio={3 / 2} className="w-full rounded overflow-hidden mb-6">
                  <Image
                    src={newsArticle.image}
                    alt={newsArticle.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 767px) 100vw, (min-width: 1280px) 730px, 55vw"
                  />
                </AspectRatio>

                <div className="flex items-center gap-3 mb-4 font-heading text-13 text-muted tracking-wide">
                  <span className="flex items-center gap-1.5">
                    <Icon path={mdiCalendar} size={1} className="size-3 shrink-0" />
                    {newsArticle.date}
                  </span>
                  <span className="opacity-40">|</span>
                  <span>{newsArticle.category}</span>
                </div>

                <h3 className="font-display font-normal text-3xl text-heading leading-tight mb-4">
                  {newsArticle.title}
                </h3>
                <p className="font-body text-15 text-body leading-relaxed mb-8">
                  {newsArticle.excerpt}
                </p>

                <Link
                  href="/news"
                  className="inline-flex shrink-0 items-center justify-center rounded-none border-2 border-strong bg-background h-9 px-8 font-heading font-semibold text-13 uppercase tracking-wider text-foreground transition-colors duration-200 hover:bg-foreground hover:text-background"
                >
                  Read More
                </Link>
              </article>

              {/* Instagram feed */}
              <div className="md:col-span-5 md:border-l md:border-border md:pl-8">
                <h3 className="font-display font-medium text-2xl text-heading uppercase tracking-widest mb-3 text-center md:text-left">
                  Enermation on Instagram
                </h3>
                <div className="flex items-center gap-2 mb-5 justify-center md:justify-start">
                  <InstagramIcon className="size-3 text-foreground shrink-0" />
                  <span className="font-heading text-13 text-foreground">
                    Follow us @enermation
                  </span>
                </div>
                {/* 3-col on mobile, 4-col on desktop */}
                <div className="grid grid-cols-3 md:grid-cols-4 gap-px">
                  {instagramPosts.map(post => (
                    <AspectRatio
                      key={post.id}
                      ratio={1}
                      className="overflow-hidden bg-surface-elevated"
                    >
                      <Image
                        src={post.image}
                        alt=""
                        fill
                        className="object-cover hover:opacity-80 transition-opacity"
                        sizes="(max-width: 767px) 33vw, (min-width: 1280px) 120px, 10vw"
                      />
                    </AspectRatio>
                  ))}
                </div>
              </div>
            </div>

            {/* Newsletter */}
            <div className="border-t border-border pt-12 flex flex-col items-center gap-3">
              <h3 className="font-display font-medium text-2xl text-heading uppercase tracking-widest">
                Newsletter
              </h3>
              <p className="font-heading text-13 text-body text-center">
                Stay up to date with our news and latest stock
              </p>
              <Link
                href="/#newsletter"
                className="mt-3 inline-flex items-center gap-1.5 shrink-0 justify-center rounded-none border-2 border-strong bg-foreground h-9 px-8 font-heading font-semibold text-13 uppercase tracking-wider text-background transition-colors duration-200 hover:bg-muted hover:border-muted"
              >
                Mailing list sign up
                <Icon path={mdiEmail} size={1} className="size-3.5" />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}

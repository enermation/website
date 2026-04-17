import { mdiChevronRight, mdiInstagram } from '@mdi/js'
import { Icon } from '@mdi/react'
import Image from 'next/image'
import Link from 'next/link'
import { Suspense } from 'react'
import { AnimatedSection, InstagramGrid } from '@/components/animated-section'
import { HeroCarousel } from '@/components/hero-carousel-wrapper'
import { InstagramTile } from '@/components/instagram-tile'
import { LatestArrivalsCarousel } from '@/components/latest-arrivals-carousel'
import { SiteHeader } from '@/components/site-header'
import { StripeBar } from '@/components/stripe-bar'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  primaryShowroomCollectionHandle,
  primaryShowroomCollectionHref,
  productPage,
} from '@/lib/data'
import { getInstagramFeed } from '@/lib/instagram'

import { fetchCollectionProducts, fetchCollections } from '@/lib/shopify'
import type { ShopifyCollection } from '@/lib/types'
import { cn } from '@/lib/utils'

type HomePageProps = {
  searchParams: Promise<{ slide?: string }>
}

// ── Shared primitives ────────────────────────────────────────────────────────

function SectionHeading({ title, dark = false }: { title: string; dark?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-6 py-12">
      <h2
        className={cn(
          'font-display font-normal text-section uppercase tracking-tight text-center',
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
        <Icon path={mdiChevronRight} size={1} className="size-3 shrink-0" aria-hidden="true" />
        <span>Discover More</span>
      </div>
    </Link>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

function HomePageSkeleton() {
  return (
    <div className="flex flex-col">
      <Skeleton className="h-dvh w-full rounded-none" />
      <div className="mx-auto w-full max-w-site px-4 py-20 md:px-6">
        <div className="mb-12 flex flex-col items-center gap-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-1 w-32" />
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <Skeleton className="aspect-3/2 w-full" />
          <Skeleton className="aspect-3/2 w-full" />
          <Skeleton className="aspect-3/2 w-full" />
        </div>
      </div>
    </div>
  )
}

export default async function Home({ searchParams }: HomePageProps) {
  return (
    <>
      <Suspense fallback={null}>
        <SiteHeader />
      </Suspense>
      <main id="main-content">
        <Suspense fallback={<HomePageSkeleton />}>
          <HomePageContent searchParams={searchParams} />
        </Suspense>
      </main>
    </>
  )
}

async function HomePageContent({ searchParams }: HomePageProps) {
  const params = await searchParams
  const slideIndex = Math.min(Math.max(Number(params.slide) || 0, 0), 2)

  const [collections, latestArrivalsCollection] = await Promise.all([
    fetchCollections(),
    fetchCollectionProducts(primaryShowroomCollectionHandle, {
      sortKey: 'CREATED',
      reverse: true,
      first: 6,
    }),
  ])

  // vercel-react-best-practices: server-serialization
  // Map bulky ShopifyProduct to minimal client-side format to reduce RSC payload
  const latestArrivals = (latestArrivalsCollection?.products ?? []).map(product => ({
    id: product.id,
    handle: product.handle,
    title: product.title,
    description: product.description,
    availableForSale: product.availableForSale,
    priceRange: product.priceRange,
    images: {
      edges: product.images.edges.slice(0, 1).map(edge => ({
        node: {
          url: edge.node.url,
          altText: edge.node.altText,
        },
      })),
    },
    // Only include specific metafields used by the carousel
    year: product.year ? { value: product.year.value } : null,
    colour: product.colour ? { value: product.colour.value } : null,
    mileage: product.mileage ? { value: product.mileage.value } : null,
    transmission: product.transmission ? { value: product.transmission.value } : null,
  }))

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <HeroCarousel initialIndex={slideIndex} />

      {/* ── LATEST ARRIVALS / COLLECTIONS ─────────────────────────────── */}
      <AnimatedSection className="bg-card">
        <SectionHeading title="Latest Arrivals for Sale" />

        <div className="mx-auto max-w-site px-4 pb-14 md:px-6 md:pb-16">
          <LatestArrivalsCarousel products={latestArrivals} />
          <div className="mt-12 flex justify-center" data-reveal>
            <Link
              href={primaryShowroomCollectionHref}
              className="inline-flex shrink-0 items-center justify-center rounded-none border-2 border-strong bg-background px-8 py-3 font-heading font-semibold text-13 uppercase tracking-wider text-foreground transition-colors duration-200 hover:bg-foreground hover:text-background"
            >
              {productPage.labels.viewAllStockForSale}
            </Link>
          </div>
        </div>
      </AnimatedSection>

      <AnimatedSection className="bg-card">
        <SectionHeading title="Browse Our Collections" />

        {/* Mobile: collections list */}
        <div className="md:hidden px-3 pb-10">
          {collections.map(collection => (
            <MobileCollectionCard key={collection.id} collection={collection} />
          ))}
          <div className="flex justify-center mt-10" data-reveal>
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
            {collections.map((collection, index) => (
              <div key={collection.id} data-reveal style={{ animationDelay: `${index * 0.1}s` }}>
                <CollectionCard collection={collection} />
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-12" data-reveal>
            <Link
              href={primaryShowroomCollectionHref}
              className="inline-flex shrink-0 items-center justify-center rounded-none border-2 border-strong bg-background h-9 px-8 font-heading font-semibold text-13 uppercase tracking-wider text-foreground transition-colors duration-200 hover:bg-foreground hover:text-background"
            >
              View all collections
            </Link>
          </div>
        </div>
      </AnimatedSection>

      {/* ── INSTAGRAM FEED ───────────────────────────────────────────────── */}
      {/* async-suspense-boundaries: Nested suspense to avoid blocking top content */}
      <Suspense fallback={null}>
        <InstagramSection />
      </Suspense>
    </>
  )
}

async function InstagramSection() {
  const instagramFeed = await getInstagramFeed()
  const { posts: instagramPosts, username: igUsername, followersCount: igFollowers } = instagramFeed

  if (instagramPosts.length === 0) return null

  return (
    <AnimatedSection className="bg-muted py-16 px-4 md:py-20 md:px-20" stagger={0.1}>
      <div className="max-w-site mx-auto">
        <InstagramGrid>
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {/* Connect With Us + Profile — merged, spans 2 cols */}
            <a
              href={`https://www.instagram.com/${igUsername}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="group col-span-2 flex flex-col items-center justify-center gap-6 rounded-xl bg-card p-8 transition-colors duration-200 hover:bg-accent"
              data-instagram-item
            >
              <span className="font-display font-normal text-2xl text-heading leading-snug">
                Connect With Us Online
              </span>
              <div className="flex flex-col items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                  <Icon
                    path={mdiInstagram}
                    size={1}
                    className="size-5 text-foreground"
                    aria-hidden="true"
                  />
                </div>
                <div className="text-center">
                  <p className="font-heading font-semibold text-sm text-heading">@{igUsername}</p>
                  <p className="font-heading text-13 text-muted-foreground">
                    {igFollowers.toLocaleString()} Followers
                  </p>
                </div>
                <span className="inline-flex items-center justify-center rounded-none border-2 border-strong bg-foreground px-5 py-1.5 font-heading font-semibold text-13 uppercase tracking-wider text-background transition-colors duration-200 group-hover:bg-background group-hover:text-foreground">
                  Follow
                </span>
              </div>
            </a>

            {/* Post tiles */}
            {instagramPosts.map(post => (
              <InstagramTile
                key={post.id}
                href={post.permalink}
                mediaUrl={post.mediaUrl}
                thumbnailUrl={post.sizes?.medium?.mediaUrl ?? post.mediaUrl}
                alt={post.altText ?? post.prunedCaption ?? ''}
                isReel={post.isReel ?? post.mediaType === 'VIDEO'}
              />
            ))}
          </div>
        </InstagramGrid>
      </div>
    </AnimatedSection>
  )
}

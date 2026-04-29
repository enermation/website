import { ChevronRightIcon } from 'lucide-react'
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

function SectionHeading({ title, dark = false }: { title: string; dark?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-6 py-12">
      <h2
        className={cn(
          'font-display font-normal text-section text-center uppercase tracking-tight',
          dark ? 'text-on-dark' : 'text-heading'
        )}
      >
        {title}
      </h2>
      <StripeBar dark={dark} />
    </div>
  )
}

function CollectionCard({ collection }: { collection: ShopifyCollection }) {
  return (
    <Link href={`/collections/${collection.handle}`} className="group flex flex-col">
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
        <CardContent className="border-b border-subtle px-1 pt-3 pb-4">
          <h3 className="font-display text-xl leading-snug font-normal text-heading">
            {collection.title}
          </h3>
          <p className="mt-1 font-heading text-13 tracking-wide text-body">Discover More</p>
        </CardContent>
      </Card>
    </Link>
  )
}

function MobileCollectionCard({ collection }: { collection: ShopifyCollection }) {
  return (
    <Link
      href={`/collections/${collection.handle}`}
      className="block border-b border-subtle py-6 last:border-b-0"
    >
      <AspectRatio ratio={3 / 2} className="mb-4 bg-surface-elevated">
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
        <ChevronRightIcon className="size-3 shrink-0" aria-hidden="true" />
        <span>Discover More</span>
      </div>
    </Link>
  )
}

function SectionSkeleton() {
  return (
    <section className="bg-card">
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
    </section>
  )
}

export default function Home() {
  return (
    <>
      <Suspense fallback={null}>
        <SiteHeader isHomePage />
      </Suspense>
      <main id="main-content">
        <HeroCarousel />
        <Suspense fallback={<SectionSkeleton />}>
          <LatestArrivalsSection />
        </Suspense>
        <Suspense fallback={<SectionSkeleton />}>
          <CollectionsSection />
        </Suspense>
        <Suspense fallback={null}>
          <InstagramSection />
        </Suspense>
      </main>
    </>
  )
}

async function LatestArrivalsSection() {
  const latestArrivalsCollection = await fetchCollectionProducts(primaryShowroomCollectionHandle, {
    first: 6,
  })

  const latestArrivals = latestArrivalsCollection?.products ?? []

  return (
    <AnimatedSection className="bg-card">
      <SectionHeading title="Latest Arrivals for Sale" />

      <div className="mx-auto max-w-site px-4 pb-14 md:px-6 md:pb-16">
        <LatestArrivalsCarousel products={latestArrivals} />
        <div className="mt-12 flex justify-center" data-reveal>
          <Link
            href={primaryShowroomCollectionHref}
            className="inline-flex shrink-0 items-center justify-center rounded-none border-2 border-strong bg-background px-8 py-3 font-heading text-13 font-semibold uppercase tracking-wider text-foreground transition-colors duration-200 hover:bg-foreground hover:text-background"
          >
            {productPage.labels.viewAllStockForSale}
          </Link>
        </div>
      </div>
    </AnimatedSection>
  )
}

async function CollectionsSection() {
  const collections = await fetchCollections()

  return (
    <AnimatedSection className="bg-card">
      <SectionHeading title="Browse Our Collections" />

      <div className="px-3 pb-10 md:hidden">
        {collections.map(collection => (
          <MobileCollectionCard key={collection.id} collection={collection} />
        ))}
        <div className="mt-10 flex justify-center" data-reveal>
          <Link
            href={primaryShowroomCollectionHref}
            className="inline-flex shrink-0 items-center justify-center rounded-none border-2 border-strong bg-background h-9 px-8 font-heading text-13 font-semibold uppercase tracking-wider text-foreground transition-colors duration-200 hover:bg-foreground hover:text-background"
          >
            View all collections
          </Link>
        </div>
      </div>

      <div className="mx-auto hidden max-w-site px-6 pb-16 md:block">
        <div className="grid grid-cols-3 gap-8">
          {collections.map(collection => (
            <div key={collection.id} data-reveal>
              <CollectionCard collection={collection} />
            </div>
          ))}
        </div>
        <div className="mt-12 flex justify-center" data-reveal>
          <Link
            href={primaryShowroomCollectionHref}
            className="inline-flex shrink-0 items-center justify-center rounded-none border-2 border-strong bg-background h-9 px-8 font-heading text-13 font-semibold uppercase tracking-wider text-foreground transition-colors duration-200 hover:bg-foreground hover:text-background"
          >
            View all collections
          </Link>
        </div>
      </div>
    </AnimatedSection>
  )
}

async function InstagramSection() {
  const instagramFeed = await getInstagramFeed()
  const { posts: instagramPosts, username: igUsername, followersCount: igFollowers } = instagramFeed

  if (instagramPosts.length === 0) return null

  return (
    <AnimatedSection className="bg-muted px-4 py-16 md:px-20 md:py-20">
      <div className="mx-auto max-w-site">
        <InstagramGrid>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-4">
            <a
              href={`https://www.instagram.com/${igUsername}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="group col-span-2 flex flex-col items-center justify-center gap-6 rounded-xl bg-card p-8 transition-colors duration-200 hover:bg-accent"
              data-instagram-item
            >
              <span className="font-display text-2xl font-normal leading-snug text-heading">
                Connect With Us Online
              </span>
              <div className="flex flex-col items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                  <img
                    src="/instagram-logo.svg"
                    alt="Instagram"
                    width={20}
                    height={20}
                    className="size-5 text-foreground"
                    aria-hidden="true"
                  />
                </div>
                <div className="text-center">
                  <p className="font-heading text-sm font-semibold text-heading">@{igUsername}</p>
                  <p className="font-heading text-13 text-muted-foreground">
                    {igFollowers.toLocaleString()} Followers
                  </p>
                </div>
                <span className="inline-flex items-center justify-center rounded-none border-2 border-strong bg-foreground px-5 py-1.5 font-heading text-13 font-semibold uppercase tracking-wider text-background transition-colors duration-200 group-hover:bg-background group-hover:text-foreground">
                  Follow
                </span>
              </div>
            </a>

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

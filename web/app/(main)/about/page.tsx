import Image from 'next/image'
import Link from 'next/link'
import { Suspense } from 'react'
import { SiteHeader } from '@/components/site-header'
import { StripeBar } from '@/components/stripe-bar'
import { aboutData, type NarrativeSection } from '@/lib/about-data'
import { cn } from '@/lib/utils'

// ── Shared primitives ────────────────────────────────────────────────────────

function SectionHeading({
  title,
  dark = false,
  centered = true,
}: {
  title: string
  dark?: boolean
  centered?: boolean
}) {
  return (
    <div className={cn('flex flex-col gap-6 py-8', centered ? 'items-center' : 'items-start')}>
      <h2
        className={cn(
          'font-display font-normal text-section uppercase tracking-widest',
          centered ? 'text-center' : 'text-left',
          dark ? 'text-on-dark' : 'text-heading'
        )}
      >
        {title}
      </h2>
      <StripeBar dark={dark} />
    </div>
  )
}

// ── Narrative Row ────────────────────────────────────────────────────────────

function NarrativeRow({ section }: { section: NarrativeSection }) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center py-12 lg:py-20',
        section.reverse && 'lg:direction-rtl'
      )}
    >
      {/* Image Column */}
      <div
        data-reveal
        className={cn(
          'relative aspect-3-2 bg-surface-elevated overflow-hidden',
          section.reverse && 'lg:direction-ltr'
        )}
      >
        <Image
          src={section.image.url}
          alt={section.image.altText}
          fill
          className="object-cover"
          sizes="(min-width: 1024px) 50vw, 100vw"
        />
      </div>

      {/* Text Column */}
      <div data-reveal className={cn('flex flex-col gap-6', section.reverse && 'lg:direction-ltr')}>
        <SectionHeading title={section.heading} centered={false} />
        <div className="flex flex-col gap-4">
          {section.paragraphs.map(p => (
            <p key={p.slice(0, 32)} className="font-body text-15 text-body leading-relaxed">
              {p}
            </p>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AboutPage() {
  return (
    <>
      <Suspense fallback={null}>
        <SiteHeader />
      </Suspense>

      <main className="flex-1" data-slot="about-page">
        {/* HERO SECTION */}
        <div className="bg-surface py-20 lg:py-32">
          <div className="mx-auto max-w-site px-4 md:px-6 text-center">
            <h1
              data-reveal
              className="font-display font-normal text-banner uppercase tracking-[0.2em] text-heading mb-8"
            >
              {aboutData.hero.title}
            </h1>
            <div data-reveal className="flex justify-center mb-8">
              <StripeBar />
            </div>
            <p
              data-reveal
              className="mx-auto max-w-2xl font-heading text-lg lg:text-xl text-body uppercase tracking-widest leading-relaxed"
            >
              {aboutData.hero.description}
            </p>
          </div>
        </div>

        {/* NARRATIVE SECTIONS */}
        <div className="bg-card">
          <div className="mx-auto max-w-site px-4 md:px-6">
            {aboutData.sections.map(section => (
              <NarrativeRow key={section.heading} section={section} />
            ))}
          </div>
        </div>

        {/* CTA SECTION */}
        <div className="bg-muted py-20 lg:py-24">
          <div className="mx-auto max-w-site px-4 md:px-6 text-center">
            <div data-reveal className="mb-10">
              <SectionHeading title="Ready to Find Your Next Masterpiece?" />
            </div>
            <div data-reveal>
              <Link
                href={aboutData.cta.href}
                className="inline-flex shrink-0 items-center justify-center rounded-none border-2 border-strong bg-background px-10 py-4 font-heading font-semibold text-15 uppercase tracking-wider text-foreground transition-colors duration-200 hover:bg-foreground hover:text-background"
              >
                {aboutData.cta.label}
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

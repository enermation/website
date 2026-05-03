'use client'

import {
  BuildingOffice2Icon,
  CameraIcon,
  GlobeAltIcon,
  PlayCircleIcon,
} from '@heroicons/react/24/outline'
import {
  Award,
  ChevronRight,
  ClipboardCheck,
  Globe2,
  Headphones,
  type LucideIcon,
  Mail,
  MapPin,
  MessageCircle,
  ShieldCheck,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { type ComponentType, Suspense, type SVGProps } from 'react'

import { FooterOfficeMap } from '@/components/footer-office-map'
import {
  footerBrandSummary,
  footerContactInfo,
  footerExportSolutions,
  footerGlobalMarkets,
  footerLegalLinks,
  footerProofPoints,
  footerQuickLinks,
  footerQuoteCta,
  footerSocialLinks,
  primaryShowroomCollectionHref,
} from '@/lib/data'
import type { FooterNavGroup } from '@/lib/header-navigation'

const proofPointIcons: Record<(typeof footerProofPoints)[number]['icon'], LucideIcon> = {
  badge: Award,
  globe: Globe2,
  shield: ShieldCheck,
  support: Headphones,
}

const socialIcons: Record<
  (typeof footerSocialLinks)[number]['platform'],
  ComponentType<SVGProps<SVGSVGElement>>
> = {
  email: CameraIcon,
  quote: BuildingOffice2Icon,
  website: GlobeAltIcon,
  whatsapp: PlayCircleIcon,
}

type SiteFooterProps = {
  exploreGroups: FooterNavGroup[]
}

type FooterLinkColumnProps = {
  title: string
  links: { label: string; href: string }[]
  ariaLabel: string
}

function FaviconMark() {
  return (
    <svg className="size-16" viewBox="-8 -8 224 252" aria-hidden="true">
      <defs>
        <linearGradient
          id="footer-favicon-g1"
          gradientUnits="userSpaceOnUse"
          x1="76.9469"
          y1="95.7725"
          x2="216.4974"
          y2="95.7725"
          gradientTransform="matrix(1 0 0 -1 -13.5469 288.0856)"
        >
          <stop offset="0" stopColor="#939598" />
          <stop offset="0.303" stopColor="#9A9C9F" />
          <stop offset="0.7452" stopColor="#AEB0B2" />
          <stop offset="1" stopColor="#BCBEC0" />
        </linearGradient>
        <linearGradient
          id="footer-favicon-g2"
          gradientUnits="userSpaceOnUse"
          x1="21.4379"
          y1="189.2285"
          x2="217.0018"
          y2="189.2285"
          gradientTransform="matrix(1 0 0 -1 -13.5469 288.0856)"
        >
          <stop offset="0" stopColor="#939598" />
          <stop offset="0.3036" stopColor="#9A9C9F" />
          <stop offset="0.7485" stopColor="#AEB0B2" />
          <stop offset="1" stopColor="#BCBEC0" />
        </linearGradient>
      </defs>
      <path
        fill="url(#footer-favicon-g1)"
        d="M63.4,220.5c13-7.8,23.5-14.2,34.2-20.4c29.3-17.2,58.5-34.4,87.9-51.3c13.1-7.6,15.6-5.4,17.1,9.4c2.1,21.4-5.1,35.9-25.3,45.4c-17.2,8.8-35.4,19.4-52.5,30.1c-13.7,8.5-26.4,8.6-39.6-0.3C79.1,229.2,72.6,225.9,63.4,220.5z"
      />
      <path
        fill="url(#footer-favicon-g2)"
        d="M8,121.1c0-15.9,0.2-31.8-0.1-47.7c-0.3-14.5,6.9-24.3,22.2-30c18.2-6.8,35.6-15.8,50.2-28.5C93.9,3,107.9,1.1,121.7,9c22.7,13.1,45.5,25.9,68,39.3c19.6,11.7,18.3,39.5-4.2,48.6c-56.2,22.7-105.7,58.6-155.3,93.4c-11,7.7-21.3,0.8-21.8-15.1C7.6,157.2,8.1,139.2,8,121.1C8.1,121.1,8,121.1,8,121.1z M148.2,76.3c0-2.1-0.1-2.6-0.1-4.8c-13.2-7.3-26-15.5-39.8-21.4C98.9,46,46.9,77.3,45.8,87.8c-1.6,15-0.4,30.4-0.4,49.4C81.5,115.7,114.8,96,148.2,76.3z"
      />
    </svg>
  )
}

function BrandMark() {
  return (
    <Link
      href="/"
      data-slot="footer-brand-mark"
      className="group inline-flex items-center gap-5 min-w-0"
      aria-label="Enermation home"
    >
      <span className="shrink-0" aria-hidden="true">
        <FaviconMark />
      </span>
      <span className="flex flex-col border-l border-footer-muted pl-4">
        <span className="font-heading text-3xl font-bold uppercase leading-none tracking-widest text-on-dark overflow-wrap-break-word md:text-4xl">
          Enermation
        </span>
        <span className="mt-2 font-heading text-xs font-bold uppercase tracking-widest text-footer-accent overflow-wrap-break-word">
          Sustainable, Innovative and Reliable
        </span>
      </span>
    </Link>
  )
}

function FooterSectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div data-slot="footer-section-title" className="mb-6">
      <h2 className="font-heading text-sm sm:text-base md:text-lg font-bold uppercase tracking-wide text-on-dark">
        {children}
      </h2>
      <div className="mt-4 h-1 w-9 bg-footer-accent" aria-hidden="true" />
    </div>
  )
}

function FooterLinkColumn({ title, links, ariaLabel }: FooterLinkColumnProps) {
  return (
    <nav data-slot="footer-link-column" className="min-w-0" aria-label={ariaLabel}>
      <FooterSectionTitle>{title}</FooterSectionTitle>
      <ul className="flex flex-col">
        {links.map(link => (
          <li key={`${title}-${link.href}-${link.label}`} className="border-b border-footer-line">
            <Link
              href={link.href}
              className="group flex items-center gap-4 py-4 font-body text-sm sm:text-base text-on-dark-muted transition-colors hover:text-footer-accent"
            >
              <ChevronRight
                className="size-4 shrink-0 text-footer-accent transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              />
              <span>{link.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}

function FooterMarketColumn() {
  return (
    <section data-slot="footer-market-column" className="min-w-0" aria-label="Global markets">
      <FooterSectionTitle>Global Markets</FooterSectionTitle>
      <ul className="flex flex-col">
        {footerGlobalMarkets.map(market => (
          <li key={market} className="border-b border-footer-line">
            <div className="flex items-center gap-4 py-4 font-body text-sm sm:text-base text-on-dark-muted">
              <ChevronRight className="size-4 shrink-0 text-footer-accent" aria-hidden="true" />
              <span>{market}</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

function ProofPoints() {
  return (
    <ul
      data-slot="footer-proof-points"
      className="grid min-w-0 grid-cols-2 gap-7 sm:grid-cols-4 lg:grid-cols-4"
    >
      {footerProofPoints.map(point => {
        const Icon = proofPointIcons[point.icon]
        return (
          <li
            key={point.label}
            className="flex flex-col items-center gap-3 text-center sm:items-start sm:text-left"
          >
            <Icon
              className="size-6 sm:size-9 text-footer-accent"
              strokeWidth={1.6}
              aria-hidden="true"
            />
            <span className="max-w-20 truncate font-heading text-xs sm:text-sm font-semibold uppercase leading-snug text-on-dark">
              {point.label}
            </span>
          </li>
        )
      })}
    </ul>
  )
}

function ContactPanel() {
  return (
    <div data-slot="footer-contact-panel" className="flex min-w-0 flex-col gap-6">
      <FooterSectionTitle>Contact</FooterSectionTitle>

      <ul className="flex flex-col divide-y divide-footer-line">
        <li>
          <a
            href={footerContactInfo.whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex min-w-0 items-center gap-3 sm:gap-6 py-3"
          >
            <MessageCircle
              className="size-6 sm:size-8 shrink-0 text-footer-accent"
              strokeWidth={1.6}
              aria-hidden="true"
            />
            <span className="flex min-w-0 flex-col">
              <span className="font-body text-xs sm:text-sm text-on-dark-muted">WhatsApp</span>
              <span className="font-heading text-sm sm:text-base font-bold text-footer-accent transition-colors group-hover:text-footer-accent-bright truncate">
                {footerContactInfo.phone}
              </span>
            </span>
          </a>
        </li>
        <li>
          <a
            href={footerContactInfo.emailHref}
            className="group flex min-w-0 items-center gap-3 sm:gap-6 py-3 sm:py-5"
          >
            <Mail
              className="size-6 sm:size-8 shrink-0 text-footer-accent"
              strokeWidth={1.6}
              aria-hidden="true"
            />
            <span className="flex min-w-0 flex-col">
              <span className="font-body text-xs sm:text-sm text-on-dark-muted">Email</span>
              <span className="font-heading text-sm sm:text-base font-bold text-footer-accent transition-colors group-hover:text-footer-accent-bright truncate">
                {footerContactInfo.email}
              </span>
            </span>
          </a>
        </li>
        <li className="flex min-w-0 items-center gap-3 sm:gap-6 py-3 sm:py-5">
          <MapPin
            className="size-6 sm:size-8 shrink-0 text-footer-accent"
            strokeWidth={1.6}
            aria-hidden="true"
          />
          <span className="flex min-w-0 flex-col">
            <span className="font-body text-xs sm:text-sm text-on-dark-muted">Location</span>
            <span className="font-heading text-sm sm:text-base font-bold text-footer-accent truncate">
              {footerContactInfo.location}
            </span>
            <span className="font-body text-xs sm:text-sm text-on-dark-muted truncate">
              {footerContactInfo.region}
            </span>
          </span>
        </li>
      </ul>

      <Link
        href={footerQuoteCta.href}
        className="footer-dot-card group flex min-w-0 items-center gap-3 sm:gap-6 rounded-lg border border-footer-accent p-3 sm:p-6 transition-colors hover:border-footer-accent-bright"
      >
        <ClipboardCheck
          className="size-8 sm:size-10 shrink-0 text-footer-accent"
          strokeWidth={1.5}
          aria-hidden="true"
        />
        <span className="flex min-w-0 flex-col gap-2 sm:gap-3">
          <span className="font-body text-sm sm:text-base leading-snug text-on-dark">
            {footerQuoteCta.title}
          </span>
          <span className="font-heading text-xs sm:text-sm font-bold uppercase tracking-wide text-footer-accent transition-colors group-hover:text-footer-accent-bright">
            {footerQuoteCta.label} -&gt;
          </span>
        </span>
      </Link>
    </div>
  )
}

function FooterSocialLinks() {
  return (
    <div data-slot="footer-social-links" className="flex items-center gap-4">
      <span className="font-body text-base text-on-dark-muted">Follow Us</span>
      <ul className="flex items-center gap-4">
        {footerSocialLinks.map(link => {
          const Icon = socialIcons[link.platform]
          return (
            <li key={link.platform}>
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex size-9 items-center justify-center rounded-full border border-footer-accent text-footer-accent transition-colors hover:bg-footer-accent hover:text-footer-dark"
                aria-label={link.label}
              >
                <Icon className="size-5" strokeWidth={1.8} aria-hidden="true" />
              </a>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function Copyright() {
  return (
    <p className="font-body text-base text-on-dark-muted">
      © {new Date().getFullYear()} Enermation. All rights reserved.
    </p>
  )
}

function resolvedQuickLinks(exploreGroups: FooterNavGroup[]) {
  const collectionLinks = exploreGroups.flatMap(group => group.children)

  return footerQuickLinks.map(link => {
    if (!link.href.startsWith('/collections/')) return link

    return {
      ...link,
      href: resolveCollectionHref(collectionLinks, link.label) ?? resolveExistingFallback(link),
    }
  })
}

function resolvedExportLinks(exploreGroups: FooterNavGroup[]) {
  const collectionLinks = exploreGroups.flatMap(group => group.children)

  return footerExportSolutions.map(link => {
    if (link.label === 'Vehicle Export') {
      return {
        ...link,
        href: resolveCollectionHref(collectionLinks, 'Shop All') ?? primaryShowroomCollectionHref,
      }
    }

    if (link.label === 'Heavy Machinery Export') {
      return {
        ...link,
        href:
          resolveCollectionHref(collectionLinks, 'Heavy Machinery') ??
          '/search?q=heavy%20machinery',
      }
    }

    if (link.label === 'Auto Parts Sourcing') {
      return {
        ...link,
        href: resolveCollectionHref(collectionLinks, 'Parts') ?? '/search?q=auto%20parts',
      }
    }

    return link
  })
}

function resolveExistingFallback(link: { label: string; href: string }) {
  if (link.href === primaryShowroomCollectionHref) return primaryShowroomCollectionHref
  return `/search?q=${encodeURIComponent(link.label)}`
}

function resolveCollectionHref(collectionLinks: { label: string; href: string }[], label: string) {
  const targetTerms = categoryTerms(label)
  const match = collectionLinks.find(link => {
    const normalizedLabel = normalize(link.label)
    const normalizedHref = normalize(link.href)
    return targetTerms.some(term => normalizedLabel.includes(term) || normalizedHref.includes(term))
  })

  return match?.href
}

function normalize(value: string) {
  return value.toLowerCase().replaceAll('-', ' ').replaceAll('%20', ' ')
}

function categoryTerms(label: string) {
  const normalized = normalize(label)
  const aliases: Record<string, string[]> = {
    cars: ['cars', 'automobiles', 'residential automobiles'],
    'commercial vehicles': ['commercial vehicles', 'commercial'],
    'heavy duty trucks': ['heavy duty trucks', 'truck'],
    'heavy machinery': ['heavy machinery', 'heavy machineries', 'machinery'],
    parts: ['parts', 'spare parts'],
    'shop all': ['shop all'],
  }

  return aliases[normalized] ?? [normalized]
}

export function SiteFooter({ exploreGroups }: SiteFooterProps) {
  const pathname = usePathname()

  if (pathname === '/miles') return null

  const quickLinks = resolvedQuickLinks(exploreGroups)
  const exportLinks = resolvedExportLinks(exploreGroups)

  return (
    <footer
      data-slot="site-footer"
      className="relative z-10 overflow-hidden bg-footer-dark text-on-dark"
    >
      <div className="grain-overlay">
        <div className="footer-main-grid mx-auto grid max-w-listing gap-12 px-6 py-16 lg:gap-14 lg:px-16 lg:py-24">
          <section
            data-slot="footer-brand-panel"
            className="flex min-w-0 flex-col gap-10 border-footer-line lg:border-r lg:pr-12"
            aria-label="Enermation footer summary"
          >
            <BrandMark />
            <p className="max-w-sm font-body text-base sm:text-lg lg:text-xl leading-relaxed text-on-dark-muted">
              {footerBrandSummary}
            </p>
            <ProofPoints />
          </section>

          <FooterLinkColumn title="Quick Links" links={quickLinks} ariaLabel="Quick links" />
          <FooterLinkColumn
            title="Export Solutions"
            links={exportLinks}
            ariaLabel="Export solutions"
          />
          <FooterMarketColumn />
          <ContactPanel />
        </div>

        <div className="mx-auto max-w-listing border-t border-footer-line px-6 py-10 lg:px-16">
          <FooterOfficeMap className="max-w-site" />
        </div>

        <div className="border-t border-footer-line">
          <div className="mx-auto flex max-w-listing flex-col gap-8 px-6 py-8 lg:flex-row lg:items-center lg:justify-between lg:px-16">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:gap-8">
              <Suspense fallback={null}>
                <Copyright />
              </Suspense>
              <nav aria-label="Legal links">
                <ul className="flex flex-wrap items-center gap-5">
                  {footerLegalLinks.map(link => (
                    <li key={link.href} className="flex items-center gap-5">
                      <span
                        className="hidden h-5 w-px bg-footer-accent md:block"
                        aria-hidden="true"
                      />
                      <Link
                        href={link.href}
                        className="font-body text-base text-on-dark-muted transition-colors hover:text-footer-accent"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
            <FooterSocialLinks />
          </div>
        </div>
      </div>
    </footer>
  )
}

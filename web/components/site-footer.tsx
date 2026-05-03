'use client'

import {
  Award,
  ChevronRight,
  ClipboardCheck,
  Globe,
  Headphones,
  type LucideIcon,
  Mail,
  MapPin,
  ShieldCheck,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Suspense } from 'react'

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 551.034 551.034"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id="insta-grad"
          gradientUnits="userSpaceOnUse"
          x1="275.517"
          y1="4.5714"
          x2="275.517"
          y2="549.7202"
          gradientTransform="matrix(1 0 0 -1 0 554)"
        >
          <stop offset="0" stopColor="#E09B3D" />
          <stop offset="0.3" stopColor="#C74C4D" />
          <stop offset="0.6" stopColor="#C21975" />
          <stop offset="1" stopColor="#7024C4" />
        </linearGradient>
      </defs>
      <path
        style="fill:url(#insta-grad);"
        d="M386.878,0H164.156C73.64,0,0,73.64,0,164.156v222.722 c0,90.516,73.64,164.156,164.156,164.156h222.722c90.516,0,164.156-73.64,164.156-164.156V164.156 C551.033,73.64,477.393,0,386.878,0z M495.6,386.878c0,60.045-48.677,108.722-108.722,108.722H164.156 c-60.045,0-108.722-48.677-108.722-108.722V164.156c0-60.046,48.677-108.722,108.722-108.722h222.722 c60.045,0,108.722,48.676,108.722,108.722L495.6,386.878L495.6,386.878z"
      />
      <path
        style="fill:url(#insta-grad);"
        d="M275.517,133C196.933,133,133,196.933,133,275.516 s63.933,142.517,142.517,142.517S418.034,354.1,418.034,275.516S354.101,133,275.517,133z M275.517,362.6 c-48.095,0-87.083-38.988-87.083-87.083s38.989-87.083,87.083-87.083c48.095,0,87.083,38.988,87.083,87.083 C362.6,323.611,323.611,362.6,275.517,362.6z"
      />
      <circle id="XMLID_83_" style="fill:url(#insta-grad);" cx="418.306" cy="134.072" r="34.149" />
    </svg>
  )
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 382 382"
      fill="#0077B7"
      className={className}
      aria-hidden="true"
    >
      <path d="M347.445,0H34.555C15.471,0,0,15.471,0,34.555v312.889C0,366.529,15.471,382,34.555,382h312.889 C366.529,382,382,366.529,382,347.444V34.555C382,15.471,366.529,0,347.445,0z M118.207,329.844c0,5.554-4.502,10.056-10.056,10.056 H65.345c-5.554,0-10.056-4.502-10.056-10.056V150.403c0-5.554,4.502-10.056,10.056-10.056h42.806 c5.554,0,10.056,4.502,10.056,10.056V329.844z M86.748,123.432c-22.459,0-40.666-18.207-40.666-40.666S64.289,42.1,86.748,42.1 s40.666,18.207,40.666,40.666S109.208,123.432,86.748,123.432z M341.91,330.654c0,5.106-4.14,9.246-9.246,9.246H286.73 c-5.106,0-9.246-4.14-9.246-9.246v-84.168c0-12.556,3.683-55.021-32.813-55.021c-28.309,0-34.051,29.066-35.204,42.11v97.079 c0,5.106-4.139,9.246-9.246,9.246h-44.426c-5.106,0-9.246-4.14-9.246-9.246V149.593c0-5.106,4.14-9.246,9.246-9.246h44.426 c5.106,0,9.246,4.14,9.246,9.246v15.655c10.497-15.753,26.097-27.912,59.312-27.912c73.552,0,73.131,68.716,73.131,106.472 L341.91,330.654L341.91,330.654z" />
    </svg>
  )
}

function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 461.001 461.001"
      fill="#F61C0D"
      className={className}
      aria-hidden="true"
    >
      <path d="M365.257,67.393H95.744C42.866,67.393,0,110.259,0,163.137v134.728 c0,52.878,42.866,95.744,95.744,95.744h269.513c52.878,0,95.744-42.866,95.744-95.744V163.137 C461.001,110.259,418.135,67.393,365.257,67.393z M300.506,237.056l-126.06,60.123c-3.359,1.602-7.239-0.847-7.239-4.568V168.607 c0-3.774,3.982-6.22,7.348-4.514l126.06,63.881C304.363,229.873,304.298,235.248,300.506,237.056z" />
    </svg>
  )
}

function MessageCircleIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      fill="#67C15E"
      className={className}
      aria-hidden="true"
    >
      <path d="M23.993033,0C10.762252,0,0,10.765287,0,23.999801C0,29.248451,1.692661,34.116025,4.570026,38.066947L1.579605,46.983798 L10.804449,44.035539C14.598605,46.546975,19.126434,48,24.006967,48C37.237748,48,48,37.234315,48,24.000199 C48,10.765685,37.237748,0.000398,24.006967,0.000398L23.993033,0.000398L23.993033,0Z M17.29285,12.190836 C16.827488,11.07628,16.474784,11.034071,15.769774,11.005401C15.529728,10.991464,15.262214,10.977527,14.96564,10.977527 C14.04845,10.977527,13.089462,11.245514,12.511043,11.838033C11.806033,12.557577,10.056843,14.23638,10.056843,17.679202 C10.056843,21.122023,12.567571,24.451756,12.905944,24.917648C13.258648,25.382743,17.800808,32.55031,24.853297,35.471492 C30.368379,37.757149,32.00491,37.545307,33.260074,37.27732C35.093658,36.882308,37.393002,35.527239,37.971421,33.891043 C38.54984,32.25405,38.54984,30.857171,38.380255,30.560912C38.211068,30.264652,37.745308,30.095816,37.040298,29.742615 C36.335288,29.389811,32.90737,27.696673,32.25849,27.470894C31.623543,27.231179,31.017259,27.315995,30.537963,27.99333 C29.860819,28.938653,29.198006,29.89831,28.661785,30.476494C28.238619,30.928051,27.547144,30.984595,26.969123,30.744481 C26.193254,30.420348,24.021298,29.657798,21.340985,27.273388C19.267356,25.42535,17.856938,23.125756,17.448104,22.434484 C17.038871,21.729275,17.405907,21.319529,17.729948,20.938852C18.082653,20.501232,18.421026,20.191036,18.77373,19.781688 C19.126434,19.372738,19.323884,19.160897,19.549599,18.681068C19.789645,18.215575,19.62006,17.735746,19.450874,17.382942 C19.281687,17.030139,17.871269,13.587317,17.29285,12.190836Z" />
    </svg>
  )
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 408.788 408.788"
      fill="#475993"
      className={className}
      aria-hidden="true"
    >
      <path d="M353.701,0H55.087C24.665,0,0.002,24.662,0.002,55.085v298.616c0,30.423,24.662,55.085,55.085,55.085h147.275 l0.251-146.078h-37.951c-4.932,0-8.935-3.988-8.954-8.92l-0.182-47.087c-0.019-4.959,3.996-8.989,8.955-8.989h37.882v-45.498 c0-52.8,32.247-81.55,79.348-81.55h38.65c4.945,0,8.955,4.009,8.955,8.955v39.704c0,4.944-4.007,8.952-8.95,8.955l-23.719,0.011 c-25.615,0-30.575,12.172-30.575,30.035v39.389h56.285c5.363,0,9.524,4.683,8.892,10.009l-5.581,47.087 c-0.534,4.506-4.355,7.901-8.892,7.901h-50.453l-0.251,146.078h87.631c30.422,0,55.084-24.662,55.084-55.084V55.085 C408.786,24.662,384.124,0,353.701,0z" />
    </svg>
  )
}

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
  globe: Globe,
  shield: ShieldCheck,
  support: Headphones,
}

const socialIcons: Record<string, LucideIcon> = {
  facebook: FacebookIcon as unknown as LucideIcon,
  instagram: InstagramIcon as unknown as LucideIcon,
  linkedin: LinkedinIcon as unknown as LucideIcon,
  youtube: YoutubeIcon as unknown as LucideIcon,
  whatsapp: MessageCircleIcon as unknown as LucideIcon,
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
    <svg className="size-10 sm:size-12 md:size-14" viewBox="-8 -8 224 252" aria-hidden="true">
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
      className="group inline-flex items-center gap-3 sm:gap-5 min-w-0"
      aria-label="Enermation home"
    >
      <span className="shrink-0" aria-hidden="true">
        <FaviconMark />
      </span>
      <span className="flex flex-col border-l border-footer-muted pl-3 sm:pl-4">
        <span className="font-heading text-2xl sm:text-3xl font-bold uppercase leading-none tracking-widest text-on-dark overflow-wrap-break-word md:text-4xl">
          Enermation
        </span>
        <span className="mt-2 font-heading text-xs sm:text-xs font-bold uppercase tracking-widest text-footer-accent overflow-wrap-break-word">
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
      className="grid min-w-0 grid-cols-2 gap-4 sm:gap-7 sm:grid-cols-4 lg:grid-cols-4"
    >
      {footerProofPoints.map(point => {
        const Icon = proofPointIcons[point.icon]
        return (
          <li
            key={point.label}
            className="flex flex-col items-center gap-2 sm:gap-3 text-center sm:items-start sm:text-left"
          >
            <Icon
              className="size-5 sm:size-6 text-footer-accent"
              strokeWidth={1.6}
              aria-hidden="true"
            />
            <span className="max-w-20 font-heading text-xs font-semibold uppercase leading-snug text-on-dark">
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
              <span className="font-heading text-sm sm:text-base font-bold text-footer-accent transition-colors group-hover:text-footer-accent-bright">
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
              <span className="font-heading text-sm sm:text-base font-bold text-footer-accent transition-colors group-hover:text-footer-accent-bright">
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
            <span className="font-heading text-sm sm:text-base font-bold text-footer-accent">
              {footerContactInfo.location}
            </span>
            <span className="font-body text-xs sm:text-sm text-on-dark-muted">
              {footerContactInfo.region}
            </span>
          </span>
        </li>
      </ul>
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
            className="flex min-w-0 flex-col gap-6 sm:gap-8 lg:gap-10 border-footer-line lg:border-r lg:pr-12"
            aria-label="Enermation footer summary"
          >
            <BrandMark />
            <p className="max-w-sm font-body text-sm sm:text-base leading-relaxed text-on-dark-muted">
              {footerBrandSummary}
            </p>
            <ProofPoints />

            <Link
              href={footerQuoteCta.href}
              className="footer-dot-card group flex min-w-0 flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 rounded-lg border border-footer-accent p-4 sm:p-6 transition-colors hover:border-footer-accent-bright"
            >
              <ClipboardCheck
                className="size-10 sm:size-12 shrink-0 text-footer-accent"
                strokeWidth={1.5}
                aria-hidden="true"
              />
              <span className="flex min-w-0 flex-col gap-2">
                <span className="font-body text-sm leading-snug text-on-dark">
                  {footerQuoteCta.title}
                </span>
                <span className="font-heading text-sm font-bold uppercase tracking-wide text-footer-accent transition-colors group-hover:text-footer-accent-bright">
                  {footerQuoteCta.label} -&gt;
                </span>
              </span>
            </Link>
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

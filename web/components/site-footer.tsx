'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Suspense } from 'react'

import { FooterOfficeMap } from '@/components/footer-office-map'
import { footerSocialLinks } from '@/lib/data'
import type { FooterNavGroup } from '@/lib/header-navigation'
import { cn } from '@/lib/utils'

function FooterWordmark() {
  return (
    <div
      data-slot="footer-wordmark"
      className="col-span-full mx-auto w-full overflow-hidden border-b border-white-30 pb-2 lg:pb-0"
    >
      <p
        aria-hidden="true"
        className="pointer-events-none select-none truncate font-heading text-footer-wordmark font-black leading-none tracking-tighter opacity-20 text-on-dark"
      >
        Enermation
      </p>
    </div>
  )
}

function FooterNavLinks({
  links,
  title,
  className,
}: {
  links: { label: string; href: string }[]
  title?: string
  className?: string
}) {
  return (
    <nav
      data-slot="footer-nav-links"
      className={cn('flex flex-col gap-y-2 overflow-hidden', className)}
      aria-label="Footer navigation"
    >
      {title && (
        <p className="font-heading text-sm font-semibold uppercase tracking-wide text-white-70">
          {title}
        </p>
      )}
      <ul className="flex flex-col gap-y-2 text-on-dark">
        {links.map(({ label, href }) => (
          <li key={label} data-reveal data-variant="slide-up">
            <Link
              href={href}
              className="inline-flex w-fit font-heading text-xl font-semibold uppercase leading-none tracking-tight text-on-dark transition-colors hover:text-on-dark"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}

function FooterSocialLinks({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-row flex-wrap gap-x-1 text-13 text-on-dark', className)}>
      {footerSocialLinks.map(({ label, href }, index) => (
        <span key={label} className="flex items-center gap-x-1">
          <Link
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-on-dark transition-colors hover:text-on-dark-muted"
          >
            {label}
          </Link>
          {index < footerSocialLinks.length - 1 && <span aria-hidden="true">,</span>}
        </span>
      ))}
    </div>
  )
}

function FooterCopyright({ className }: { className?: string }) {
  return (
    <p className={cn('text-13 text-on-dark', className)}>
      © Enermation {new Date().getFullYear()} all rights reserved
    </p>
  )
}

type SiteFooterProps = {
  exploreGroups: FooterNavGroup[]
}

export function SiteFooter({ exploreGroups }: SiteFooterProps) {
  const pathname = usePathname()

  if (pathname === '/miles') return null

  return (
    <footer
      data-slot="site-footer"
      className="relative z-10 flex flex-col justify-between overflow-hidden bg-black pb-4 lg:h-[calc(100dvh-3.25rem)]"
    >
      <div className="grid-layout">
        <FooterWordmark />
      </div>

      <div className="grid-layout footer-grid relative grid-rows-[auto_auto_28px] gap-y-6 pb-2 pt-4 lg:grid grid-cols-12 lg:grid-rows-1 lg:items-end lg:gap-0 lg:py-0">
        <div className="col-start-1 col-end-5 row-start-1 flex flex-col gap-6 border-b border-white-30 pb-4 lg:col-start-7 lg:col-end-9 lg:border-none lg:pb-0">
          {exploreGroups.map(group => (
            <FooterNavLinks key={group.title} links={group.children} title={group.title} />
          ))}
        </div>

        <FooterOfficeMap className="col-start-1 col-end-5 row-start-2 lg:col-start-1 lg:col-end-5 lg:row-start-auto" />

        {/* Mobile: social + copyright at bottom */}
        <div className="col-span-full row-start-3 flex flex-col justify-end gap-y-2 lg:hidden">
          <FooterSocialLinks />
          <Suspense fallback={null}>
            <FooterCopyright className="text-left" />
          </Suspense>
        </div>

        {/* Desktop: social + copyright pinned far right */}
        <div className="col-start-10 col-end-13 hidden translate-y-[3px] flex-col items-end gap-y-2 lg:flex">
          <FooterSocialLinks />
          <Suspense fallback={null}>
            <FooterCopyright />
          </Suspense>
        </div>
      </div>
    </footer>
  )
}

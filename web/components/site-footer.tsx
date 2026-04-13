import Link from 'next/link'

import { FooterNavLinks } from '@/components/footer-nav-links'
import { FooterStayConnected } from '@/components/footer-stay-connected'
import { footerContent, footerPrimaryLinks, footerSocialLinks } from '@/lib/data'
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

export function SiteFooter() {
  return (
    <footer
      data-slot="site-footer"
      className="relative z-10 flex flex-col justify-between overflow-hidden bg-black pb-4 lg:h-[calc(100dvh-3.25rem)]"
    >
      <div className="grid-layout">
        <FooterWordmark />
      </div>

      <div className="grid-layout footer-grid relative grid-rows-[auto_auto_28px] !gap-y-10 pb-2 pt-4 lg:grid-rows-[auto] lg:items-end lg:!gap-y-2 lg:py-0">
        <FooterNavLinks
          links={footerPrimaryLinks}
          className="col-start-1 col-end-5 row-start-1 border-b border-white-30 pb-4 lg:col-start-7 lg:col-end-9 lg:border-none lg:pb-0"
        />

        <FooterStayConnected
          content={footerContent}
          className="col-start-1 col-end-5 row-start-2 hidden lg:row-auto lg:flex"
        />

        {/* Mobile: social + copyright at bottom */}
        <div className="col-span-full row-start-3 flex flex-col justify-end gap-y-2 lg:hidden">
          <FooterSocialLinks />
          <FooterCopyright className="text-left" />
        </div>

        {/* Desktop: social + copyright pinned far right */}
        <div className="col-start-10 col-end-13 hidden translate-y-[3px] flex-col items-end gap-y-2 lg:flex">
          <FooterSocialLinks />
          <FooterCopyright />
        </div>
      </div>
    </footer>
  )
}

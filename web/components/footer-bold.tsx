'use client'

import Link from 'next/link'

import {
  footerContactInfo,
  footerLegalLinks,
  footerNavigationGroups,
  footerSocialLinks,
} from '@/lib/data'
import { cn } from '@/lib/utils'

export function BoldFooter({ className }: { className?: string }) {
  return (
    <footer
      data-slot="footer-bold"
      className={cn(
        'w-full overflow-hidden bg-surface-dark font-sans text-on-dark border-t border-white-30',
        className
      )}
    >
      <div className="mx-auto flex max-w-site flex-col items-center px-4 py-20 sm:px-6 lg:px-8">
        {/* Top section */}
        <div className="mb-20 flex w-full flex-col items-start justify-between gap-12 md:flex-row">
          <div className="max-w-md">
            <h2 className="mb-6 text-pretty text-3xl font-bold tracking-tight">
              Interested in our collection? Discover exceptional vehicles.
            </h2>
            <Link
              href={`mailto:${footerContactInfo.email}`}
              className="border-b-2 border-on-dark pb-1 text-lg font-medium text-on-dark transition-all hover:border-on-dark-muted hover:text-on-dark-muted"
            >
              {footerContactInfo.email}
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-12 sm:gap-24">
            {/* Location column */}
            <div>
              <p className="mb-4 text-xs font-bold uppercase tracking-widest text-on-dark-muted">
                Location
              </p>
              <address className="not-italic space-y-1 text-sm">
                <p>{footerContactInfo.location}</p>
                <p>{footerContactInfo.phone}</p>
              </address>
            </div>

            {/* Social column */}
            <div>
              <p className="mb-4 text-xs font-bold uppercase tracking-widest text-on-dark-muted">
                Social
              </p>
              <nav className="flex flex-col gap-2" aria-label="Social links">
                {footerSocialLinks.map(({ label, href }) => (
                  <Link
                    key={label}
                    href={href}
                    className="text-sm font-medium text-on-dark hover:underline"
                  >
                    {label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Nav groups */}
            {footerNavigationGroups.map(({ title, links }) => (
              <div key={title}>
                <p className="mb-4 text-xs font-bold uppercase tracking-widest text-on-dark-muted">
                  {title}
                </p>
                <nav className="flex flex-col gap-2" aria-label={`${title} links`}>
                  {links.map(({ label, href }) => (
                    <Link
                      key={label}
                      href={href}
                      className="text-sm font-medium text-on-dark hover:underline"
                    >
                      {label}
                    </Link>
                  ))}
                </nav>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom section */}
        <div className="relative w-full overflow-hidden">
          <p
            aria-hidden="true"
            className="pointer-events-none select-none truncate pb-2 font-heading text-footer-wordmark font-black leading-none tracking-tighter opacity-20"
          >
            Enermation
          </p>
          <div className="relative z-10 flex items-end justify-between border-t border-white-30 pt-6">
            <span className="text-xs font-medium uppercase tracking-widest text-on-dark-muted">
              &copy; {new Date().getFullYear()} Enermation. All rights reserved.
            </span>
            <div className="flex items-center gap-8">
              {footerLegalLinks.map(({ label, href }) => (
                <Link
                  key={label}
                  href={href}
                  className="hidden text-xs text-on-dark-muted transition-colors hover:text-on-dark sm:inline"
                >
                  {label}
                </Link>
              ))}
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="text-xs font-bold uppercase tracking-widest transition-colors hover:text-on-dark-muted"
              >
                Back to top &uarr;
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

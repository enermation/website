import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

import { Input } from '@/components/ui/input'
import {
  footerContent,
  footerPrimaryLinks,
  footerSocialLinks,
} from '@/lib/data'
import { cn } from '@/lib/utils'

function FooterWordmark() {
  return (
    <Link
      href="/"
      className="mx-auto flex w-full max-w-5xl justify-center text-center text-gray-90 transition-colors hover:text-white"
    >
      <span className="font-heading text-5xl leading-none font-semibold uppercase tracking-tight sm:text-7xl lg:text-9xl">
        Enermation
      </span>
    </Link>
  )
}

function FooterPrimaryNav({ className }: { className?: string }) {
  return (
    <nav data-slot="footer-primary-nav" className={className} aria-label="Footer">
      <ul className="flex flex-col gap-y-2 text-gray-90">
        {footerPrimaryLinks.map(({ label, href }) => (
          <li key={label}>
            <Link
              href={href}
              className="inline-flex w-fit font-heading text-4xl leading-none font-semibold uppercase tracking-tight transition-colors hover:text-white sm:text-5xl"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}

function FooterStayConnected({ className }: { className?: string }) {
  return (
    <div data-slot="footer-stay-connected" className={cn('flex-col gap-6', className)}>
      <div className="max-w-sm">
        <p className="text-sm leading-relaxed font-semibold text-gray-87">{footerContent.description}</p>
      </div>

      <div className="flex max-w-sm flex-col gap-1">
        <Input
          type="email"
          placeholder={footerContent.inputPlaceholder}
          aria-label={footerContent.inputPlaceholder}
          className="h-10 rounded-none border-0 border-b border-white-30 bg-transparent px-0 text-lg font-semibold text-gray-90 placeholder:text-gray-60 focus-visible:border-white focus-visible:ring-0 dark:bg-transparent"
        />
        <button
          type="button"
          className="inline-flex w-fit items-center gap-2 pt-1 font-heading text-xl font-semibold uppercase tracking-tight text-gray-90 transition-colors hover:text-white"
        >
          <span>{footerContent.actionLabel}</span>
          <ArrowRight className="size-5" />
        </button>
      </div>
    </div>
  )
}

function FooterSocialLinks({ className }: { className?: string }) {
  return (
    <div
      data-slot="footer-social-links"
      className={cn('flex flex-wrap gap-x-1 gap-y-1 text-sm font-semibold text-gray-60', className)}
    >
      {footerSocialLinks.map(({ label, href }, index) => (
        <span key={label} className="flex items-center gap-x-1">
          <Link href={href} className="text-gray-87 transition-colors hover:text-white">
            {label}
          </Link>
          {index < footerSocialLinks.length - 1 && <span aria-hidden>,</span>}
        </span>
      ))}
    </div>
  )
}

function FooterMeta({ className }: { className?: string }) {
  return (
    <div data-slot="footer-meta" className={cn('flex flex-col gap-y-2', className)}>
      <FooterSocialLinks />
      <p className="text-sm font-semibold text-gray-60">{footerContent.companyLine}</p>
    </div>
  )
}

export function SiteFooter() {
  return (
    <footer data-slot="site-footer" className="relative z-10 bg-black pb-4 lg:min-h-screen">
      <div className="mx-auto flex w-full max-w-site flex-col px-4 md:px-8 lg:min-h-screen">
        <div className="border-b border-white-30 pb-3 pt-10 lg:pb-4 lg:pt-12">
          <FooterWordmark />
        </div>

        <div className="grid flex-1 grid-cols-4 gap-x-3 gap-y-10 pb-2 pt-4 lg:grid-cols-12 lg:content-end lg:items-end lg:gap-y-2 lg:py-0">
          <FooterPrimaryNav className="col-span-full border-b border-white-30 pb-4 lg:col-start-7 lg:col-end-9 lg:border-none lg:pb-0" />

          <FooterStayConnected className="col-span-full hidden lg:col-start-1 lg:col-end-5 lg:flex" />

          <FooterMeta className="col-span-full lg:hidden" />

          <FooterMeta className="hidden lg:col-start-10 lg:col-end-13 lg:flex lg:items-end lg:text-right" />
        </div>
      </div>
    </footer>
  )
}

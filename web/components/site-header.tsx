'use client'

import { Phone } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { CardNav } from '@/components/CardNav'
import {
  FacebookIcon,
  InstagramIcon,
  TikTokIcon,
  TwitterIcon,
  YoutubeIcon,
} from '@/components/social-icons'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { cardNavItems, navLinks } from '@/lib/data'

const socialLinks = [
  { label: 'Instagram', Icon: InstagramIcon, href: '#' },
  { label: 'Facebook', Icon: FacebookIcon, href: '#' },
  { label: 'TikTok', Icon: TikTokIcon, href: '#' },
  { label: 'Twitter', Icon: TwitterIcon, href: '#' },
  { label: 'YouTube', Icon: YoutubeIcon, href: '#' },
]

export function SiteHeader() {
  const [sheetOpen, setSheetOpen] = useState(false)

  return (
    <header className="relative bg-black">
      {/* CardNav — shared mobile + desktop */}
      <CardNav items={cardNavItems} onMenuClick={() => setSheetOpen(true)} />

      {/* Mobile full nav sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetTrigger className="hidden" aria-label="Open menu" />
        <SheetContent side="right" className="bg-black border-gray-18 w-3/4 p-0" showCloseButton>
          <nav className="flex flex-col pt-16 pb-8">
            {navLinks.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="font-heading font-semibold text-13 text-white uppercase tracking-wider px-6 py-4 border-b border-gray-18 hover:text-white/70 transition-colors"
                onClick={() => setSheetOpen(false)}
              >
                {label}
              </Link>
            ))}
            <div className="flex items-center gap-2 px-6 pt-6">
              {socialLinks.map(({ label, Icon, href }) => (
                <Link
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex size-8 items-center justify-center rounded bg-gray-16 text-white/70 transition-colors hover:bg-gray-18 hover:text-white"
                  onClick={() => setSheetOpen(false)}
                >
                  <Icon className="size-3.5" />
                </Link>
              ))}
            </div>
            <div className="px-6 pt-4">
              <Link
                href="tel:+441772663777"
                className="flex items-center gap-2 font-body font-bold text-white text-xs tracking-wide transition-colors hover:text-white/70"
                onClick={() => setSheetOpen(false)}
              >
                <Phone className="size-3.5 shrink-0" />
                +44 (0)1772 663777
              </Link>
            </div>
          </nav>
        </SheetContent>
      </Sheet>

      {/* Tricolor accent bar */}
      <div className="relative h-2.5 w-full">
        <div className="absolute left-0 top-0 h-1.5 w-1/2 bg-brand-green" />
        <div className="absolute right-0 top-0 h-1.5 w-1/2 bg-white" />
        <div className="absolute bottom-0 left-1/4 h-1.5 w-1/2 bg-brand-red" />
      </div>
    </header>
  )
}

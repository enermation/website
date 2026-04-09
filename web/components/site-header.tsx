import { ChevronDown, Menu, Phone } from 'lucide-react'
import Link from 'next/link'
import {
  FacebookIcon,
  InstagramIcon,
  TikTokIcon,
  TwitterIcon,
  YoutubeIcon,
} from '@/components/social-icons'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { navLinks } from '@/lib/data'

const socialLinks = [
  { label: 'Instagram', Icon: InstagramIcon, href: '#' },
  { label: 'Facebook', Icon: FacebookIcon, href: '#' },
  { label: 'TikTok', Icon: TikTokIcon, href: '#' },
  { label: 'Twitter', Icon: TwitterIcon, href: '#' },
  { label: 'YouTube', Icon: YoutubeIcon, href: '#' },
]

export function SiteHeader() {
  return (
    <header className="bg-black">
      {/* Logo row */}
      <div className="relative flex justify-center py-7 border-b border-gray-18">
        <Link href="/" className="flex flex-col items-center gap-3">
          <span className="font-display text-5xl font-light text-white uppercase tracking-widest leading-none">
            Enermation
          </span>
          {/* Tricolor stripe under logo */}
          <div className="flex items-center">
            <div className="h-1 w-10 bg-brand-green" />
            <div className="h-1 w-10 bg-white" />
            <div className="h-1 w-10 bg-brand-red" />
          </div>
        </Link>

        {/* Hamburger — mobile only */}
        <Sheet>
          <SheetTrigger
            className="md:hidden absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center size-10 text-white"
            aria-label="Open menu"
          >
            <Menu className="size-6" />
          </SheetTrigger>
          <SheetContent side="right" className="bg-black border-gray-18 w-3/4 p-0" showCloseButton>
            <nav className="flex flex-col pt-16 pb-8">
              {navLinks.map(({ label, href }) => (
                <Link
                  key={label}
                  href={href}
                  className="font-heading font-semibold text-13 text-white uppercase tracking-wider px-6 py-4 border-b border-gray-18 hover:text-white/70 transition-colors"
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
                    className="flex items-center justify-center size-8 rounded bg-gray-16 text-white/70 hover:text-white hover:bg-gray-18 transition-colors"
                  >
                    <Icon className="size-3.5" />
                  </Link>
                ))}
              </div>
              <div className="px-6 pt-4">
                <Link
                  href="tel:+441772663777"
                  className="flex items-center gap-2 font-body font-bold text-white text-xs tracking-wide hover:text-white/70 transition-colors"
                >
                  <Phone className="size-3.5 shrink-0" />
                  +44 (0)1772 663777
                </Link>
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>

      {/* Nav row — desktop only */}
      <div className="hidden md:flex max-w-site mx-auto items-center justify-between px-8 h-15">
        {/* Social icons */}
        <div className="flex items-center gap-2">
          {socialLinks.map(({ label, Icon, href }) => (
            <Link
              key={label}
              href={href}
              aria-label={label}
              className="flex items-center justify-center size-7 rounded bg-gray-16 text-white/70 hover:text-white hover:bg-gray-18 shrink-0 transition-colors"
            >
              <Icon className="size-3.5" />
            </Link>
          ))}
        </div>

        {/* Primary navigation */}
        <nav className="flex items-center">
          {navLinks.map(({ label, href, hasDropdown }) => (
            <Link
              key={label}
              href={href}
              className="flex items-center gap-1 font-heading font-semibold text-13 text-white uppercase tracking-wider px-4 py-5 hover:text-white/70 transition-colors whitespace-nowrap"
            >
              {label}
              {hasDropdown && <ChevronDown className="size-3 opacity-70" />}
            </Link>
          ))}
        </nav>

        {/* Phone CTA */}
        <Link
          href="tel:+441772663777"
          className="flex items-center gap-2 bg-gray-16 rounded-full px-4 py-2 font-body font-bold text-white text-xs tracking-wide hover:bg-gray-18 transition-colors whitespace-nowrap"
        >
          <Phone className="size-3.5 shrink-0" />
          +44 (0)1772 663777
        </Link>
      </div>

      {/* Tricolor accent bar — desktop only */}
      <div className="hidden md:block relative h-2.5 w-full">
        <div className="absolute left-0 top-0 w-1/2 h-1.5 bg-brand-green" />
        <div className="absolute right-0 top-0 w-1/2 h-1.5 bg-white" />
        <div className="absolute left-1/4 bottom-0 w-1/2 h-1.5 bg-brand-red" />
      </div>
    </header>
  )
}

import Image from 'next/image'
import Link from 'next/link'
import {
  FacebookIcon,
  InstagramIcon,
  TikTokIcon,
  TwitterIcon,
  YoutubeIcon,
} from '@/components/social-icons'
import {
  type FooterLink,
  footerAboutLinks,
  footerContactInfo,
  footerContactLinks,
  footerLegalLinks,
} from '@/lib/data'
import { GET_COLLECTIONS } from '@/lib/queries'
import client from '@/lib/shopify'
import type { ShopifyCollection } from '@/lib/types'

const socialLinks = [
  { label: 'Instagram', Icon: InstagramIcon, href: '#' },
  { label: 'Facebook', Icon: FacebookIcon, href: '#' },
  { label: 'TikTok', Icon: TikTokIcon, href: '#' },
  { label: 'Twitter', Icon: TwitterIcon, href: '#' },
  { label: 'YouTube', Icon: YoutubeIcon, href: '#' },
]

function FooterColumn({ heading, links }: { heading: string; links: FooterLink[] }) {
  return (
    <div className="flex flex-col items-center md:items-start gap-4">
      <h4 className="font-heading font-semibold text-white text-sm uppercase tracking-widest">
        {heading}
      </h4>
      <div className="h-0.5 w-10 bg-white/30" />
      <ul className="flex flex-col items-center md:items-start gap-1">
        {links.map(({ label, href }) => (
          <li key={label}>
            <Link
              href={href}
              className="font-heading text-13 text-white/80 tracking-wide hover:text-white transition-colors"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

type CollectionsResponse = {
  collections: {
    edges: { node: ShopifyCollection }[]
  }
}

export async function SiteFooter() {
  const { data } = await client.request<CollectionsResponse>(GET_COLLECTIONS)
  const footerShowroomLinks: FooterLink[] =
    data?.collections.edges.map(({ node }) => ({
      label: node.title,
      href: `/collections/${node.handle}`,
    })) ?? []

  return (
    <footer className="bg-black pt-12 pb-10">
      {/* Mobile: Logo + Social centered at top */}
      <div className="md:hidden flex flex-col items-center gap-6 pb-10 px-4">
        <Link href="/" aria-label="Enermation home">
          <Image src="/logo.jpg" alt="Enermation" width={300} height={74} className="h-auto w-48" />
        </Link>
        <div className="flex items-center gap-2">
          {socialLinks.map(({ label, Icon, href }) => (
            <Link
              key={label}
              href={href}
              aria-label={label}
              className="flex items-center justify-center size-10 rounded-full bg-gray-16 text-white/70 hover:text-white hover:bg-gray-18 transition-colors"
            >
              <Icon className="size-4" />
            </Link>
          ))}
        </div>
      </div>

      <div className="max-w-site mx-auto px-4 md:px-8">
        {/* Columns: stacked centered on mobile, 4-col grid on desktop */}
        <div className="flex flex-col items-center gap-10 pb-8 border-b border-gray-18 md:grid md:grid-cols-4 md:gap-8 md:items-start">
          <FooterColumn heading="Showroom" links={footerShowroomLinks} />
          <FooterColumn heading="About" links={footerAboutLinks} />

          {/* Contact column */}
          <div className="flex flex-col items-center md:items-start gap-4">
            <h4 className="font-heading font-semibold text-white text-sm uppercase tracking-widest">
              Contact
            </h4>
            <div className="h-0.5 w-10 bg-white/30" />
            <ul className="flex flex-col items-center md:items-start gap-1">
              {footerContactLinks.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="font-heading text-13 text-white/80 tracking-wide hover:text-white transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
              <li className="text-center md:text-left">
                <span className="font-heading font-bold text-13 text-white tracking-wide">T </span>
                <Link
                  href={`tel:${footerContactInfo.phone.replace(/\s/g, '')}`}
                  className="font-heading text-13 text-white/80 tracking-wide hover:text-white transition-colors"
                >
                  {footerContactInfo.phone}
                </Link>
              </li>
              <li className="text-center md:text-left">
                <span className="font-heading font-bold text-13 text-white tracking-wide">E </span>
                <Link
                  href={`mailto:${footerContactInfo.email}`}
                  className="font-heading text-13 text-white/80 tracking-wide hover:text-white transition-colors"
                >
                  {footerContactInfo.email}
                </Link>
              </li>
            </ul>
          </div>

          {/* Desktop: Logo + Social (4th column) */}
          <div className="hidden md:flex flex-col items-end gap-6 justify-between">
            <Link href="/" aria-label="Enermation home">
              <Image
                src="/logo.jpg"
                alt="Enermation"
                width={260}
                height={64}
                className="h-auto w-40"
              />
            </Link>
            <div className="flex items-center gap-2">
              {socialLinks.map(({ label, Icon, href }) => (
                <Link
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex items-center justify-center size-10 rounded bg-gray-16 text-white/70 hover:text-white hover:bg-gray-18 transition-colors"
                >
                  <Icon className="size-4" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between pt-5 gap-2">
          <p className="font-heading text-xs text-white/80 text-center md:text-left">
            © 2026 Enermation Lifestyle Ltd. T/A Enermation Supercars. Registered Company Number:
            06937335
          </p>
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-2 font-heading text-xs text-white/80">
            {footerLegalLinks.map(({ label, href }, i) => (
              <span key={label} className="flex items-center gap-2">
                {i > 0 && <span className="opacity-40">|</span>}
                <Link href={href} className="hover:text-white transition-colors">
                  {label}
                </Link>
              </span>
            ))}
            <span className="opacity-40">|</span>
            <span>
              Site by <span className="font-display italic font-bold">racecar</span>
            </span>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="font-heading text-xs text-gray-60 mt-4 leading-relaxed text-center md:text-left">
          Disclaimer: Great care is taken to ensure the specification displayed for each vehicle is
          correct, however due to how data is ported from third party sources from time to time
          errors may occur. Enermation take no responsibility or liability for such errors in the
          listings and we advise you check the full vehicle details independently before purchase.
        </p>
      </div>
    </footer>
  )
}

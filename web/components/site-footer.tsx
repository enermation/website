import Link from "next/link"
import {
  footerShowroomLinks,
  footerAboutLinks,
  footerContactLinks,
  footerContactInfo,
  footerLegalLinks,
  type FooterLink,
} from "@/lib/data"
import {
  InstagramIcon,
  FacebookIcon,
  TikTokIcon,
  TwitterIcon,
  YoutubeIcon,
} from "@/components/social-icons"

const socialLinks = [
  { label: "Instagram", Icon: InstagramIcon, href: "#" },
  { label: "Facebook",  Icon: FacebookIcon,  href: "#" },
  { label: "TikTok",    Icon: TikTokIcon,    href: "#" },
  { label: "Twitter",   Icon: TwitterIcon,   href: "#" },
  { label: "YouTube",   Icon: YoutubeIcon,   href: "#" },
]

function FooterColumn({
  heading,
  links,
}: {
  heading: string
  links: FooterLink[]
}) {
  return (
    <div className="flex flex-col gap-4">
      <h4 className="font-montserrat font-semibold text-white text-sm uppercase tracking-widest">
        {heading}
      </h4>
      <div className="h-0.5 w-10 bg-white/30" />
      <ul className="flex flex-col gap-1">
        {links.map(({ label, href }) => (
          <li key={label}>
            <Link
              href={href}
              className="font-montserrat text-13 text-white/80 tracking-wide hover:text-white transition-colors"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function SiteFooter() {
  return (
    <footer className="bg-black pt-12 pb-10">
      <div className="max-w-site mx-auto px-8">
        {/* Main columns */}
        <div className="grid grid-cols-4 gap-8 pb-8 border-b border-gray-18">
          <FooterColumn heading="Showroom" links={footerShowroomLinks} />
          <FooterColumn heading="About" links={footerAboutLinks} />

          {/* Contact column */}
          <div className="flex flex-col gap-4">
            <h4 className="font-montserrat font-semibold text-white text-sm uppercase tracking-widest">
              Contact
            </h4>
            <div className="h-0.5 w-10 bg-white/30" />
            <ul className="flex flex-col gap-1">
              {footerContactLinks.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="font-montserrat text-13 text-white/80 tracking-wide hover:text-white transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
              <li>
                <span className="font-montserrat font-bold text-13 text-white tracking-wide">
                  T{" "}
                </span>
                <Link
                  href={`tel:${footerContactInfo.phone.replace(/\s/g, "")}`}
                  className="font-montserrat text-13 text-white/80 tracking-wide hover:text-white transition-colors"
                >
                  {footerContactInfo.phone}
                </Link>
              </li>
              <li>
                <span className="font-montserrat font-bold text-13 text-white tracking-wide">
                  E{" "}
                </span>
                <Link
                  href={`mailto:${footerContactInfo.email}`}
                  className="font-montserrat text-13 text-white/80 tracking-wide hover:text-white transition-colors"
                >
                  {footerContactInfo.email}
                </Link>
              </li>
            </ul>
          </div>

          {/* Logo + social */}
          <div className="flex flex-col items-end gap-6 justify-between">
            <Link href="/" className="flex flex-col items-end gap-2">
              <span className="font-inter text-3xl font-light text-white uppercase tracking-widest leading-none">
                Enermation
              </span>
              <div className="flex items-center">
                <div className="h-0.5 w-8 bg-brand-green" />
                <div className="h-0.5 w-8 bg-white/60" />
                <div className="h-0.5 w-8 bg-brand-red" />
              </div>
            </Link>
            <div className="flex items-center gap-2">
              {socialLinks.map(({ label, Icon, href }) => (
                <Link
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex items-center justify-center size-10 rounded-full bg-gray-16 text-white/70 hover:text-white transition-colors"
                >
                  <Icon className="size-4" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="flex items-center justify-between pt-5">
          <p className="font-montserrat text-2xs text-white/80">
            © 2026 Enermation Lifestyle Ltd. T/A Enermation Supercars. Registered Company Number: 06937335
          </p>
          <div className="flex items-center gap-2 font-montserrat text-2xs text-white/80">
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
              Site by{" "}
              <span className="font-inter italic font-bold">racecar</span>
            </span>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="font-montserrat text-2xs text-gray-60 mt-4 leading-relaxed">
          Disclaimer: Great care is taken to ensure the specification displayed for each vehicle is
          correct, however due to how data is ported from third party sources from time to time
          errors may occur. Enermation take no responsibility or liability for such errors
          in the listings and we advise you check the full vehicle details independently before
          purchase.
        </p>
      </div>
    </footer>
  )
}

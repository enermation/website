'use client'

import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Link from 'next/link'
import { useRef } from 'react'

import type { FooterLink } from '@/lib/data'
import { cn } from '@/lib/utils'

gsap.registerPlugin(useGSAP, ScrollTrigger)

interface FooterNavLinksProps {
  links: FooterLink[]
  className?: string
}

export function FooterNavLinks({ links, className }: FooterNavLinksProps) {
  const containerRef = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      gsap.from('li', {
        y: 15,
        opacity: 0,
        duration: 0.4,
        ease: 'power2.out',
        stagger: 0.06,
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 90%',
          once: true,
        },
      })
    },
    { scope: containerRef }
  )

  return (
    <nav
      ref={containerRef}
      data-slot="footer-nav-links"
      className={cn('flex flex-col gap-y-2 overflow-hidden', className)}
      aria-label="Footer navigation"
    >
      <ul className="flex flex-col gap-y-2 text-gray-90">
        {links.map(({ label, href }) => (
          <li key={label}>
            <Link
              href={href}
              className="inline-flex w-fit font-heading text-4xl font-semibold uppercase leading-none tracking-tight text-gray-90 transition-colors hover:text-white"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}

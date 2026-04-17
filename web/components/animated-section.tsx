'use client'

import { useRef } from 'react'
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap'
import { cn } from '@/lib/utils'

type AnimatedSectionProps = {
  children: React.ReactNode
  className?: string
  stagger?: number
}

export function AnimatedSection({ children, className, stagger = 0.08 }: AnimatedSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (!containerRef.current) return

      const items = containerRef.current.querySelectorAll('[data-reveal]')

      // vercel-react-best-practices: rendering-hydration-no-flicker
      // No longer need gsap.set(items, { opacity: 0, y: 40 }) as we handle it via CSS

      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

      ScrollTrigger.batch(items, {
        start: 'top 85%',
        once: true,
        onEnter: (elements: Element[]) => {
          if (prefersReducedMotion) {
            gsap.set(elements, { opacity: 1, y: 0 })
          } else {
            gsap.to(elements, {
              opacity: 1,
              y: 0,
              duration: 0.6,
              ease: 'power2.out',
              stagger,
              overwrite: true,
            })
          }
        },
      })
    },
    { scope: containerRef }
  )

  return (
    <div ref={containerRef} className={cn(className)}>
      {children}
    </div>
  )
}

export function InstagramGrid({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (!containerRef.current) return

      const items = containerRef.current.querySelectorAll('[data-instagram-item]')

      // vercel-react-best-practices: rendering-hydration-no-flicker
      // No longer need gsap.set(items, { opacity: 0, scale: 0.8 }) as we handle it via CSS

      ScrollTrigger.batch(items, {
        start: 'top 85%',
        once: true,
        onEnter: (elements: Element[]) => {
          gsap.to(elements, {
            opacity: 1,
            scale: 1,
            duration: 0.5,
            ease: 'power2.out',
            stagger: { each: 0.06, from: 'random' },
            overwrite: true,
          })
        },
      })
    },
    { scope: containerRef }
  )

  return <div ref={containerRef}>{children}</div>
}

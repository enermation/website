'use client'

import dynamic from 'next/dynamic'
import Image from 'next/image'
import { useRef, useState } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'
import { cn } from '@/lib/utils'

const POSTERS = [
  '/images/porsche-911-sedan-hero.avif',
  '/images/lamborghini-suv-hero.avif',
] as const

const HeroCarouselInner = dynamic(
  () => import('@/components/hero-carousel').then(m => ({ default: m.HeroCarousel })),
  { ssr: false }
)

type Props = {
  initialIndex?: number
}

export function HeroCarousel({ initialIndex = 0 }: Props) {
  const [canvasReady, setCanvasReady] = useState(false)
  const [activeIndex, setActiveIndex] = useState(initialIndex)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const poster = POSTERS[initialIndex] ?? POSTERS[0]
  const containerRef = useRef<HTMLDivElement>(null)
  const posterRef = useRef<HTMLDivElement>(null)

  // Hero entrance animations (initial load only)
  useGSAP(
    () => {
      if (!containerRef.current || !canvasReady) return

      const tl = gsap.timeline({ defaults: { ease: 'power2.out' } })

      tl.fromTo(
        containerRef.current.querySelector('[data-hero-title]'),
        { opacity: 0, y: 30, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8 },
        0
      )
        .fromTo(
          containerRef.current.querySelector('[data-hero-cta]'),
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6 },
          0.3
        )
        .fromTo(
          containerRef.current.querySelectorAll('[data-hero-dot]'),
          { opacity: 0, scale: 0 },
          { opacity: 1, scale: 1, duration: 0.4, stagger: 0.1 },
          0.4
        )
    },
    { scope: containerRef, dependencies: [canvasReady] }
  )

  // Slide transition animations (title, CTA, dots crossfade)
  useGSAP(
    () => {
      if (!containerRef.current || canvasReady === false) return

      const titleEl = containerRef.current.querySelector('[data-hero-title]')
      const ctaEl = containerRef.current.querySelector('[data-hero-cta]')
      const dotsEl = containerRef.current.querySelectorAll('[data-hero-dot]')

      if (!titleEl || !ctaEl) return

      const tl = gsap.timeline({
        defaults: { ease: 'power2.inOut' },
        onComplete: () => setIsTransitioning(false),
      })

      setIsTransitioning(true)

      // Exit current content
      tl.to([titleEl, ctaEl], { opacity: 0, y: -20, duration: 0.3, stagger: 0.05 }).to(
        dotsEl,
        { opacity: 0, scale: 0.5, duration: 0.2 },
        0
      )

      // Enter new content
      tl.fromTo(titleEl, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5 })
        .fromTo(ctaEl, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4 }, '-=0.3')
        .fromTo(
          dotsEl,
          { opacity: 0, scale: 0 },
          { opacity: 1, scale: 1, duration: 0.3, stagger: 0.08, ease: 'back.out(1.7)' },
          '-=0.2'
        )
    },
    { scope: containerRef, dependencies: [activeIndex, canvasReady] }
  )

  // Hero parallax on scroll
  useGSAP(
    () => {
      if (!posterRef.current || !containerRef.current) return

      gsap.to(posterRef.current, {
        y: 150,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      })
    },
    { scope: containerRef }
  )

  return (
    <div ref={containerRef} className="relative min-h-screen">
      {/* Poster overlay disabled — video background replaces static poster */}
      {/* <div
        ref={posterRef}
        className={cn(
          'absolute inset-0 z-10 transition-opacity duration-700 ease-in-out',
          canvasReady && !isTransitioning && 'opacity-0 pointer-events-none',
          isTransitioning && 'opacity-100'
        )}
      >
        <Image
          src={poster}
          alt="Luxury supercar showcase"
          fill
          priority
          unoptimized
          sizes="100vw"
          className="object-cover"
        />
      </div> */}
      <HeroCarouselInner
        initialIndex={initialIndex}
        onReady={() => setCanvasReady(true)}
        onSlideChange={setActiveIndex}
      />
    </div>
  )
}

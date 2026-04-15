'use client'

import dynamic from 'next/dynamic'
import Image from 'next/image'
import { useRef, useState } from 'react'
import { heroBackgroundPosterUrl } from '@/lib/data'
import { gsap, useGSAP } from '@/lib/gsap'

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
  const containerRef = useRef<HTMLDivElement>(null)
  const posterRef = useRef<HTMLDivElement>(null)
  const isEntranceComplete = useRef(false)

  const posterUrl = heroBackgroundPosterUrl

  // Hero entrance animations (initial load only)
  useGSAP(
    () => {
      if (!canvasReady) return

      const tl = gsap.timeline({
        defaults: { ease: 'power2.out' },
        onComplete: () => {
          isEntranceComplete.current = true
        },
      })

      // Hide poster immediately and fade in canvas-based UI
      tl.to(posterRef.current, {
        autoAlpha: 0,
        duration: 1,
        ease: 'power2.inOut',
      })
        .fromTo(
          '[data-hero-title]',
          { autoAlpha: 0, y: 30, scale: 0.95 },
          { autoAlpha: 1, y: 0, scale: 1, duration: 0.8 },
          0.3
        )
        .fromTo(
          '[data-hero-cta]',
          { autoAlpha: 0, y: 20 },
          { autoAlpha: 1, y: 0, duration: 0.6 },
          0.6
        )
        .fromTo(
          '[data-hero-dot]',
          { autoAlpha: 0, scale: 0 },
          { autoAlpha: 1, scale: 1, duration: 0.4, stagger: 0.1 },
          0.7
        )
    },
    { scope: containerRef, dependencies: [canvasReady] }
  )

  // Slide transition animations (title, CTA, dots crossfade)
  useGSAP(
    () => {
      if (!canvasReady || !isEntranceComplete.current) return

      const titleEl = '[data-hero-title]'
      const ctaEl = '[data-hero-cta]'
      const dotsEl = '[data-hero-dot]'

      const tl = gsap.timeline({
        defaults: { ease: 'power2.inOut' },
      })

      // Exit current content
      tl.to([titleEl, ctaEl], {
        autoAlpha: 0,
        y: -20,
        duration: 0.3,
        stagger: 0.05,
        overwrite: 'auto',
      }).to(dotsEl, { autoAlpha: 0, scale: 0.5, duration: 0.2, overwrite: 'auto' }, 0)

      // Enter new content
      tl.fromTo(titleEl, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.5 })
        .fromTo(ctaEl, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.4 }, '-=0.3')
        .fromTo(
          dotsEl,
          { autoAlpha: 0, scale: 0 },
          { autoAlpha: 1, scale: 1, duration: 0.3, stagger: 0.08, ease: 'back.out(1.7)' },
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
      {/* SSR Poster Image for LCP Optimization */}
      <div ref={posterRef} className="absolute inset-0 z-10">
        <Image
          src={posterUrl}
          alt="Luxury supercar showcase background"
          fill
          priority
          placeholder="empty"
          sizes="100vw"
          className="object-cover"
        />
      </div>
      <HeroCarouselInner
        initialIndex={initialIndex}
        onReady={() => setCanvasReady(true)}
        onSlideChange={setActiveIndex}
      />
    </div>
  )
}

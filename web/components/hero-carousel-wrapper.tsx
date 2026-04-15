'use client'

import dynamic from 'next/dynamic'
import Image from 'next/image'
import { useRef, useState } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'
import type { ShopifyVideo } from '@/lib/types'
import { cn } from '@/lib/utils'
import starsVideo from '@/videos/hero-space-background.webm'

const HeroCarouselInner = dynamic(
  () => import('@/components/hero-carousel').then(m => ({ default: m.HeroCarousel })),
  { ssr: false }
)

type Props = {
  initialIndex?: number
  video?: ShopifyVideo | null
}

export function HeroCarousel({ initialIndex = 0, video }: Props) {
  const [canvasReady, setCanvasReady] = useState(false)
  const [activeIndex, setActiveIndex] = useState(initialIndex)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const posterRef = useRef<HTMLDivElement>(null)

  // Use Shopify video preview if available, otherwise fallback to local poster
  const posterUrl = video?.preview.image.url ?? (starsVideo.poster as string)

  // Hero entrance animations (initial load only)
  useGSAP(
    () => {
      if (!canvasReady) return

      const tl = gsap.timeline({ defaults: { ease: 'power2.out' } })

      tl.fromTo(
        '[data-hero-title]',
        { opacity: 0, y: 30, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8 },
        0
      )
        .fromTo('[data-hero-cta]', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 }, 0.3)
        .fromTo(
          '[data-hero-dot]',
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
      if (canvasReady === false) return

      const titleEl = '[data-hero-title]'
      const ctaEl = '[data-hero-cta]'
      const dotsEl = '[data-hero-dot]'

      const tl = gsap.timeline({
        defaults: { ease: 'power2.inOut' },
        onComplete: () => setIsTransitioning(false),
      })

      setIsTransitioning(true)

      // Exit current content
      tl.to([titleEl, ctaEl], {
        opacity: 0,
        y: -20,
        duration: 0.3,
        stagger: 0.05,
        overwrite: 'auto',
      }).to(dotsEl, { opacity: 0, scale: 0.5, duration: 0.2, overwrite: 'auto' }, 0)

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
      {/* SSR Poster Image for LCP Optimization */}
      <div
        ref={posterRef}
        className={cn(
          'absolute inset-0 z-10 transition-opacity duration-1000 ease-in-out',
          canvasReady && !isTransitioning ? 'opacity-0 pointer-events-none' : 'opacity-100'
        )}
      >
        <Image
          src={posterUrl}
          alt="Luxury supercar showcase background"
          fill
          priority
          placeholder={starsVideo.blurDataURL ? 'blur' : 'empty'}
          blurDataURL={starsVideo.blurDataURL}
          sizes="100vw"
          className="object-cover"
        />
      </div>
      <HeroCarouselInner
        initialIndex={initialIndex}
        video={video}
        onReady={() => setCanvasReady(true)}
        onSlideChange={setActiveIndex}
      />
    </div>
  )
}

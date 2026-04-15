'use client'

import dynamic from 'next/dynamic'
import Image from 'next/image'
import { useRef, useState } from 'react'
import { heroBackgroundPosterUrl } from '@/lib/data'
import { cn } from '@/lib/utils'

const HeroCarouselInner = dynamic(
  () => import('@/components/hero-carousel').then(m => ({ default: m.HeroCarousel })),
  { ssr: false }
)

type Props = {
  initialIndex?: number
}

export function HeroCarousel({ initialIndex = 0 }: Props) {
  const [canvasReady, setCanvasReady] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const posterRef = useRef<HTMLDivElement>(null)

  const posterUrl = heroBackgroundPosterUrl

  return (
    <div ref={containerRef} className="relative min-h-screen">
      {/* SSR Poster Image for LCP Optimization */}
      <div
        ref={posterRef}
        className={cn(
          'absolute inset-0 z-10 transition-opacity duration-300',
          canvasReady ? 'opacity-0 pointer-events-none' : 'opacity-100'
        )}
      >
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
      <HeroCarouselInner initialIndex={initialIndex} onReady={() => setCanvasReady(true)} />
    </div>
  )
}

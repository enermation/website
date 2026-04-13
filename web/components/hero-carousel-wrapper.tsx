'use client'

import dynamic from 'next/dynamic'
import Image from 'next/image'
import { useState } from 'react'
import { HeroLoadingSkeleton } from '@/components/hero-loading-skeleton'

const POSTERS = [
  '/images/porsche-911-sedan-hero.avif',
  '/images/lamborghini-suv-hero.avif',
] as const

const HeroCarouselInner = dynamic(
  () => import('@/components/hero-carousel').then(m => ({ default: m.HeroCarousel })),
  { ssr: false, loading: () => <HeroLoadingSkeleton /> }
)

type Props = {
  initialIndex?: number
}

export function HeroCarousel({ initialIndex = 0 }: Props) {
  const [canvasReady, setCanvasReady] = useState(false)
  const poster = POSTERS[initialIndex] ?? POSTERS[0]

  return (
    <div className="relative min-h-screen">
      <div
        className={`absolute inset-0 z-10 transition-opacity duration-700 ${canvasReady ? 'opacity-0 pointer-events-none' : ''}`}
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
      </div>
      <HeroCarouselInner initialIndex={initialIndex} onReady={() => setCanvasReady(true)} />
    </div>
  )
}

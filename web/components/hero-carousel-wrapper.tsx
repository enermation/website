'use client'

import dynamic from 'next/dynamic'
import { useRef, useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

const HeroCarouselInner = dynamic(
  () => import('@/components/hero-carousel').then(m => ({ default: m.HeroCarousel })),
  { ssr: false }
)

type Props = {
  initialIndex?: number
}

export function HeroCarousel({ initialIndex = 0 }: Props) {
  const [isReady, setIsReady] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <div ref={containerRef} className="relative min-h-screen overflow-hidden">
      {/* Skeleton / Placeholder while component loads and 3D initializes */}
      <div
        className={cn(
          'absolute inset-0 z-10 transition-opacity duration-500 ease-in-out',
          isReady ? 'opacity-0 pointer-events-none' : 'opacity-100'
        )}
      >
        <Skeleton className="size-full rounded-none" />
      </div>

      <HeroCarouselInner initialIndex={initialIndex} onReady={() => setIsReady(true)} />
    </div>
  )
}

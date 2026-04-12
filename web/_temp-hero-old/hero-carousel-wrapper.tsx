'use client'

import dynamic from 'next/dynamic'
import { HeroErrorBoundary } from '@/components/hero-error-boundary'
import { HeroLoadingSkeleton } from '@/components/hero-loading-skeleton'

// ssr: false must live in a client component (Next.js 16 App Router constraint).
// This wrapper is the client boundary; page.tsx imports it as a normal server-side import.
const HeroCarouselInner = dynamic(
  () => import('@/components/hero-carousel').then(m => ({ default: m.HeroCarousel })),
  { ssr: false, loading: () => <HeroLoadingSkeleton /> }
)

type Props = {
  initialIndex?: number
}

export function HeroCarousel({ initialIndex = 0 }: Props) {
  return (
    <HeroErrorBoundary>
      <HeroCarouselInner initialIndex={initialIndex} />
    </HeroErrorBoundary>
  )
}

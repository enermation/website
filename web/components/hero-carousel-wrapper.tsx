'use client'

import dynamic from 'next/dynamic'

// ssr: false must live in a client component (Next.js 16 App Router constraint).
// This wrapper is the client boundary; page.tsx imports it as a normal server-side import.
const HeroCarouselInner = dynamic(
  () => import('@/components/hero-carousel').then(m => ({ default: m.HeroCarousel })),
  { ssr: false, loading: () => <div className="min-h-screen bg-surface-dark" /> }
)

export function HeroCarousel() {
  return <HeroCarouselInner />
}

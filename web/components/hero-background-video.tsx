'use client'

import Threads from '@/components/Threads'

export function HeroBackgroundVideo() {
  return (
    <div className="hero-stage__media" aria-hidden="true">
      <Threads color={[1, 1, 1]} amplitude={1} distance={0.1} enableMouseInteraction={false} />
      <div className="hero-stage__veil" />
    </div>
  )
}

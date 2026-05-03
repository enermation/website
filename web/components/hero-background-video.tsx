'use client'

import Threads from '@/components/Threads'
import { useDeviceTier } from '@/hooks/use-device-tier'

const THREADS_CONFIG = {
  high: { lineCount: 40, targetFps: 60, resolutionScale: 1 },
  mid: { lineCount: 25, targetFps: 30, resolutionScale: 1 },
  low: { lineCount: 15, targetFps: 20, resolutionScale: 0.7 },
} as const

export function HeroBackgroundVideo() {
  const tier = useDeviceTier()

  return (
    <div className="hero-stage__media" aria-hidden="true">
      <Threads
        color={[1, 1, 1]}
        amplitude={1}
        distance={0.1}
        enableMouseInteraction={false}
        {...THREADS_CONFIG[tier]}
      />
      <div className="hero-stage__veil" />
    </div>
  )
}

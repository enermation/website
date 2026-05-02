'use client'

import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import { TextHoverEffect } from '@/components/ui/text-hover-effect'
import { useIsMobile } from '@/hooks/use-mobile'
import {
  heroBrandWordmark,
  heroShowcaseVehicles,
  primaryShowroomCollectionHref,
  productPage,
} from '@/lib/data'
import { cn } from '@/lib/utils'

const HeroScene = dynamic(
  () =>
    import('@/components/hero-carousel').then(module => ({ default: module.HeroCarouselScene })),
  { ssr: false }
)

const SHELL_DELAY_MS = 140
const TEXT_ANIMATION_MS = 4000
const SCENE_REVEAL_DELAY_MS = 120
const TEXT_EXIT_DELAY_MS = 820
const IDLE_DELAY_MS = 520

type HeroPhase =
  | 'shell-visible'
  | 'text-reveal'
  | 'scene-ready'
  | 'text-exit'
  | 'model-drop'
  | 'idle'

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setPrefersReducedMotion(mediaQuery.matches)

    update()
    mediaQuery.addEventListener('change', update)

    return () => mediaQuery.removeEventListener('change', update)
  }, [])

  return prefersReducedMotion
}

type HeroSequenceProps = {
  initialIndex?: number
}

export function HeroSequence({ initialIndex = 0 }: HeroSequenceProps) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const isMobile = useIsMobile()
  const [phase, setPhase] = useState<HeroPhase>('shell-visible')
  const [sceneReady, setSceneReady] = useState(false)
  const [textAnimationComplete, setTextAnimationComplete] = useState(false)
  const [activeModelIndex, setActiveModelIndex] = useState(() =>
    Math.min(Math.max(initialIndex, 0), heroShowcaseVehicles.length - 1)
  )
  const [isInViewport, setIsInViewport] = useState(true)
  const sequenceRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = sequenceRef.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => setIsInViewport(entry.isIntersecting), {
      threshold: 0,
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const handleSceneReady = useCallback(() => {
    setSceneReady(true)
  }, [])

  useEffect(() => {
    setPhase('shell-visible')
    setSceneReady(false)
    setTextAnimationComplete(prefersReducedMotion)

    const timer = window.setTimeout(
      () => setPhase('text-reveal'),
      prefersReducedMotion ? 0 : SHELL_DELAY_MS
    )

    return () => window.clearTimeout(timer)
  }, [prefersReducedMotion])

  useEffect(() => {
    if (phase !== 'text-reveal') return

    if (prefersReducedMotion) {
      setTextAnimationComplete(true)
      return
    }

    setTextAnimationComplete(false)
    const timer = window.setTimeout(() => setTextAnimationComplete(true), TEXT_ANIMATION_MS)

    return () => window.clearTimeout(timer)
  }, [phase, prefersReducedMotion])

  useEffect(() => {
    if (phase !== 'text-reveal' || !sceneReady || !textAnimationComplete) return
    setPhase('scene-ready')
  }, [phase, sceneReady, textAnimationComplete])

  useEffect(() => {
    if (phase !== 'scene-ready') return

    const timer = window.setTimeout(
      () => setPhase('text-exit'),
      prefersReducedMotion ? 0 : SCENE_REVEAL_DELAY_MS
    )

    return () => window.clearTimeout(timer)
  }, [phase, prefersReducedMotion])

  useEffect(() => {
    if (phase !== 'text-exit') return

    const timer = window.setTimeout(
      () => setPhase('model-drop'),
      prefersReducedMotion ? 0 : TEXT_EXIT_DELAY_MS
    )

    return () => window.clearTimeout(timer)
  }, [phase, prefersReducedMotion])

  useEffect(() => {
    if (phase !== 'model-drop') return

    const timer = window.setTimeout(
      () => setPhase('idle'),
      prefersReducedMotion ? 0 : IDLE_DELAY_MS
    )

    return () => window.clearTimeout(timer)
  }, [phase, prefersReducedMotion])

  const shouldMountScene = prefersReducedMotion || phase !== 'shell-visible'
  const shouldRenderWordmark =
    prefersReducedMotion ||
    phase === 'text-reveal' ||
    phase === 'scene-ready' ||
    phase === 'text-exit'
  const shouldRevealScene = phase === 'model-drop' || phase === 'idle'
  const shouldDropModel = phase === 'model-drop' || phase === 'idle' || prefersReducedMotion
  const allowIdleOrbit = phase === 'idle' && !prefersReducedMotion
  const showCarouselControls = phase === 'idle' || prefersReducedMotion
  const activeVehicle = heroShowcaseVehicles[activeModelIndex]

  const navigateModel = useCallback((direction: 1 | -1) => {
    setActiveModelIndex(currentIndex => {
      const total = heroShowcaseVehicles.length
      return (currentIndex + direction + total) % total
    })
  }, [])

  const goToModel = useCallback((nextIndex: number) => {
    setActiveModelIndex(nextIndex)
  }, [])

  return (
    <div
      ref={sequenceRef}
      data-slot="hero-sequence"
      data-phase={phase}
      className="hero-stage__sequence"
    >
      <div className="hero-stage__scene-shell">
        {shouldMountScene ? (
          <div
            className={cn('hero-stage__scene', shouldRevealScene && 'hero-stage__scene--visible')}
          >
            <HeroScene
              activeModelIndex={activeModelIndex}
              onSceneReady={handleSceneReady}
              shouldDropModel={shouldDropModel}
              prefersReducedMotion={prefersReducedMotion}
              allowIdleOrbit={allowIdleOrbit}
              preloadInactiveModel={showCarouselControls}
              isMobile={isMobile}
              sceneVisible={shouldRevealScene}
              isInViewport={isInViewport}
            />
          </div>
        ) : null}
      </div>

      <div className="hero-stage__center">
        <div className="hero-stage__wordmark-shell">
          {shouldRenderWordmark ? (
            <div className="hero-stage__text-hover">
              <TextHoverEffect text={heroBrandWordmark} />
            </div>
          ) : null}
        </div>
      </div>

      <div className="hero-stage__actions">
        <Link href={primaryShowroomCollectionHref} className="hero-stage__cta">
          {productPage.labels.viewAllStockForSale}
        </Link>
      </div>

      <div
        className={cn(
          'hero-stage__carousel-meta',
          showCarouselControls && 'hero-stage__carousel-meta--visible'
        )}
      >
        <p className="hero-stage__model-label">{activeVehicle.label}</p>
        <fieldset className="hero-stage__carousel-controls" aria-roledescription="carousel">
          <legend className="sr-only">Hero model carousel</legend>
          <button
            type="button"
            className="hero-stage__nav-button"
            aria-label="Show previous model"
            onClick={() => navigateModel(-1)}
          >
            <ChevronLeftIcon className="size-5" aria-hidden="true" />
          </button>
          <div className="hero-stage__dots" role="tablist" aria-label="Choose hero model">
            {heroShowcaseVehicles.map((vehicle, index) => (
              <button
                key={vehicle.label}
                type="button"
                role="tab"
                className={cn(
                  'hero-stage__dot',
                  index === activeModelIndex && 'hero-stage__dot--active'
                )}
                aria-label={`Show ${vehicle.label}`}
                aria-selected={index === activeModelIndex}
                aria-current={index === activeModelIndex ? 'true' : undefined}
                onClick={() => goToModel(index)}
              />
            ))}
          </div>
          <button
            type="button"
            className="hero-stage__nav-button"
            aria-label="Show next model"
            onClick={() => navigateModel(1)}
          >
            <ChevronRightIcon className="size-5" aria-hidden="true" />
          </button>
        </fieldset>
      </div>
    </div>
  )
}

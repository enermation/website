'use client'

import { mdiChevronLeft, mdiChevronRight } from '@mdi/js'
import { Icon } from '@mdi/react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { startTransition, useCallback, useEffect, useMemo, useState } from 'react'
import { HeroBrandText } from '@/components/hero-brand-text'
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
const TEXT_REVEAL_MS = 720
const RAINBOW_SWEEP_MS = 1200
const SCENE_REVEAL_DELAY_MS = 120
const TEXT_EXIT_DELAY_MS = 420
const IDLE_DELAY_MS = 520

type HeroPhase =
  | 'shell-visible'
  | 'text-reveal'
  | 'rainbow-sweep'
  | 'scene-ready'
  | 'model-drop'
  | 'text-exit'
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
  const [phase, setPhase] = useState<HeroPhase>('shell-visible')
  const [sceneReady, setSceneReady] = useState(false)
  const [sweepComplete, setSweepComplete] = useState(false)
  const [activeModelIndex, setActiveModelIndex] = useState(() =>
    Math.min(Math.max(initialIndex, 0), heroShowcaseVehicles.length - 1)
  )

  const handleSceneReady = useCallback(() => {
    setSceneReady(true)
  }, [])

  useEffect(() => {
    setActiveModelIndex(Math.min(Math.max(initialIndex, 0), heroShowcaseVehicles.length - 1))
  }, [initialIndex])

  useEffect(() => {
    setPhase('shell-visible')
    setSceneReady(false)
    setSweepComplete(prefersReducedMotion)

    const timer = window.setTimeout(
      () => setPhase('text-reveal'),
      prefersReducedMotion ? 0 : SHELL_DELAY_MS
    )

    return () => window.clearTimeout(timer)
  }, [prefersReducedMotion])

  useEffect(() => {
    if (phase !== 'text-reveal') return

    const timer = window.setTimeout(
      () => setPhase('rainbow-sweep'),
      prefersReducedMotion ? 0 : TEXT_REVEAL_MS
    )

    return () => window.clearTimeout(timer)
  }, [phase, prefersReducedMotion])

  useEffect(() => {
    if (phase !== 'rainbow-sweep') return
    if (prefersReducedMotion) {
      setSweepComplete(true)
      return
    }

    setSweepComplete(false)
    const timer = window.setTimeout(() => setSweepComplete(true), RAINBOW_SWEEP_MS)

    return () => window.clearTimeout(timer)
  }, [phase, prefersReducedMotion])

  useEffect(() => {
    if (phase !== 'rainbow-sweep' || !sceneReady || !sweepComplete) return
    setPhase('scene-ready')
  }, [phase, sceneReady, sweepComplete])

  useEffect(() => {
    if (phase !== 'scene-ready') return

    const timer = window.setTimeout(
      () => setPhase('model-drop'),
      prefersReducedMotion ? 0 : SCENE_REVEAL_DELAY_MS
    )

    return () => window.clearTimeout(timer)
  }, [phase, prefersReducedMotion])

  useEffect(() => {
    if (phase !== 'model-drop') return

    const timer = window.setTimeout(
      () => setPhase('text-exit'),
      prefersReducedMotion ? 0 : TEXT_EXIT_DELAY_MS
    )

    return () => window.clearTimeout(timer)
  }, [phase, prefersReducedMotion])

  useEffect(() => {
    if (phase !== 'text-exit') return

    const timer = window.setTimeout(
      () => setPhase('idle'),
      prefersReducedMotion ? 0 : IDLE_DELAY_MS
    )

    return () => window.clearTimeout(timer)
  }, [phase, prefersReducedMotion])

  const shouldMountScene = prefersReducedMotion || phase !== 'shell-visible'
  const shouldMountSceneAfterIntro =
    prefersReducedMotion ||
    phase === 'rainbow-sweep' ||
    phase === 'scene-ready' ||
    phase === 'model-drop' ||
    phase === 'text-exit' ||
    phase === 'idle'
  const shouldRevealScene =
    phase === 'scene-ready' || phase === 'model-drop' || phase === 'text-exit' || phase === 'idle'
  const shouldDropModel =
    phase === 'model-drop' || phase === 'text-exit' || phase === 'idle' || prefersReducedMotion
  const shouldTriggerSweep =
    phase === 'rainbow-sweep' ||
    phase === 'scene-ready' ||
    phase === 'model-drop' ||
    phase === 'text-exit'
  const allowIdleOrbit = phase === 'idle' && !prefersReducedMotion
  const showCarouselControls = phase === 'text-exit' || phase === 'idle' || prefersReducedMotion
  const activeVehicle = heroShowcaseVehicles[activeModelIndex]

  const navigateModel = useCallback((direction: 1 | -1) => {
    startTransition(() => {
      setActiveModelIndex(currentIndex => {
        const total = heroShowcaseVehicles.length
        return (currentIndex + direction + total) % total
      })
    })
  }, [])

  const goToModel = useCallback((nextIndex: number) => {
    startTransition(() => {
      setActiveModelIndex(nextIndex)
    })
  }, [])

  const modelDots = useMemo(
    () =>
      heroShowcaseVehicles.map((vehicle, index) => (
        <button
          key={vehicle.label}
          type="button"
          role="tab"
          className={cn('hero-stage__dot', index === activeModelIndex && 'hero-stage__dot--active')}
          aria-label={`Show ${vehicle.label}`}
          aria-selected={index === activeModelIndex}
          aria-current={index === activeModelIndex ? 'true' : undefined}
          onClick={() => goToModel(index)}
        />
      )),
    [activeModelIndex, goToModel]
  )

  return (
    <div data-slot="hero-sequence" data-phase={phase} className="hero-stage__sequence">
      <div className="hero-stage__scene-shell">
        {shouldMountScene && shouldMountSceneAfterIntro ? (
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
            />
          </div>
        ) : null}
      </div>

      <div className="hero-stage__center">
        <div className="hero-stage__wordmark-shell">
          <HeroBrandText
            text={heroBrandWordmark}
            sweepActive={shouldTriggerSweep}
            prefersReducedMotion={prefersReducedMotion}
          />
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
            <Icon path={mdiChevronLeft} size={1} className="size-5" aria-hidden="true" />
          </button>
          <div className="hero-stage__dots" role="tablist" aria-label="Choose hero model">
            {modelDots}
          </div>
          <button
            type="button"
            className="hero-stage__nav-button"
            aria-label="Show next model"
            onClick={() => navigateModel(1)}
          >
            <Icon path={mdiChevronRight} size={1} className="size-5" aria-hidden="true" />
          </button>
        </fieldset>
      </div>
    </div>
  )
}

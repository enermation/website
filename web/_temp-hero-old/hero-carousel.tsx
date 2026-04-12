'use client'

import { mdiChevronLeft, mdiChevronRight } from '@mdi/js'
import { Icon } from '@mdi/react'
import { PerformanceMonitor, Stage, useGLTF } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import type { Group } from 'three'
import { HeroLoadingSkeleton } from '@/components/hero-loading-skeleton'
import { heroCategories } from '@/lib/data'

const TOTAL = heroCategories.length

const MODEL_PATHS = ['/models/sedan.glb', '/models/suv.glb', '/models/commercial.glb']

// SUV and commercial models are oriented length-along-Z (front faces camera).
// Rotate 90° around Y so the side profile faces the camera, matching the sedan.
const MODEL_ROTATIONS = [0, Math.PI / 2, Math.PI / 2]

useGLTF.preload('/models/sedan.glb')
useGLTF.preload('/models/suv.glb')
useGLTF.preload('/models/commercial.glb')

// ── Reduced motion hook ───────────────────────────────────────────────────────

function useReducedMotion() {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return reduced
}

// ── WebGL context loss hook ──────────────────────────────────────────────────

function useWebGLContextLoss(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  const [isContextLost, setIsContextLost] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const handleContextLost = (e: Event) => {
      e.preventDefault()
      setIsContextLost(true)
    }

    const handleContextRestored = () => {
      setIsContextLost(false)
    }

    canvas.addEventListener('webglcontextlost', handleContextLost)
    canvas.addEventListener('webglcontextrestored', handleContextRestored)

    return () => {
      canvas.removeEventListener('webglcontextlost', handleContextLost)
      canvas.removeEventListener('webglcontextrestored', handleContextRestored)
    }
  }, [canvasRef])

  return isContextLost
}

// ── Adaptive DPR controller ──────────────────────────────────────────────────

function AdaptiveDPRController() {
  const setDpr = useThree(state => state.setDpr)

  const handleFallback = useCallback(() => {
    setDpr(1)
  }, [setDpr])

  const handleChange = useCallback(
    ({ factor }: { factor: number }) => {
      const newDpr = Math.round((0.5 + 1.5 * factor) * 10) / 10
      setDpr(newDpr)
    },
    [setDpr]
  )

  return <PerformanceMonitor flipflops={3} onFallback={handleFallback} onChange={handleChange} />
}

// ── Single model, auto-framed with Stage ──────────────────────────────────────

function CategoryMesh({
  index,
  reducedMotion,
  onModelLoad,
}: {
  index: number
  reducedMotion: boolean
  onModelLoad?: () => void
}) {
  const groupRef = useRef<Group>(null)
  const [hasLoaded, setHasLoaded] = useState(false)

  const { scene } = useGLTF(MODEL_PATHS[index])

  // Report load for skeleton removal
  useEffect(() => {
    if (!hasLoaded) {
      setHasLoaded(true)
      onModelLoad?.()
    }
  }, [hasLoaded, onModelLoad])

  // Slow idle rotation
  useFrame((_, delta) => {
    if (!groupRef.current || reducedMotion) return
    groupRef.current.rotation.y += delta * 0.35
  })

  return (
    <Stage adjustCamera={1.5} environment="city" shadows="contact" intensity={1.2}>
      <group ref={groupRef} rotation-y={MODEL_ROTATIONS[index]}>
        <primitive object={scene} />
      </group>
    </Stage>
  )
}

// ── Hero carousel ─────────────────────────────────────────────────────────────

export function HeroCarousel({ initialIndex = 0 }: { initialIndex?: number }) {
  const [activeIndex, setActiveIndex] = useState(initialIndex)
  const [isLoading, setIsLoading] = useState(true)
  const dragStartX = useRef<number | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const reducedMotion = useReducedMotion()
  const isContextLost = useWebGLContextLoss(canvasRef)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const navigate = useCallback(
    (dir: 1 | -1) => {
      const newIndex = (activeIndex + dir + TOTAL) % TOTAL
      setActiveIndex(newIndex)
      // Update URL without reload
      const params = new URLSearchParams(searchParams.toString())
      params.set('slide', String(newIndex))
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [activeIndex, searchParams, pathname, router]
  )

  const goToSlide = useCallback(
    (index: number) => {
      setActiveIndex(index)
      const params = new URLSearchParams(searchParams.toString())
      params.set('slide', String(index))
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [searchParams, pathname, router]
  )

  const onPointerDown = (e: React.PointerEvent) => {
    dragStartX.current = e.clientX
  }

  const onPointerUp = (e: React.PointerEvent) => {
    if (dragStartX.current === null) return
    const delta = e.clientX - dragStartX.current
    if (Math.abs(delta) > 50) navigate(delta < 0 ? 1 : -1)
    dragStartX.current = null
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') navigate(-1)
    if (e.key === 'ArrowRight') navigate(1)
  }

  const handleModelLoad = useCallback(() => {
    setIsLoading(false)
  }, [])

  // Sync initialIndex prop
  useEffect(() => {
    setActiveIndex(initialIndex)
  }, [initialIndex])

  const active = heroCategories[activeIndex]

  // WebGL context lost → static fallback
  if (isContextLost) {
    return (
      <section
        aria-label="Product showcase"
        className="relative min-h-screen bg-surface-dark flex items-center justify-center"
      >
        <div className="text-center px-4">
          <h1 className="font-display font-normal text-section uppercase tracking-widest text-on-dark mb-6">
            {active.label}
          </h1>
          <p className="font-body text-15 text-on-dark-muted mb-8 max-w-md mx-auto">
            Interactive 3D viewer is unavailable. Please browse our collection directly.
          </p>
          <Link
            href={active.href}
            className="inline-flex items-center justify-center rounded-none border-2 border-on-dark bg-transparent px-10 py-3 font-heading font-semibold text-13 uppercase tracking-wider text-on-dark transition-colors duration-200 hover:bg-on-dark hover:text-surface-dark"
          >
            Browse {active.label}
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section
      aria-label="Product showcase carousel"
      className="relative min-h-screen overflow-hidden select-none touch-manipulation"
      aria-roledescription="carousel"
    >
      <fieldset
        aria-label="Use arrow keys to navigate slides"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onKeyDown={onKeyDown}
        className="contents"
      >
        {/* Three.js canvas */}
        <div className="absolute inset-0">
          <Canvas
            ref={canvasRef}
            camera={{ position: [0, 2, 5], fov: 45 }}
            dpr={[1, 2]}
            frameloop="demand"
            gl={{ antialias: true, alpha: true }}
          >
            <color attach="background" args={['oklch(var(--surface-dark))']} />
            <AdaptiveDPRController />
            <Suspense fallback={null}>
              <CategoryMesh
                key={activeIndex}
                index={activeIndex}
                reducedMotion={reducedMotion}
                onModelLoad={handleModelLoad}
              />
            </Suspense>
          </Canvas>

          {/* Loading skeleton overlay */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-surface-dark">
              <HeroLoadingSkeleton />
            </div>
          )}
        </div>

        {/* Category label + CTA + dots */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center gap-6 pb-16">
          <h1 className="font-display font-normal text-section uppercase tracking-widest text-white text-center">
            {active.label}
          </h1>
          <Link
            href={active.href}
            className="pointer-events-auto inline-flex items-center justify-center rounded-none border-2 border-white bg-black/70 px-10 py-3 font-heading font-semibold text-13 uppercase tracking-wider text-white backdrop-blur-sm transition-colors duration-200 hover:bg-white hover:text-black"
          >
            Browse {active.label}
          </Link>
          <div className="flex items-center gap-3">
            {heroCategories.map((cat, i) => (
              <button
                key={cat.label}
                type="button"
                aria-label={`Show ${cat.label}`}
                onClick={() => goToSlide(i)}
                className={`pointer-events-auto rounded-full transition-all duration-300 ${
                  i === activeIndex
                    ? 'size-2.5 bg-on-dark'
                    : 'size-1.5 bg-on-dark/40 hover:bg-on-dark/70'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Arrow navigation */}
        <button
          type="button"
          aria-label="Previous category"
          onClick={() => navigate(-1)}
          className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 flex size-12 items-center justify-center rounded-full bg-white/10 border border-white/20 backdrop-blur-sm text-white hover:bg-white/20 hover:border-white/40 transition-all duration-200"
        >
          <Icon path={mdiChevronLeft} size={1} className="size-6" />
        </button>
        <button
          type="button"
          aria-label="Next category"
          onClick={() => navigate(1)}
          className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 flex size-12 items-center justify-center rounded-full bg-white/10 border border-white/20 backdrop-blur-sm text-white hover:bg-white/20 hover:border-white/40 transition-all duration-200"
        >
          <Icon path={mdiChevronRight} size={1} className="size-6" />
        </button>
      </fieldset>
    </section>
  )
}

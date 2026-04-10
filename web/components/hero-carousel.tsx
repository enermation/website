'use client'

import { mdiChevronLeft, mdiChevronRight } from '@mdi/js'
import { Icon } from '@mdi/react'
import { Stage, useGLTF } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import Link from 'next/link'
import { Suspense, useEffect, useRef, useState } from 'react'
import type { Group } from 'three'
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

// ── Single model, auto-framed with Stage ──────────────────────────────────────

function CategoryMesh({
  index,
  reducedMotion,
}: {
  index: number
  reducedMotion: boolean
}) {
  const groupRef = useRef<Group>(null)
  const { scene } = useGLTF(MODEL_PATHS[index])

  // Slow idle rotation
  useFrame((_, delta) => {
    if (!groupRef.current || reducedMotion) return
    groupRef.current.rotation.y += delta * 0.35
  })

  return (
    <Stage
      adjustCamera={1.5}
      environment="city"
      shadows="contact"
      intensity={1.2}
    >
      <group
        ref={groupRef}
        rotation-y={MODEL_ROTATIONS[index]}
      >
        <primitive object={scene} />
      </group>
    </Stage>
  )
}

// ── Hero carousel ─────────────────────────────────────────────────────────────

export function HeroCarousel() {
  const [activeIndex, setActiveIndex] = useState(0)
  const dragStartX = useRef<number | null>(null)
  const reducedMotion = useReducedMotion()

  const navigate = (dir: 1 | -1) => setActiveIndex(i => (i + dir + TOTAL) % TOTAL)

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

  const active = heroCategories[activeIndex]

  return (
    <section
      className="relative min-h-screen overflow-hidden select-none touch-manipulation"
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onKeyDown={onKeyDown}
      tabIndex={0}
    >
      {/* Three.js canvas */}
      <div className="absolute inset-0">
        <Canvas camera={{ position: [0, 2, 5], fov: 45 }} dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
          <color attach="background" args={['#1a1a1a']} />
          <Suspense fallback={null}>
            <CategoryMesh key={activeIndex} index={activeIndex} reducedMotion={reducedMotion} />
          </Suspense>
        </Canvas>
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
                onClick={() => setActiveIndex(i)}
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
    </section>
  )
}

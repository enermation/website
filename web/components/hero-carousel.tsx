'use client'

import { useGSAP } from '@gsap/react'
import { mdiChevronLeft, mdiChevronRight } from '@mdi/js'
import { Icon } from '@mdi/react'
import { Center, ContactShadows, Environment, useGLTF } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import gsap from 'gsap'
import Link from 'next/link'
import { Suspense, useEffect, useRef, useState } from 'react'
import type { Group, Mesh, MeshStandardMaterial } from 'three'
import { heroCategories } from '@/lib/data'

gsap.registerPlugin(useGSAP)

const TOTAL = heroCategories.length

const MODEL_PATHS = [
  '/models/sedan.glb',
  '/models/suv.glb',
  '/models/commercial.glb',
]

// Per-model scale multipliers to normalize wildly different native sizes
// Empirical scales — gltf-transform flatten didn't fully bake root scale matrices,
// so actual render size is ~1/5 of inspect bbox. Tuned so each model fills ~70% of horizontal at fov=20, z=5.
const MODEL_SCALES = [2.0, 2.2, 1.9]

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

// ── Single model, centered ────────────────────────────────────────────────────

function CategoryMesh({
  index,
  reducedMotion,
}: {
  index: number
  reducedMotion: boolean
}) {
  const groupRef = useRef<Group>(null)
  const materialsRef = useRef<MeshStandardMaterial[]>([])
  const { scene } = useGLTF(MODEL_PATHS[index])
  const nativeScale = MODEL_SCALES[index]

  // Collect materials once and enable transparency
  useEffect(() => {
    const mats: MeshStandardMaterial[] = []
    scene.traverse(obj => {
      const mesh = obj as Mesh
      if (mesh.isMesh && mesh.material) {
        const mat = mesh.material as MeshStandardMaterial
        mat.transparent = true
        mats.push(mat)
      }
    })
    materialsRef.current = mats
  }, [scene])

  // Slow idle rotation
  useFrame((_, delta) => {
    if (!groupRef.current || reducedMotion) return
    groupRef.current.rotation.y += delta * 0.35
  })

  return (
    <group scale={[nativeScale, nativeScale, nativeScale]}>
      <Center>
        <primitive ref={groupRef} object={scene} />
      </Center>
    </group>
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
      className="relative min-h-screen overflow-hidden select-none touch-manipulation bg-white"
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onKeyDown={onKeyDown}
      tabIndex={0}
    >
      {/* Three.js canvas — canvas is transparent, white bg comes from section */}
      <div className="absolute inset-0">
        <Canvas camera={{ position: [0, 0.5, 5], fov: 20 }} dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
          {/* Environment for IBL lighting only — no background */}
          <Suspense fallback={null}>
            <Environment preset="city" environmentIntensity={1.2} />
          </Suspense>
          <ContactShadows
            position={[0, -1.1, 0]}
            opacity={0.4}
            scale={12}
            blur={2.5}
            far={4}
            resolution={256}
            frames={1}
          />
          {/* key forces unmount/remount on index change — preloaded so swap is instant */}
          <Suspense fallback={null}>
            <CategoryMesh key={activeIndex} index={activeIndex} reducedMotion={reducedMotion} />
          </Suspense>
        </Canvas>
      </div>

      {/* Bottom fade — white gradient so text sits on clean base */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-white via-white/80 to-transparent" />

      {/* Category label + CTA + dots */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center gap-6 pb-16">
        <h1 className="font-display font-normal text-section uppercase tracking-widest text-foreground text-center">
          {active.label}
        </h1>
        <Link
          href={active.href}
          className="pointer-events-auto inline-flex items-center justify-center rounded-none border-2 border-foreground bg-transparent px-10 py-3 font-heading font-semibold text-13 uppercase tracking-wider text-foreground transition-colors duration-200 hover:bg-foreground hover:text-background"
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
                  ? 'size-2.5 bg-foreground'
                  : 'size-1.5 bg-foreground/30 hover:bg-foreground/60'
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
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 flex size-10 items-center justify-center text-foreground/40 hover:text-foreground transition-colors duration-200"
      >
        <Icon path={mdiChevronLeft} size={1} className="size-7" />
      </button>
      <button
        type="button"
        aria-label="Next category"
        onClick={() => navigate(1)}
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 flex size-10 items-center justify-center text-foreground/40 hover:text-foreground transition-colors duration-200"
      >
        <Icon path={mdiChevronRight} size={1} className="size-7" />
      </button>
    </section>
  )
}

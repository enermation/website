'use client'

import { useGSAP } from '@gsap/react'
import { mdiChevronLeft, mdiChevronRight } from '@mdi/js'
import { Icon } from '@mdi/react'
import { ContactShadows, Environment, useGLTF } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import gsap from 'gsap'
import Link from 'next/link'
import { Suspense, useEffect, useRef, useState } from 'react'
import type { Group, Material, Mesh, MeshStandardMaterial } from 'three'
import { heroCategories } from '@/lib/data'

gsap.registerPlugin(useGSAP)

const TOTAL = heroCategories.length
const STEP = Math.PI / 2 // 90° between each of the 4 items
const RADIUS = 3.2

const MODEL_PATHS = [
  '/models/sedan.glb',
  '/models/suv.glb',
  '/models/commercial.glb',
  '/models/spare-parts.glb',
]

// Preload all models at module level (outside components)
useGLTF.preload('/models/sedan.glb')
useGLTF.preload('/models/suv.glb')
useGLTF.preload('/models/commercial.glb')
useGLTF.preload('/models/spare-parts.glb')

// ── Individual category mesh ──────────────────────────────────────────────────

function CategoryMesh({ index, activeIndex }: { index: number; activeIndex: number }) {
  const groupRef = useRef<Group>(null)
  const { scene } = useGLTF(MODEL_PATHS[index])

  const angle = index * STEP
  const x = Math.sin(angle) * RADIUS
  const z = Math.cos(angle) * RADIUS

  // Compute target visual state based on position relative to the active item
  const relIdx = (index - activeIndex + TOTAL) % TOTAL
  const isFront = relIdx === 0
  const isBack = relIdx === 2
  const targetScale = isFront ? 1.1 : isBack ? 0.3 : 0.65
  const targetOpacity = isFront ? 1 : isBack ? 0.08 : 0.4

  useFrame((_, delta) => {
    if (!groupRef.current) return
    const lerpT = Math.min(1, delta * 5)

    // Idle slow rotation only for the active (front) mesh
    if (isFront) groupRef.current.rotation.y += delta * 0.35

    // Smooth scale toward target
    groupRef.current.scale.x += (targetScale - groupRef.current.scale.x) * lerpT
    groupRef.current.scale.y += (targetScale - groupRef.current.scale.y) * lerpT
    groupRef.current.scale.z += (targetScale - groupRef.current.scale.z) * lerpT

    // Smooth opacity on all materials in the scene
    scene.traverse(obj => {
      const mesh = obj as Mesh
      if (mesh.isMesh && mesh.material) {
        const mat = mesh.material as Material
        if ('opacity' in mat) {
          ;(mat as MeshStandardMaterial).opacity +=
            (targetOpacity - (mat as MeshStandardMaterial).opacity) * lerpT
        }
      }
    })
  })

  return <primitive ref={groupRef} object={scene} position={[x, 0, z]} />
}

// ── 3D scene ──────────────────────────────────────────────────────────────────

function CarouselScene({ activeIndex }: { activeIndex: number }) {
  const groupRef = useRef<Group>(null)

  // Animate group rotation on index change.
  // useEffect (not useGSAP) because we target a Three.js object, not a DOM ref.
  useEffect(() => {
    if (!groupRef.current) return
    const tween = gsap.to(groupRef.current.rotation, {
      y: -(activeIndex * STEP),
      duration: 0.85,
      ease: 'power3.out',
      overwrite: true,
    })
    return () => {
      tween.kill()
    }
  }, [activeIndex])

  return (
    <group ref={groupRef}>
      {heroCategories.map((cat, i) => (
        <Suspense key={cat.label} fallback={null}>
          <CategoryMesh index={i} activeIndex={activeIndex} />
        </Suspense>
      ))}
    </group>
  )
}

// ── Hero carousel ─────────────────────────────────────────────────────────────

export function HeroCarousel() {
  const [activeIndex, setActiveIndex] = useState(0)
  const dragStartX = useRef<number | null>(null)

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

  const active = heroCategories[activeIndex]

  return (
    <section
      className="relative min-h-screen bg-surface-dark overflow-hidden select-none touch-none"
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
    >
      {/* Three.js canvas — fills the section absolutely */}
      <div className="absolute inset-0">
        <Canvas camera={{ position: [0, 1.8, 7.5], fov: 38 }} dpr={[1, 2]} gl={{ antialias: true }}>
          <ambientLight intensity={0.15} />
          <directionalLight position={[6, 8, 4]} intensity={1.8} />
          <directionalLight position={[-4, 2, -4]} intensity={0.25} />
          <Suspense fallback={null}>
            <Environment preset="city" />
          </Suspense>
          <ContactShadows
            position={[0, -0.55, 0]}
            opacity={0.6}
            scale={12}
            blur={2.5}
            far={4}
            resolution={256}
          />
          <CarouselScene activeIndex={activeIndex} />
        </Canvas>
      </div>

      {/* Bottom fade — blends 3D into dark background */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-surface-dark to-transparent" />

      {/* Category label + CTA + dots */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center gap-6 pb-16">
        <h2 className="font-display font-normal text-section uppercase tracking-widest text-on-dark text-center">
          {active.label}
        </h2>
        <Link
          href={active.href}
          className="pointer-events-auto inline-flex items-center justify-center rounded-none border-2 border-on-dark bg-transparent px-10 py-3 font-heading font-semibold text-13 uppercase tracking-wider text-on-dark transition-colors duration-200 hover:bg-on-dark hover:text-surface-dark"
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
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 flex size-10 items-center justify-center text-on-dark/50 hover:text-on-dark transition-colors duration-200"
      >
        <Icon path={mdiChevronLeft} size={1} className="size-7" />
      </button>
      <button
        type="button"
        aria-label="Next category"
        onClick={() => navigate(1)}
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 flex size-10 items-center justify-center text-on-dark/50 hover:text-on-dark transition-colors duration-200"
      >
        <Icon path={mdiChevronRight} size={1} className="size-7" />
      </button>
    </section>
  )
}

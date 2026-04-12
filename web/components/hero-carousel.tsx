'use client'

import { mdiChevronLeft, mdiChevronRight } from '@mdi/js'
import { Icon } from '@mdi/react'
import { ContactShadows, Environment, Lightformer, OrbitControls, useGLTF } from '@react-three/drei'
import { applyProps, Canvas, useFrame, useLoader } from '@react-three/fiber'
import { Bloom, EffectComposer, LUT } from '@react-three/postprocessing'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { LUTCubeLoader } from 'postprocessing'
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Group } from 'three'
import * as THREE from 'three'
import { HeroLoadingSkeleton } from '@/components/hero-loading-skeleton'
import { heroCategories } from '@/lib/data'

const MODEL_PATH = '/models/lambo.glb'

useGLTF.preload(MODEL_PATH)

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

// ── Car model (lambo-style material tweaks) ───────────────────────────────────

function CarModel({
  rotation = [0, Math.PI / 1.5, 0] as [number, number, number],
  scale = 0.015,
  reducedMotion,
  onLoaded,
}: {
  rotation?: [number, number, number]
  scale?: number
  reducedMotion: boolean
  onLoaded?: () => void
}) {
  const groupRef = useRef<Group>(null)
  const { scene, nodes, materials } = useGLTF(MODEL_PATH)

  // Lambo-style material fixes
  useMemo(() => {
    Object.values(nodes).forEach(node => {
      if (node.isMesh) {
        // Fix glass normals
        if (node.name.startsWith('glass')) node.geometry.computeVertexNormals()
        // Fix logo, too dark
        if (node.name === 'silver_001_BreakDiscs_0')
          node.material = applyProps(materials.BreakDiscs.clone(), { color: '#ddd' })
      }
    })
    // Fix windows
    if (nodes.glass_003) nodes.glass_003.scale.setScalar(2.7)
    // Fix inner frame
    if (materials.FrameBlack)
      applyProps(materials.FrameBlack, { metalness: 0.75, roughness: 0, color: 'black' })
    // Wheels: chrome to black matte
    if (materials.Chrome)
      applyProps(materials.Chrome, { metalness: 1, roughness: 0, color: '#333' })
    if (materials.BreakDiscs)
      applyProps(materials.BreakDiscs, { metalness: 0.2, roughness: 0.2, color: '#555' })
    if (materials.TiresGum)
      applyProps(materials.TiresGum, { metalness: 0, roughness: 0.4, color: '#181818' })
    if (materials.GreyElements)
      applyProps(materials.GreyElements, { metalness: 0, color: '#292929' })
    // Make front and tail LEDs emit light
    if (materials.emitbrake)
      applyProps(materials.emitbrake, { emissiveIntensity: 3, toneMapped: false })
    if (materials.LightsFrontLed)
      applyProps(materials.LightsFrontLed, { emissiveIntensity: 3, toneMapped: false })
    // Paint: yellow to black with clearcoat
    const paintNode = nodes.yellow_WhiteCar_0
    if (paintNode) {
      paintNode.material = new THREE.MeshPhysicalMaterial({
        roughness: 0.3,
        metalness: 0.05,
        color: '#111',
        envMapIntensity: 0.75,
        clearcoatRoughness: 0,
        clearcoat: 1,
      })
    }
  }, [nodes, materials])

  useEffect(() => {
    onLoaded?.()
  }, [onLoaded])

  useFrame((_, delta) => {
    if (!groupRef.current || reducedMotion) return
    groupRef.current.rotation.y += delta * 0.35
  })

  return (
    <group ref={groupRef} rotation={rotation}>
      <primitive object={scene} scale={scale} />
    </group>
  )
}

// ── Post-processing (Bloom + LUT color grading) ──────────────────────────────
// Note: SSR was removed from @react-three/postprocessing v3.
// Reflections come from the Environment + Lightformer setup instead.

function PostProcessing() {
  const lut = useLoader(LUTCubeLoader, '/F-6800-STD.cube')

  return (
    <EffectComposer enableNormalPass={false}>
      <Bloom luminanceThreshold={0.2} mipmapBlur luminanceSmoothing={0} intensity={1.75} />
      <LUT lut={lut} />
    </EffectComposer>
  )
}

// ── Environment (lambo-style: custom Lightformer panels) ──────────────────────

function StudioEnvironment() {
  return (
    <Environment resolution={512}>
      {/* Ceiling panels */}
      <Lightformer
        intensity={2}
        rotation-x={Math.PI / 2}
        position={[0, 4, -9]}
        scale={[10, 1, 1]}
      />
      <Lightformer
        intensity={2}
        rotation-x={Math.PI / 2}
        position={[0, 4, -6]}
        scale={[10, 1, 1]}
      />
      <Lightformer
        intensity={2}
        rotation-x={Math.PI / 2}
        position={[0, 4, -3]}
        scale={[10, 1, 1]}
      />
      <Lightformer intensity={2} rotation-x={Math.PI / 2} position={[0, 4, 0]} scale={[10, 1, 1]} />
      <Lightformer intensity={2} rotation-x={Math.PI / 2} position={[0, 4, 3]} scale={[10, 1, 1]} />
      <Lightformer intensity={2} rotation-x={Math.PI / 2} position={[0, 4, 6]} scale={[10, 1, 1]} />
      <Lightformer intensity={2} rotation-x={Math.PI / 2} position={[0, 4, 9]} scale={[10, 1, 1]} />
      {/* Side walls */}
      <Lightformer
        intensity={2}
        rotation-y={Math.PI / 2}
        position={[-50, 2, 0]}
        scale={[100, 2, 1]}
      />
      <Lightformer
        intensity={2}
        rotation-y={-Math.PI / 2}
        position={[50, 2, 0]}
        scale={[100, 2, 1]}
      />
      {/* Key light - subtle accent */}
      <Lightformer
        form="ring"
        color="#ff4444"
        intensity={10}
        scale={2}
        position={[10, 5, 10]}
        onUpdate={self => self.lookAt(0, 0, 0)}
      />
    </Environment>
  )
}

// ── 3D Scene ──────────────────────────────────────────────────────────────────

function Scene({
  reducedMotion,
  onModelLoaded,
}: {
  reducedMotion: boolean
  onModelLoaded: () => void
}) {
  return (
    <>
      <StudioEnvironment />
      <hemisphereLight intensity={0.5} />
      <CarModel reducedMotion={reducedMotion} onLoaded={onModelLoaded} />
      {/* Decorative floor rings */}
      <mesh scale={4} position={[3, -1.161, -1.5]} rotation={[-Math.PI / 2, 0, Math.PI / 2.5]}>
        <ringGeometry args={[0.9, 1, 4, 1]} />
        <meshStandardMaterial color="white" roughness={0.75} />
      </mesh>
      <mesh scale={4} position={[-3, -1.161, -1]} rotation={[-Math.PI / 2, 0, Math.PI / 2.5]}>
        <ringGeometry args={[0.9, 1, 3, 1]} />
        <meshStandardMaterial color="white" roughness={0.75} />
      </mesh>
      <ContactShadows
        resolution={1024}
        frames={1}
        position={[0, -1.16, 0]}
        scale={15}
        blur={0.5}
        opacity={1}
        far={20}
      />
      <PostProcessing />
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        minPolarAngle={Math.PI / 2.2}
        maxPolarAngle={Math.PI / 2.2}
      />
    </>
  )
}

// ── Hero carousel ─────────────────────────────────────────────────────────────

export function HeroCarousel({ initialIndex = 0 }: { initialIndex?: number }) {
  const [activeIndex, setActiveIndex] = useState(initialIndex)
  const [isLoading, setIsLoading] = useState(true)
  const dragStartX = useRef<number | null>(null)
  const reducedMotion = useReducedMotion()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const navigate = useCallback(
    (dir: 1 | -1) => {
      const newIndex = (activeIndex + dir + TOTAL) % TOTAL
      setActiveIndex(newIndex)
      setIsLoading(true)
      const params = new URLSearchParams(searchParams.toString())
      params.set('slide', String(newIndex))
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [activeIndex, searchParams, pathname, router]
  )

  const goToSlide = useCallback(
    (index: number) => {
      setActiveIndex(index)
      setIsLoading(true)
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

  const handleModelLoaded = useCallback(() => {
    setIsLoading(false)
  }, [])

  useEffect(() => {
    setActiveIndex(initialIndex)
  }, [initialIndex])

  const active = heroCategories[activeIndex]

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
            camera={{ position: [0, 0, 15], fov: 25 }}
            dpr={[1, 1.5]}
            gl={{ logarithmicDepthBuffer: true, antialias: false }}
          >
            <color attach="background" args={['#15151a']} />
            <Suspense fallback={null}>
              <Scene
                activeIndex={activeIndex}
                reducedMotion={reducedMotion}
                onModelLoaded={handleModelLoaded}
              />
            </Suspense>
          </Canvas>

          {/* Loading skeleton overlay */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#15151a]">
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

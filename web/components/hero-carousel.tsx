'use client'

import { mdiChevronLeft, mdiChevronRight } from '@mdi/js'
import { Icon } from '@mdi/react'
import {
  ContactShadows,
  Environment,
  PerformanceMonitor,
  useEnvironment,
  useGLTF,
} from '@react-three/drei'
import { applyProps, Canvas, type ThreeElements, useFrame, useLoader } from '@react-three/fiber'
import { Bloom, EffectComposer, LUT } from '@react-three/postprocessing'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { LUTCubeLoader } from 'postprocessing'
import { forwardRef, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Group } from 'three'
import * as THREE from 'three'
import { heroBackgroundVideoUrl, heroCategories } from '@/lib/data'

const MAX_3D_SLIDES = 2
const TOTAL = Math.min(heroCategories.length, MAX_3D_SLIDES)

// Performance thresholds
const DPR_MIN = 1
const DPR_MAX = 2
const DPR_START = 1.5
const ENV_RES_HIGH = 512
const ENV_RES_LOW = 256
const SHADOW_RES_HIGH = 1024
const SHADOW_RES_LOW = 512

const MODELS = [
  {
    path: '/models/lambo.glb',
    scale: 0.015,
    rotation: [0, Math.PI / 1.5, 0] as [number, number, number],
  },
  {
    path: '/models/911-transformed.glb',
    scale: 1.6,
    rotation: [0, Math.PI / 5, 0] as [number, number, number],
  },
]

// Optimization: Initially only preload the first model to keep LCP/initial load fast
useGLTF.preload(MODELS[0].path)
useEnvironment.preload({ files: '/models/factory-road-turnaround_256.hdr' })

// Client-only guard to prevent hydration mismatch
function useIsClient() {
  const [isClient, setIsClient] = useState(false)
  useEffect(() => setIsClient(true), [])
  return isClient
}

// ── Lambo model ──────────────────────────────────────────────────────────────

const LamboModel = forwardRef<Group, ThreeElements['group'] & { onLoaded?: () => void }>(
  ({ onLoaded, ...props }, ref) => {
    const { scene, nodes, materials } = useGLTF(MODELS[0].path)

    useMemo(() => {
      Object.values(nodes).forEach(node => {
        if ((node as THREE.Mesh).isMesh) {
          const mesh = node as THREE.Mesh
          if (mesh.name.startsWith('glass')) mesh.geometry.computeVertexNormals()
          if (mesh.name === 'silver_001_BreakDiscs_0')
            mesh.material = applyProps(materials.BreakDiscs.clone(), { color: '#ddd' })
        }
      })
      if (nodes.glass_003) nodes.glass_003.scale.setScalar(2.7)
      if (materials.FrameBlack)
        applyProps(materials.FrameBlack, { metalness: 0.75, roughness: 0, color: 'black' })
      if (materials.Chrome)
        applyProps(materials.Chrome, { metalness: 1, roughness: 0, color: '#333' })
      if (materials.BreakDiscs)
        applyProps(materials.BreakDiscs, { metalness: 0.2, roughness: 0.2, color: '#555' })
      if (materials.TiresGum)
        applyProps(materials.TiresGum, { metalness: 0, roughness: 0.4, color: '#181818' })
      if (materials.GreyElements)
        applyProps(materials.GreyElements, { metalness: 0, color: '#292929' })
      if (materials.emitbrake)
        applyProps(materials.emitbrake, { emissiveIntensity: 3, toneMapped: false })
      if (materials.LightsFrontLed)
        applyProps(materials.LightsFrontLed, { emissiveIntensity: 3, toneMapped: false })
      const paintNode = nodes.yellow_WhiteCar_0
      if (paintNode) {
        ;(paintNode as THREE.Mesh).material = new THREE.MeshPhysicalMaterial({
          roughness: 0.3,
          metalness: 0.05,
          color: '#A9A9A7',
          envMapIntensity: 0.75,
          clearcoatRoughness: 0,
          clearcoat: 1,
        })
      }
    }, [nodes, materials])

    useEffect(() => {
      onLoaded?.()
    }, [onLoaded])

    return (
      <group ref={ref} rotation={MODELS[0].rotation} {...props}>
        <primitive object={scene} scale={MODELS[0].scale} />
      </group>
    )
  }
)
LamboModel.displayName = 'LamboModel'

// ── Porsche model ────────────────────────────────────────────────────────────

const PorscheModel = forwardRef<Group, ThreeElements['group'] & { onLoaded?: () => void }>(
  ({ onLoaded, ...props }, ref) => {
    const { scene, nodes, materials } = useGLTF(MODELS[1].path)

    useMemo(() => {
      Object.values(nodes).forEach(node => {
        if ((node as THREE.Mesh).isMesh) {
          ;(node as THREE.Mesh).receiveShadow = (node as THREE.Mesh).castShadow = true
        }
      })
      if (materials.rubber)
        applyProps(materials.rubber, {
          color: '#222',
          roughness: 0.6,
          roughnessMap: null,
          normalScale: [4, 4],
        })
      if (materials.window)
        applyProps(materials.window, { color: 'black', roughness: 0, clearcoat: 0.1 })
      if (materials.coat)
        applyProps(materials.coat, { envMapIntensity: 4, roughness: 0.5, metalness: 1 })
      if (materials.paint)
        applyProps(materials.paint, {
          envMapIntensity: 2,
          roughness: 0.45,
          metalness: 0.8,
          color: '#A7A9A8',
        })
    }, [nodes, materials])

    useEffect(() => {
      onLoaded?.()
    }, [onLoaded])

    return (
      <group ref={ref} rotation={MODELS[1].rotation} {...props}>
        <primitive object={scene} scale={MODELS[1].scale} />
      </group>
    )
  }
)
PorscheModel.displayName = 'PorscheModel'

// ── Post-processing (Bloom + LUT) ────────────────────────────────────────────

function PostProcessing({ enabled }: { enabled: boolean }) {
  const lut = useLoader(LUTCubeLoader, '/F-6800-STD.cube')

  if (!enabled) return null

  return (
    <EffectComposer enableNormalPass={false}>
      <Bloom luminanceThreshold={0.2} mipmapBlur luminanceSmoothing={0} intensity={1.75} />
      <LUT lut={lut} />
    </EffectComposer>
  )
}

// ── Auto-orbiting camera rig ──────────────────────────────────────────────────

function CameraRig({ v = new THREE.Vector3() }: { v?: THREE.Vector3 }) {
  return useFrame(state => {
    const t = state.clock.elapsedTime
    state.camera.position.lerp(v.set(Math.sin(t / 5) * 12, 1, Math.cos(t / 5) * 12), 0.05)
    state.camera.lookAt(0, 0, 0)
  })
}

// ── Ready gate — fires onReady after all assets loaded + N rendered frames ────

function ReadyGate({ onReady }: { onReady: () => void }) {
  const called = useRef(false)
  const frames = useRef(0)

  useFrame(() => {
    if (called.current) return
    frames.current++
    // Wait for a few frames after Suspense resolves so env map + reflections are GPU-uploaded
    if (frames.current >= 4) {
      called.current = true
      onReady()
    }
  })

  return null
}

// ── 3D Scene ──────────────────────────────────────────────────────────────────

function Scene({
  activeIndex,
  onModelLoaded,
  effectsEnabled,
  envResolution,
  shadowResolution,
  showSecondModel,
}: {
  activeIndex: number
  onModelLoaded: () => void
  effectsEnabled: boolean
  envResolution: number
  shadowResolution: number
  showSecondModel: boolean
}) {
  const porscheRef = useRef<Group>(null)
  const lamboRef = useRef<Group>(null)

  return (
    <>
      <spotLight
        position={[0, 15, 0]}
        angle={0.3}
        penumbra={1}
        castShadow
        intensity={2}
        shadow-bias={-0.0001}
      />
      <ambientLight intensity={0.5} />

      {/* Models rendered statically */}
      <PorscheModel ref={porscheRef} visible={activeIndex === 0} position={[0, 0, 0]} />
      {showSecondModel && (
        <LamboModel ref={lamboRef} visible={activeIndex === 1} position={[0, 0, 0]} />
      )}

      {/* Fires onModelLoaded only after all assets loaded + env GPU-uploaded */}
      <ReadyGate onReady={onModelLoaded} />

      {/* Contact shadows for floor reflection effect */}
      <ContactShadows
        resolution={shadowResolution}
        frames={1}
        position={[0, -1.16, 0]}
        scale={10}
        blur={2.5}
        opacity={0.8}
        far={4}
      />

      {/* HDR environment for realistic lighting and reflections */}
      <Environment
        files="/models/factory-road-turnaround_256.hdr"
        frames={1}
        resolution={envResolution}
      />

      {/* Auto-orbiting camera rig */}
      <CameraRig />

      {/* Post-processing */}
      <PostProcessing enabled={effectsEnabled} />
    </>
  )
}

// ── Hero carousel ─────────────────────────────────────────────────────────────

export function HeroCarousel({
  initialIndex = 0,
  onReady,
  onSlideChange,
}: {
  initialIndex?: number
  onReady?: () => void
  onSlideChange?: (index: number) => void
}) {
  const [activeIndex, setActiveIndex] = useState(initialIndex)
  const [dpr, setDpr] = useState(DPR_START)
  const [effectsEnabled, setEffectsEnabled] = useState(true)
  const [envResolution, setEnvResolution] = useState(ENV_RES_HIGH)
  const [shadowResolution, setShadowResolution] = useState(SHADOW_RES_HIGH)
  const [shadowsEnabled, setShadowsEnabled] = useState(true)
  const [showSecondModel, setShowSecondModel] = useState(false)
  const dragStartX = useRef<number | null>(null)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isClient = useIsClient()

  // Optimization: Preload second model AFTER first one is ready to prioritize initial LCP
  const handleModelLoaded = useCallback(() => {
    onReady?.()
    // Delay preloading second model to preserve bandwidth for initial entrance
    setTimeout(() => {
      setShowSecondModel(true)
      useGLTF.preload(MODELS[1].path)
    }, 1000)
  }, [onReady])

  const navigate = useCallback(
    (dir: 1 | -1) => {
      const newIndex = (activeIndex + dir + TOTAL) % TOTAL
      setActiveIndex(newIndex)
      onSlideChange?.(newIndex)
      const params = new URLSearchParams(searchParams.toString())
      params.set('slide', String(newIndex))
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [activeIndex, searchParams, pathname, router, onSlideChange]
  )

  const goToSlide = useCallback(
    (index: number) => {
      setActiveIndex(index)
      onSlideChange?.(index)
      const params = new URLSearchParams(searchParams.toString())
      params.set('slide', String(index))
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [searchParams, pathname, router, onSlideChange]
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

  const active = heroCategories[activeIndex]
  const sectionRef = useRef<HTMLElement>(null)
  const bgVideoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        const video = bgVideoRef.current
        if (!video) return
        if (entry.isIntersecting) {
          video.play().catch(() => {})
        } else {
          video.pause()
        }
      },
      { threshold: 0 }
    )

    observer.observe(section)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={sectionRef}
      aria-label="Product showcase carousel"
      className="relative min-h-dvh overflow-hidden select-none touch-manipulation"
      aria-roledescription="carousel"
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onKeyDown={onKeyDown}
    >
      {/* Video background */}
      <video
        ref={bgVideoRef}
        src={heroBackgroundVideoUrl}
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 size-full object-cover"
      />

      {/* Three.js canvas — transparent so video shows through */}
      <div className="absolute inset-0">
        {isClient ? (
          <Canvas
            shadows={shadowsEnabled}
            camera={{ position: [0, 1, 14], fov: 40 }}
            dpr={dpr}
            gl={{
              alpha: true,
              antialias: false,
              powerPreference: 'high-performance',
            }}
          >
            <Suspense fallback={null}>
              <Scene
                activeIndex={activeIndex}
                onModelLoaded={handleModelLoaded}
                effectsEnabled={effectsEnabled}
                envResolution={envResolution}
                shadowResolution={shadowResolution}
                showSecondModel={showSecondModel}
              />
            </Suspense>
            <PerformanceMonitor
              factor={1}
              bounds={refreshrate => (refreshrate > 90 ? [50, 90] : [50, 60])}
              flipflops={3}
              onChange={({ factor }) => {
                // Gradual DPR adjustment: clamp between DPR_MIN and DPR_MAX (1.0 to 2.0)
                setDpr(Math.max(DPR_MIN, Math.min(DPR_MAX, DPR_MIN + (DPR_MAX - DPR_MIN) * factor)))
              }}
              onIncline={() => {
                setEffectsEnabled(true)
                setEnvResolution(ENV_RES_HIGH)
                setShadowResolution(SHADOW_RES_HIGH)
                setShadowsEnabled(true)
              }}
              onDecline={() => {
                setEffectsEnabled(false)
                setEnvResolution(ENV_RES_LOW)
                setShadowResolution(SHADOW_RES_LOW)
              }}
              onFallback={() => {
                // Guaranteed baseline: minimal quality
                setDpr(DPR_MIN)
                setEffectsEnabled(false)
                setEnvResolution(ENV_RES_LOW)
                setShadowResolution(SHADOW_RES_LOW)
                setShadowsEnabled(false)
              }}
            />
          </Canvas>
        ) : null}
      </div>

      {/* Category label + CTA + dots */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center gap-6 pb-16">
        <h1
          data-hero-title
          className="font-display font-normal text-section uppercase tracking-widest text-white text-center"
        >
          {active.label}
        </h1>
        <Link
          data-hero-cta
          href={active.href}
          className="pointer-events-auto inline-flex items-center justify-center rounded-none border-2 border-white bg-black/70 px-10 py-3 font-heading font-semibold text-13 uppercase tracking-wider text-white backdrop-blur-sm transition-colors duration-200 hover:bg-white hover:text-black"
        >
          Browse {active.label}
        </Link>
        <div className="flex items-center gap-3" role="tablist" aria-label="Hero carousel slides">
          {heroCategories.map((cat, i) => (
            <button
              key={cat.label}
              type="button"
              data-hero-dot
              role="tab"
              aria-label={`Show ${cat.label}`}
              aria-selected={i === activeIndex}
              aria-current={i === activeIndex ? 'true' : undefined}
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
    </section>
  )
}

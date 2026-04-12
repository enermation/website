'use client'

import { mdiChevronLeft, mdiChevronRight } from '@mdi/js'
import { Icon } from '@mdi/react'
import {
  AccumulativeShadows,
  Environment,
  Float,
  Lightformer,
  PerformanceMonitor,
  RandomizedLight,
  useGLTF,
} from '@react-three/drei'
import { applyProps, Canvas, useFrame, useLoader } from '@react-three/fiber'
import { Bloom, EffectComposer, LUT } from '@react-three/postprocessing'
import { Color, Depth, LayerMaterial } from 'lamina'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { LUTCubeLoader } from 'postprocessing'
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Group } from 'three'
import * as THREE from 'three'
import { HeroLoadingSkeleton } from '@/components/hero-loading-skeleton'
import { heroCategories } from '@/lib/data'

const MAX_3D_SLIDES = 2
const TOTAL = Math.min(heroCategories.length, MAX_3D_SLIDES)

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

useGLTF.preload(MODELS[0].path)
useGLTF.preload(MODELS[1].path)

// ── Lambo model ──────────────────────────────────────────────────────────────

function LamboModel({ onLoaded }: { onLoaded?: () => void }) {
  const groupRef = useRef<Group>(null)
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

  return (
    <group ref={groupRef} rotation={MODELS[0].rotation}>
      <primitive object={scene} scale={MODELS[0].scale} />
    </group>
  )
}

// ── Porsche model ────────────────────────────────────────────────────────────

function PorscheModel({ onLoaded }: { onLoaded?: () => void }) {
  const groupRef = useRef<Group>(null)
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
        color: '#555',
      })
  }, [nodes, materials])

  useEffect(() => {
    onLoaded?.()
  }, [onLoaded])

  return (
    <group ref={groupRef} rotation={MODELS[1].rotation}>
      <primitive object={scene} scale={MODELS[1].scale} />
    </group>
  )
}

// ── Post-processing (Bloom + LUT) ────────────────────────────────────────────

function PostProcessing() {
  const lut = useLoader(LUTCubeLoader, '/F-6800-STD.cube')

  return (
    <EffectComposer enableNormalPass={false}>
      <Bloom luminanceThreshold={0.2} mipmapBlur luminanceSmoothing={0} intensity={1.75} />
      <LUT lut={lut} />
    </EffectComposer>
  )
}

// ── Animated Lightformers (Porsche-style) ────────────────────────────────────

function AnimatedLightformers({ positions = [2, 0, 2, 0, 2, 0, 2, 0] }) {
  const group = useRef<THREE.Group>(null)
  useFrame((_state, delta) => {
    if (!group.current) return
    group.current.position.z += delta * 10
    if (group.current.position.z > 20) group.current.position.z = -60
  })

  return (
    <>
      {/* Ceiling */}
      <Lightformer
        intensity={0.75}
        rotation-x={Math.PI / 2}
        position={[0, 5, -9]}
        scale={[10, 10, 1]}
      />
      <group rotation={[0, 0.5, 0]}>
        <group ref={group}>
          {positions.map((x, i) => (
            <Lightformer
              // biome-ignore lint/suspicious/noArrayIndexKey: static positions array, order never changes
              key={`light-${x}-${i}`}
              form="circle"
              intensity={2}
              rotation={[Math.PI / 2, 0, 0]}
              position={[x, 4, i * 4]}
              scale={[3, 1, 1]}
            />
          ))}
        </group>
      </group>
      {/* Sides */}
      <Lightformer
        intensity={4}
        rotation-y={Math.PI / 2}
        position={[-5, 1, -1]}
        scale={[20, 0.1, 1]}
      />
      <Lightformer rotation-y={Math.PI / 2} position={[-5, -1, -1]} scale={[20, 0.5, 1]} />
      <Lightformer rotation-y={-Math.PI / 2} position={[10, 1, 0]} scale={[20, 1, 1]} />
      {/* Accent (red floating ring) */}
      <Float speed={5} floatIntensity={2} rotationIntensity={2}>
        <Lightformer
          form="ring"
          color="red"
          intensity={1}
          scale={10}
          position={[-15, 4, -18]}
          target={[0, 0, 0]}
        />
      </Float>
    </>
  )
}

// ── Gradient background sphere (Porsche-style) ───────────────────────────────

function GradientBackground() {
  return (
    <mesh scale={100}>
      <sphereGeometry args={[1, 64, 64]} />
      <LayerMaterial side={THREE.BackSide}>
        <Color color="#444" alpha={1} mode="normal" />
        <Depth
          colorA="blue"
          colorB="black"
          alpha={0.5}
          mode="normal"
          near={0}
          far={300}
          origin={[100, 100, 100]}
        />
      </LayerMaterial>
    </mesh>
  )
}

// ── Auto-orbiting camera rig (Porsche-style) ─────────────────────────────────

function CameraRig({ v = new THREE.Vector3() }: { v?: THREE.Vector3 }) {
  return useFrame(state => {
    const t = state.clock.elapsedTime
    state.camera.position.lerp(v.set(Math.sin(t / 5), 0, 12 + Math.cos(t / 5) / 2), 0.05)
    state.camera.lookAt(0, 0, 0)
  })
}

// ── 3D Scene ──────────────────────────────────────────────────────────────────

function Scene({ activeIndex, onModelLoaded }: { activeIndex: number; onModelLoaded: () => void }) {
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

      {/* Active model */}
      {activeIndex === 0 ? (
        <LamboModel onLoaded={onModelLoaded} />
      ) : (
        <PorscheModel onLoaded={onModelLoaded} />
      )}

      {/* Accumulative soft shadows */}
      <AccumulativeShadows position={[0, -1.16, 0]} frames={100} alphaTest={0.9} scale={10}>
        <RandomizedLight amount={8} radius={10} ambient={0.5} position={[1, 5, -1]} />
      </AccumulativeShadows>

      {/* Animated environment */}
      <Environment frames={Infinity} resolution={256} background blur={1}>
        <AnimatedLightformers />
        <GradientBackground />
      </Environment>

      {/* Auto-orbiting camera */}
      <CameraRig />

      {/* Post-processing */}
      <PostProcessing />
    </>
  )
}

// ── Hero carousel ─────────────────────────────────────────────────────────────

export function HeroCarousel({ initialIndex = 0 }: { initialIndex?: number }) {
  const [activeIndex, setActiveIndex] = useState(initialIndex)
  const [isLoading, setIsLoading] = useState(true)
  const [_degraded, setDegraded] = useState(false)
  const dragStartX = useRef<number | null>(null)
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
            shadows
            camera={{ position: [5, 0, 15], fov: 30 }}
            dpr={[1, 1.5]}
            gl={{ logarithmicDepthBuffer: true }}
          >
            <Suspense fallback={null}>
              <Scene activeIndex={activeIndex} onModelLoaded={handleModelLoaded} />
            </Suspense>
            <PerformanceMonitor onDecline={() => setDegraded(true)} />
          </Canvas>

          {/* Loading skeleton overlay */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black">
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

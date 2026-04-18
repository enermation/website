'use client'

import { ContactShadows, Environment, useEnvironment, useGLTF } from '@react-three/drei'
import { applyProps, Canvas, useFrame } from '@react-three/fiber'
import { type ReactNode, Suspense, useEffect, useRef } from 'react'
import { type Group, MathUtils, type Mesh, Vector3 } from 'three'

const CAMERA_Y = 1
const CAMERA_LERP_FACTOR = 0.05
const CAMERA_IDLE_ORBIT_HEIGHT = 0.16
const MOBILE_ORBIT_FACTOR = 2.2
const READY_GATE_FRAMES = 4
const DROP_START_Y = 3.4
const PORSCHE_SCALE = 1.6
const LAMBO_SCALE = 0.015
const PORSCHE_MODEL_PATH = '/models/911-transformed.glb'
const LAMBO_MODEL_PATH = '/models/lambo.glb'
const HDR_PATH = '/models/factory-road-turnaround_256.hdr'

const cameraTarget = new Vector3()

type HeroModelConfig = {
  orbitRadius: number
  lookAtY: number
  restPosition: readonly [number, number, number]
  restRotation: readonly [number, number, number]
  dropRotation: readonly [number, number, number]
  idlePhase: number
}

const PORSCHE_CONFIG: HeroModelConfig = {
  orbitRadius: 10.8,
  lookAtY: 0.42,
  restPosition: [0, -0.03, 0] as const,
  restRotation: [0.02, 0.08, 0] as const,
  dropRotation: [-0.12, 0.08, 0] as const,
  idlePhase: 0,
}

const LAMBO_CONFIG: HeroModelConfig = {
  orbitRadius: 11.5,
  lookAtY: 0.34,
  restPosition: [0, -0.06, 0] as const,
  restRotation: [0.01, Math.PI / 1.56, 0] as const,
  dropRotation: [-0.14, Math.PI / 1.56, 0] as const,
  idlePhase: 1.35,
}

function getModelConfig(activeModelIndex: number) {
  return activeModelIndex === 0 ? PORSCHE_CONFIG : LAMBO_CONFIG
}

function getModelPath(activeModelIndex: number) {
  return activeModelIndex === 0 ? PORSCHE_MODEL_PATH : LAMBO_MODEL_PATH
}

function getInactiveModelPath(activeModelIndex: number) {
  return activeModelIndex === 0 ? LAMBO_MODEL_PATH : PORSCHE_MODEL_PATH
}

function PorscheModel() {
  const { scene, nodes, materials } = useGLTF(PORSCHE_MODEL_PATH)

  useEffect(() => {
    Object.values(nodes).forEach(node => {
      if ((node as Mesh).isMesh) {
        const mesh = node as Mesh
        mesh.castShadow = true
        mesh.receiveShadow = true
      }
    })

    if (materials.rubber) {
      applyProps(materials.rubber, {
        color: '#222',
        roughness: 0.6,
        roughnessMap: null,
        normalScale: [3, 3],
      })
    }

    if (materials.window) {
      applyProps(materials.window, {
        color: '#111',
        roughness: 0.05,
        clearcoat: 0.1,
      })
    }

    if (materials.coat) {
      applyProps(materials.coat, {
        envMapIntensity: 2.4,
        roughness: 0.35,
        metalness: 0.85,
      })
    }

    if (materials.paint) {
      applyProps(materials.paint, {
        color: '#A7A9A8',
        envMapIntensity: 1.7,
        roughness: 0.28,
        metalness: 0.7,
        clearcoat: 0.9,
        clearcoatRoughness: 0.08,
      })
    }
  }, [materials, nodes])

  return <primitive object={scene} scale={PORSCHE_SCALE} />
}

function LamboModel() {
  const { scene, nodes, materials } = useGLTF(LAMBO_MODEL_PATH)

  useEffect(() => {
    Object.values(nodes).forEach(node => {
      if ((node as Mesh).isMesh) {
        const mesh = node as Mesh
        mesh.castShadow = true
        mesh.receiveShadow = true

        if (mesh.name.startsWith('glass')) {
          mesh.geometry.computeVertexNormals()
        }

        if (mesh.name === 'silver_001_BreakDiscs_0' && materials.BreakDiscs) {
          mesh.material = applyProps(materials.BreakDiscs, { color: '#ddd' })
        }
      }
    })

    if (nodes.glass_003) {
      nodes.glass_003.scale.setScalar(2.7)
    }

    if (materials.FrameBlack) {
      applyProps(materials.FrameBlack, {
        metalness: 0.75,
        roughness: 0,
        color: '#111',
      })
    }

    if (materials.Chrome) {
      applyProps(materials.Chrome, {
        metalness: 1,
        roughness: 0,
        color: '#333',
      })
    }

    if (materials.TiresGum) {
      applyProps(materials.TiresGum, {
        metalness: 0,
        roughness: 0.4,
        color: '#181818',
      })
    }

    if (materials.GreyElements) {
      applyProps(materials.GreyElements, {
        metalness: 0,
        color: '#292929',
      })
    }

    if (materials.emitbrake) {
      applyProps(materials.emitbrake, { emissiveIntensity: 1.0 })
    }

    if (materials.LightsFrontLed) {
      applyProps(materials.LightsFrontLed, { emissiveIntensity: 1.0 })
    }

    const paintNode = nodes.yellow_WhiteCar_0
    if (paintNode) {
      applyProps((paintNode as Mesh).material, {
        roughness: 0.3,
        metalness: 0.05,
        color: '#A9A9A7',
        envMapIntensity: 0.75,
        clearcoatRoughness: 0,
        clearcoat: 1,
      })
    }
  }, [materials, nodes])

  return <primitive object={scene} scale={LAMBO_SCALE} />
}

type AnimatedVehicleProps = {
  shouldDropModel: boolean
  prefersReducedMotion: boolean
  config: HeroModelConfig
  children: ReactNode
}

function AnimatedVehicle({
  shouldDropModel,
  prefersReducedMotion,
  config,
  children,
}: AnimatedVehicleProps) {
  const groupRef = useRef<Group>(null)
  const revealProgress = useRef(prefersReducedMotion ? 1 : 0)

  useFrame((state, delta) => {
    const group = groupRef.current
    if (!group) return

    const targetProgress = shouldDropModel || prefersReducedMotion ? 1 : 0
    revealProgress.current = MathUtils.damp(
      revealProgress.current,
      targetProgress,
      prefersReducedMotion ? 10 : 4.5,
      delta
    )

    const progress = revealProgress.current
    const idleStrength = prefersReducedMotion ? 0 : MathUtils.smoothstep(progress, 0.76, 1)
    const idleTime = state.clock.elapsedTime + config.idlePhase

    group.position.x = config.restPosition[0]
    group.position.z = config.restPosition[2]
    group.position.y =
      MathUtils.lerp(DROP_START_Y, config.restPosition[1], progress) +
      Math.sin(idleTime * 0.7) * 0.04 * idleStrength

    group.rotation.x = MathUtils.lerp(config.dropRotation[0], config.restRotation[0], progress)
    group.rotation.y = MathUtils.lerp(config.dropRotation[1], config.restRotation[1], progress)
    group.rotation.z = MathUtils.lerp(config.dropRotation[2], config.restRotation[2], progress)
  })

  return <group ref={groupRef}>{children}</group>
}

function CameraRig({
  prefersReducedMotion,
  allowIdleOrbit,
  activeModelIndex,
  isMobile,
}: {
  prefersReducedMotion: boolean
  allowIdleOrbit: boolean
  activeModelIndex: number
  isMobile: boolean
}) {
  const orbitStrength = useRef(allowIdleOrbit ? 1 : 0)
  const orbitRadius = useRef(getModelConfig(activeModelIndex).orbitRadius)
  const lookAtY = useRef(getModelConfig(activeModelIndex).lookAtY)

  useFrame((state, delta) => {
    const elapsedTime = state.clock.elapsedTime
    const activeConfig = getModelConfig(activeModelIndex)
    const targetStrength = prefersReducedMotion ? 0 : allowIdleOrbit ? 1 : 0
    const targetRadius = activeConfig.orbitRadius * (isMobile ? MOBILE_ORBIT_FACTOR : 1)

    orbitStrength.current = MathUtils.damp(orbitStrength.current, targetStrength, 3.2, delta)
    orbitRadius.current = MathUtils.damp(orbitRadius.current, targetRadius, 4, delta)
    lookAtY.current = MathUtils.damp(lookAtY.current, activeConfig.lookAtY, 4, delta)

    const orbitX = Math.sin(elapsedTime / 4.8) * orbitRadius.current * orbitStrength.current
    const orbitY =
      CAMERA_Y + Math.sin(elapsedTime / 8.8) * CAMERA_IDLE_ORBIT_HEIGHT * orbitStrength.current
    const orbitZ = MathUtils.lerp(
      orbitRadius.current,
      Math.cos(elapsedTime / 4.8) * orbitRadius.current,
      orbitStrength.current
    )

    state.camera.position.lerp(cameraTarget.set(orbitX, orbitY, orbitZ), CAMERA_LERP_FACTOR)
    state.camera.lookAt(0, lookAtY.current, 0)
  })

  return null
}

function ReadyGate({ onReady }: { onReady: () => void }) {
  const called = useRef(false)
  const frames = useRef(0)

  useFrame(() => {
    if (called.current) return

    frames.current += 1
    if (frames.current < READY_GATE_FRAMES) return

    called.current = true
    onReady()
  })

  return null
}

function SceneContent({
  onSceneReady,
  activeModelIndex,
  shouldDropModel,
  prefersReducedMotion,
  allowIdleOrbit,
  isMobile,
}: {
  onSceneReady: () => void
  activeModelIndex: number
  shouldDropModel: boolean
  prefersReducedMotion: boolean
  allowIdleOrbit: boolean
  isMobile: boolean
}) {
  const activeConfig = getModelConfig(activeModelIndex)

  return (
    <>
      <ambientLight intensity={0.44} />
      <spotLight
        position={[0, 16, 2]}
        angle={0.28}
        penumbra={1}
        intensity={2.3}
        castShadow
        shadow-bias={-0.00008}
      />
      <directionalLight position={[-5, 7, 6]} intensity={1.25} />
      <directionalLight position={[5, 5, 4]} intensity={0.8} />

      {activeModelIndex === 0 ? (
        <AnimatedVehicle
          key="porsche"
          shouldDropModel={shouldDropModel}
          prefersReducedMotion={prefersReducedMotion}
          config={activeConfig}
        >
          <PorscheModel />
        </AnimatedVehicle>
      ) : (
        <AnimatedVehicle
          key="lambo"
          shouldDropModel={shouldDropModel}
          prefersReducedMotion={prefersReducedMotion}
          config={activeConfig}
        >
          <LamboModel />
        </AnimatedVehicle>
      )}

      <ContactShadows
        resolution={512}
        frames={prefersReducedMotion ? 1 : 36}
        position={[0, -1.16, 0]}
        scale={11.5}
        blur={2.4}
        opacity={0.74}
        far={4.8}
      />

      <Environment files={HDR_PATH} frames={1} resolution={256} />
      <CameraRig
        prefersReducedMotion={prefersReducedMotion}
        allowIdleOrbit={allowIdleOrbit}
        activeModelIndex={activeModelIndex}
        isMobile={isMobile}
      />
      <ReadyGate onReady={onSceneReady} />
    </>
  )
}

type HeroCarouselSceneProps = {
  activeModelIndex: number
  onSceneReady: () => void
  shouldDropModel: boolean
  prefersReducedMotion: boolean
  allowIdleOrbit: boolean
  preloadInactiveModel: boolean
  isMobile: boolean
}

export function HeroCarouselScene({
  activeModelIndex,
  onSceneReady,
  shouldDropModel,
  prefersReducedMotion,
  allowIdleOrbit,
  preloadInactiveModel,
  isMobile,
}: HeroCarouselSceneProps) {
  useEffect(() => {
    useGLTF.preload(getModelPath(activeModelIndex))
    useEnvironment.preload({ files: HDR_PATH })
  }, [activeModelIndex])

  useEffect(() => {
    if (!preloadInactiveModel) return

    const preload = () => {
      useGLTF.preload(getInactiveModelPath(activeModelIndex))
    }

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      const idleId = window.requestIdleCallback(() => preload(), { timeout: 1500 })
      return () => window.cancelIdleCallback(idleId)
    }

    const timer = globalThis.setTimeout(preload, 900)
    return () => globalThis.clearTimeout(timer)
  }, [activeModelIndex, preloadInactiveModel])

  const initialOrbitRadius =
    getModelConfig(activeModelIndex).orbitRadius * (isMobile ? MOBILE_ORBIT_FACTOR : 1)

  return (
    <Canvas
      frameloop="always"
      shadows
      camera={{ position: [0, CAMERA_Y, initialOrbitRadius], fov: 38 }}
      dpr={[1, 1.25]}
      gl={{ alpha: true, antialias: false, powerPreference: 'high-performance' }}
    >
      <Suspense fallback={null}>
        <SceneContent
          onSceneReady={onSceneReady}
          activeModelIndex={activeModelIndex}
          shouldDropModel={shouldDropModel}
          prefersReducedMotion={prefersReducedMotion}
          allowIdleOrbit={allowIdleOrbit}
          isMobile={isMobile}
        />
      </Suspense>
    </Canvas>
  )
}

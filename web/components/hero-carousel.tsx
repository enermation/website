'use client'

import { ContactShadows, Environment, useEnvironment, useGLTF } from '@react-three/drei'
import { applyProps, Canvas, useFrame } from '@react-three/fiber'
import { type ReactNode, Suspense, useEffect, useRef } from 'react'
import { type Group, MathUtils, type Mesh, Vector3 } from 'three'

const CAMERA_Y = 1.05
const CAMERA_Z = 15.2
const CAMERA_FOV = 34
const CAMERA_LERP_FACTOR = 0.05
const CAMERA_IDLE_ORBIT_X = 1.35
const CAMERA_IDLE_ORBIT_Z = 0.45
const CAMERA_IDLE_ORBIT_HEIGHT = 0.18
const READY_GATE_FRAMES = 4
const DROP_START_Y = 3.4
const PORSCHE_SCALE = 1.6
const LAMBO_SCALE = 0.015
const PORSCHE_MODEL_PATH = '/models/911-transformed.glb'
const LAMBO_MODEL_PATH = '/models/lambo.glb'
const HDR_PATH = '/models/factory-road-turnaround_256.hdr'

const PORSCHE_POSITION = [-2.35, -0.15, 0.25] as const
const LAMBO_POSITION = [2.45, -0.18, -0.25] as const
const PORSCHE_ROTATION = [0.02, 0.08, 0] as const
const PORSCHE_DROP_ROTATION = [-0.14, 0.26, 0.08] as const
const LAMBO_ROTATION = [0.01, Math.PI / 1.56, 0] as const
const LAMBO_DROP_ROTATION = [-0.18, Math.PI / 1.42, -0.1] as const

const cameraTarget = new Vector3()

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
  restPosition: readonly [number, number, number]
  restRotation: readonly [number, number, number]
  dropRotation: readonly [number, number, number]
  idlePhase: number
  idleRotate: number
  children: ReactNode
}

function AnimatedVehicle({
  shouldDropModel,
  prefersReducedMotion,
  restPosition,
  restRotation,
  dropRotation,
  idlePhase,
  idleRotate,
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
    const idleTime = state.clock.elapsedTime + idlePhase

    group.position.x = restPosition[0]
    group.position.z = restPosition[2]
    group.position.y =
      MathUtils.lerp(DROP_START_Y, restPosition[1], progress) +
      Math.sin(idleTime * 0.7) * 0.04 * idleStrength

    group.rotation.x = MathUtils.lerp(dropRotation[0], restRotation[0], progress)
    group.rotation.y =
      MathUtils.lerp(dropRotation[1], restRotation[1], progress) +
      Math.sin(idleTime * 0.28) * idleRotate * idleStrength
    group.rotation.z = MathUtils.lerp(dropRotation[2], restRotation[2], progress)
  })

  return <group ref={groupRef}>{children}</group>
}

function CameraRig({
  prefersReducedMotion,
  allowIdleOrbit,
}: {
  prefersReducedMotion: boolean
  allowIdleOrbit: boolean
}) {
  const orbitStrength = useRef(allowIdleOrbit ? 1 : 0)

  useFrame((state, delta) => {
    const elapsedTime = state.clock.elapsedTime
    const targetStrength = prefersReducedMotion ? 0 : allowIdleOrbit ? 1 : 0
    orbitStrength.current = MathUtils.damp(orbitStrength.current, targetStrength, 3.2, delta)

    const orbitX = Math.sin(elapsedTime / 5.8) * CAMERA_IDLE_ORBIT_X * orbitStrength.current
    const orbitY =
      CAMERA_Y + Math.sin(elapsedTime / 8.8) * CAMERA_IDLE_ORBIT_HEIGHT * orbitStrength.current
    const orbitZ =
      CAMERA_Z + Math.cos(elapsedTime / 5.8) * CAMERA_IDLE_ORBIT_Z * orbitStrength.current

    state.camera.position.lerp(cameraTarget.set(orbitX, orbitY, orbitZ), CAMERA_LERP_FACTOR)
    state.camera.lookAt(0, 0.42, 0)
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
  shouldDropModel,
  prefersReducedMotion,
  allowIdleOrbit,
}: {
  onSceneReady: () => void
  shouldDropModel: boolean
  prefersReducedMotion: boolean
  allowIdleOrbit: boolean
}) {
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

      <AnimatedVehicle
        shouldDropModel={shouldDropModel}
        prefersReducedMotion={prefersReducedMotion}
        restPosition={PORSCHE_POSITION}
        restRotation={PORSCHE_ROTATION}
        dropRotation={PORSCHE_DROP_ROTATION}
        idlePhase={0}
        idleRotate={0.045}
      >
        <PorscheModel />
      </AnimatedVehicle>

      <AnimatedVehicle
        shouldDropModel={shouldDropModel}
        prefersReducedMotion={prefersReducedMotion}
        restPosition={LAMBO_POSITION}
        restRotation={LAMBO_ROTATION}
        dropRotation={LAMBO_DROP_ROTATION}
        idlePhase={1.35}
        idleRotate={0.05}
      >
        <LamboModel />
      </AnimatedVehicle>

      <ContactShadows
        resolution={768}
        frames={prefersReducedMotion ? 1 : 90}
        position={[0, -1.16, 0]}
        scale={14}
        blur={2.5}
        opacity={0.74}
        far={5.2}
      />

      <Environment files={HDR_PATH} frames={1} resolution={256} />
      <CameraRig prefersReducedMotion={prefersReducedMotion} allowIdleOrbit={allowIdleOrbit} />
      <ReadyGate onReady={onSceneReady} />
    </>
  )
}

type HeroCarouselSceneProps = {
  onSceneReady: () => void
  shouldDropModel: boolean
  prefersReducedMotion: boolean
  allowIdleOrbit: boolean
}

export function HeroCarouselScene({
  onSceneReady,
  shouldDropModel,
  prefersReducedMotion,
  allowIdleOrbit,
}: HeroCarouselSceneProps) {
  useEffect(() => {
    useGLTF.preload(PORSCHE_MODEL_PATH)
    useGLTF.preload(LAMBO_MODEL_PATH)
    useEnvironment.preload({ files: HDR_PATH })
  }, [])

  return (
    <Canvas
      frameloop="always"
      shadows
      camera={{ position: [0, CAMERA_Y, CAMERA_Z], fov: CAMERA_FOV }}
      dpr={[1, 1.25]}
      gl={{ alpha: true, antialias: false, powerPreference: 'high-performance' }}
    >
      <Suspense fallback={null}>
        <SceneContent
          onSceneReady={onSceneReady}
          shouldDropModel={shouldDropModel}
          prefersReducedMotion={prefersReducedMotion}
          allowIdleOrbit={allowIdleOrbit}
        />
      </Suspense>
    </Canvas>
  )
}

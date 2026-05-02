'use client'

import { ContactShadows, Environment, useEnvironment, useGLTF } from '@react-three/drei'
import { applyProps, Canvas, useFrame, useThree } from '@react-three/fiber'
import { type ReactNode, Suspense, useEffect, useRef } from 'react'
import {
  Box3,
  type Group,
  MathUtils,
  type Mesh,
  MeshPhysicalMaterial,
  type MeshStandardMaterial,
  Vector3,
} from 'three'

const CAMERA_Y = 1
const CAMERA_LERP_FACTOR = 0.05
const CAMERA_IDLE_ORBIT_HEIGHT = 0.16
const MOBILE_ORBIT_FACTOR = 2.2
const READY_GATE_FRAMES = 4
const DROP_START_Y = 3.4
// const PORSCHE_SCALE = 1.6
// const LAMBO_SCALE = 0.015
const SCANIA_SCALE = 1400
const SKYLINE_SCALE = 163
const EXCAVATOR_SCALE = 0.48
const MAN_SCALE = 3.5
const MAN_MOBILE_SCALE = 2.6
// const PORSCHE_MODEL_PATH = '/models/911-transformed.glb'
// const LAMBO_MODEL_PATH = '/models/lambo.glb'
const SCANIA_MODEL_PATH = '/models/scania-opt.glb'
const SKYLINE_MODEL_PATH = '/models/skyline-opt.glb'
const EXCAVATOR_MODEL_PATH = '/models/excavator-opt.glb'
const MAN_MODEL_PATH = '/models/man-intercity-opt.glb'

const cameraTarget = new Vector3()

type HeroModelConfig = {
  orbitRadius: number
  lookAtY: number
  restPosition: readonly [number, number, number]
  restRotation: readonly [number, number, number]
  dropRotation: readonly [number, number, number]
  idlePhase: number
}

// const PORSCHE_CONFIG: HeroModelConfig = {
//   orbitRadius: 10.8,
//   lookAtY: 0.42,
//   restPosition: [0, -0.03, 0] as const,
//   restRotation: [0.02, 0.08, 0] as const,
//   dropRotation: [-0.12, 0.08, 0] as const,
//   idlePhase: 0,
// }

// const LAMBO_CONFIG: HeroModelConfig = {
//   orbitRadius: 11.5,
//   lookAtY: 0.34,
//   restPosition: [0, -0.06, 0] as const,
//   restRotation: [0.01, Math.PI / 1.56, 0] as const,
//   dropRotation: [-0.14, Math.PI / 1.56, 0] as const,
//   idlePhase: 1.35,
// }

const SCANIA_CONFIG: HeroModelConfig = {
  orbitRadius: 15,
  lookAtY: 0.8,
  restPosition: [0, -0.3, 0] as const,
  restRotation: [0.02, Math.PI / 5, 0] as const,
  dropRotation: [-0.12, Math.PI / 5, 0] as const,
  idlePhase: 0.7,
}

const SKYLINE_CONFIG: HeroModelConfig = {
  orbitRadius: 11.0,
  lookAtY: 0.42,
  restPosition: [0, -0.3, 0] as const,
  restRotation: [0.02, Math.PI / 6, 0] as const,
  dropRotation: [-0.12, Math.PI / 6, 0] as const,
  idlePhase: 2.1,
}

const EXCAVATOR_CONFIG: HeroModelConfig = {
  orbitRadius: 12,
  lookAtY: 0.13,
  restPosition: [0, -0.3, 0] as const,
  restRotation: [0.02, Math.PI / 4, 0] as const,
  dropRotation: [-0.1, Math.PI / 4, 0] as const,
  idlePhase: 1.8,
}

const MAN_CONFIG: HeroModelConfig = {
  orbitRadius: 14,
  lookAtY: 0.8,
  restPosition: [0, -0.3, 0] as const,
  restRotation: [0.02, Math.PI / 5, 0] as const,
  dropRotation: [-0.1, Math.PI / 5, 0] as const,
  idlePhase: 0.5,
}

const MODEL_CONFIGS = [SKYLINE_CONFIG, SCANIA_CONFIG, EXCAVATOR_CONFIG, MAN_CONFIG]
const MODEL_PATHS = [SKYLINE_MODEL_PATH, SCANIA_MODEL_PATH, EXCAVATOR_MODEL_PATH, MAN_MODEL_PATH]

function getModelConfig(activeModelIndex: number) {
  return MODEL_CONFIGS[activeModelIndex] ?? SKYLINE_CONFIG
}

function getModelPath(activeModelIndex: number) {
  return MODEL_PATHS[activeModelIndex] ?? SKYLINE_MODEL_PATH
}

function getInactiveModelPath(activeModelIndex: number) {
  return MODEL_PATHS[(activeModelIndex + 1) % MODEL_PATHS.length]
}

// function PorscheModel() {
//   const { scene, nodes, materials } = useGLTF(PORSCHE_MODEL_PATH)
//   useEffect(() => {
//     Object.values(nodes).forEach(node => {
//       if ((node as Mesh).isMesh) {
//         const mesh = node as Mesh
//         mesh.castShadow = true
//         mesh.receiveShadow = true
//       }
//     })
//     if (materials.rubber) applyProps(materials.rubber, { color: '#222', roughness: 0.6, roughnessMap: null, normalScale: [3, 3] })
//     if (materials.window) applyProps(materials.window, { color: '#111', roughness: 0.05, clearcoat: 0.1 })
//     if (materials.coat) applyProps(materials.coat, { envMapIntensity: 2.4, roughness: 0.35, metalness: 0.85 })
//     if (materials.paint) applyProps(materials.paint, { color: '#A7A9A8', envMapIntensity: 1.7, roughness: 0.28, metalness: 0.7, clearcoat: 0.9, clearcoatRoughness: 0.08 })
//   }, [materials, nodes])
//   return <primitive object={scene} scale={PORSCHE_SCALE} />
// }

// function LamboModel() {
//   const { scene, nodes, materials } = useGLTF(LAMBO_MODEL_PATH)
//   useEffect(() => {
//     Object.values(nodes).forEach(node => {
//       if ((node as Mesh).isMesh) {
//         const mesh = node as Mesh
//         mesh.castShadow = true
//         mesh.receiveShadow = true
//         if (mesh.name.startsWith('glass')) mesh.geometry.computeVertexNormals()
//         if (mesh.name === 'silver_001_BreakDiscs_0' && materials.BreakDiscs) mesh.material = applyProps(materials.BreakDiscs, { color: '#ddd' })
//       }
//     })
//     if (nodes.glass_003) nodes.glass_003.scale.setScalar(2.7)
//     if (materials.FrameBlack) applyProps(materials.FrameBlack, { metalness: 0.75, roughness: 0, color: '#111' })
//     if (materials.Chrome) applyProps(materials.Chrome, { metalness: 1, roughness: 0, color: '#333' })
//     if (materials.TiresGum) applyProps(materials.TiresGum, { metalness: 0, roughness: 0.4, color: '#181818' })
//     if (materials.GreyElements) applyProps(materials.GreyElements, { metalness: 0, color: '#292929' })
//     if (materials.emitbrake) applyProps(materials.emitbrake, { emissiveIntensity: 1.0 })
//     if (materials.LightsFrontLed) applyProps(materials.LightsFrontLed, { emissiveIntensity: 1.0 })
//     const paintNode = nodes.yellow_WhiteCar_0
//     if (paintNode) applyProps((paintNode as Mesh).material, { roughness: 0.3, metalness: 0.05, color: '#A9A9A7', envMapIntensity: 0.75, clearcoatRoughness: 0, clearcoat: 1 })
//   }, [materials, nodes])
//   return <primitive object={scene} scale={LAMBO_SCALE} />
// }

function ScaniaModel() {
  const { scene, nodes, materials } = useGLTF(SCANIA_MODEL_PATH)

  useEffect(() => {
    Object.values(nodes).forEach(node => {
      if ((node as Mesh).isMesh) {
        const mesh = node as Mesh
        mesh.castShadow = true
        mesh.receiveShadow = true
      }
    })

    Object.values(materials).forEach(material => {
      applyProps(material, {
        envMapIntensity: 2.6,
        roughness: 0.18,
        metalness: 0.75,
        clearcoat: 0.9,
        clearcoatRoughness: 0.08,
      })
    })
  }, [materials, nodes])

  return <primitive object={scene} scale={SCANIA_SCALE} />
}

function SkylineModel() {
  const { scene, nodes, materials } = useGLTF(SKYLINE_MODEL_PATH)

  useEffect(() => {
    Object.values(nodes).forEach(node => {
      if ((node as Mesh).isMesh) {
        const mesh = node as Mesh
        mesh.castShadow = true
        mesh.receiveShadow = true
      }
    })

    // Body paint — silver Z-tune finish with clearcoat
    const paint = materials.r3nNissan_SkylineGTRR34TNR2_2002PaintTNR_Material1
    if (paint) {
      applyProps(paint, {
        color: '#B0B2B1',
        envMapIntensity: 2.0,
        roughness: 0.22,
        metalness: 0.75,
        clearcoat: 1.0,
        clearcoatRoughness: 0.06,
        normalScale: [2.5, 2.5],
      })
    }

    // Windows — near-black tinted glass
    const window = materials.r3nNissan_SkylineGTRR34TNR2_2002Window_Material1
    if (window) {
      applyProps(window, {
        color: '#0a0a0a',
        roughness: 0.02,
        metalness: 0.0,
        clearcoat: 0.4,
      })
    }

    // Nismo alloy wheels — polished chrome
    const wheels = materials.Nismo_alloy
    if (wheels) {
      applyProps(wheels, {
        metalness: 1.0,
        roughness: 0.03,
        envMapIntensity: 3.5,
      })
    }

    // Brake discs — dark cast iron
    const brakeDiscs = materials.w_TNRRims_87A18NaBrakeDisc_ForgedDrilled_Material1
    if (brakeDiscs) {
      applyProps(brakeDiscs, {
        metalness: 0.8,
        roughness: 0.55,
        color: '#2a2a2a',
      })
    }

    // Brake calipers — gloss red (Nismo spec)
    const calipers = materials.r1Nissan_SkylineGTRR34TNR2_2002_CallipersCalliperGloss_Material1
    if (calipers) {
      applyProps(calipers, {
        color: '#8B0000',
        metalness: 0.1,
        roughness: 0.15,
        clearcoat: 1.0,
      })
    }

    // Carbon fibre — dark with subtle sheen
    const carbon = materials.r3nNissan_SkylineGTRR34TNR2_2002Carbon1_Material1
    if (carbon) {
      applyProps(carbon, { roughness: 0.3, metalness: 0.1, envMapIntensity: 0.8 })
    }

    // Interior — matte dark
    const interior = materials.r3nNissan_SkylineGTRR34TNR2_2002InteriorA_Material1
    if (interior) {
      applyProps(interior, { roughness: 0.85, metalness: 0.0, envMapIntensity: 0.3 })
    }

    // Brake / tail lights — natural red glow
    const brakeLight = materials.red_glass
    if (brakeLight) {
      applyProps(brakeLight, {
        color: '#cc0000',
        emissive: '#cc0000',
        emissiveIntensity: 0.8,
        roughness: 0.1,
        metalness: 0.0,
      })
    }
  }, [materials, nodes])

  return <primitive object={scene} scale={SKYLINE_SCALE} />
}

function ExcavatorModel() {
  const { scene, nodes, materials } = useGLTF(EXCAVATOR_MODEL_PATH)

  useEffect(() => {
    Object.values(nodes).forEach(node => {
      if ((node as Mesh).isMesh) {
        const mesh = node as Mesh
        mesh.castShadow = true
        mesh.receiveShadow = true
      }
    })

    // Main body — bright construction yellow, polished clearcoat
    const body1 = materials.Excavator_01
    if (body1) {
      applyProps(body1, {
        color: '#FFC107',
        envMapIntensity: 2.8,
        roughness: 0.18,
        metalness: 0.3,
        clearcoat: 0.9,
        clearcoatRoughness: 0.08,
      })
    }

    // Secondary panels — same yellow, slightly less polished
    const body2 = materials.Excavator_02
    if (body2) {
      applyProps(body2, {
        color: '#FFC107',
        envMapIntensity: 2.4,
        roughness: 0.25,
        metalness: 0.3,
        clearcoat: 0.75,
        clearcoatRoughness: 0.1,
      })
    }

    // Tracks / undercarriage — dark steel, worn
    const tracks = materials.Excavator_03
    if (tracks) {
      applyProps(tracks, {
        envMapIntensity: 1.0,
        roughness: 0.7,
        metalness: 0.85,
      })
    }

    // Cab glass — tinted, reflective
    const glass = materials.Excavator_Glass
    if (glass) {
      applyProps(glass, {
        color: '#1a2a1a',
        roughness: 0.04,
        metalness: 0.0,
        clearcoat: 0.4,
      })
    }
  }, [materials, nodes])

  return <primitive object={scene} scale={EXCAVATOR_SCALE} />
}

function ManBusModel({ isMobile }: { isMobile: boolean }) {
  const { scene, nodes, materials } = useGLTF(MAN_MODEL_PATH)

  useEffect(() => {
    Object.values(nodes).forEach(node => {
      const mesh = node as Mesh
      if (!mesh.isMesh) return
      mesh.castShadow = true
      mesh.receiveShadow = true
    })

    // Polygon offset for glass overlays to prevent z-fighting
    ;['clearglass', 'windowglass', 'darkglass', 'orangeglass', 'redglass'].forEach(name => {
      const mat = materials[name] as MeshStandardMaterial | undefined
      if (!mat) return
      mat.polygonOffset = true
      mat.polygonOffsetFactor = -1
      mat.polygonOffsetUnits = -1
    })

    // Upgrade carpaint to MeshPhysicalMaterial for clearcoat support — silver finish matching Skyline
    const bodyMat = new MeshPhysicalMaterial({
      color: '#B0B2B1',
      envMapIntensity: 2.5,
      roughness: 0.22,
      metalness: 0.75,
      clearcoat: 1.0,
      clearcoatRoughness: 0.06,
    })
    scene.traverse(obj => {
      const mesh = obj as Mesh
      if (mesh.isMesh && (mesh.material as MeshStandardMaterial)?.name === 'carpaint') {
        mesh.material = bodyMat
      }
    })

    if (materials.chrome)
      applyProps(materials.chrome, { envMapIntensity: 6.0, roughness: 0.02, metalness: 1.0 })
    if (materials.mirror)
      applyProps(materials.mirror, { envMapIntensity: 5.5, roughness: 0.02, metalness: 1.0 })
    if (materials.clearglass)
      applyProps(materials.clearglass, { envMapIntensity: 4.5, roughness: 0.02, metalness: 0.0 })
    if (materials.windowglass)
      applyProps(materials.windowglass, { envMapIntensity: 4.5, roughness: 0.02, metalness: 0.0 })
    if (materials.darkglass)
      applyProps(materials.darkglass, {
        color: '#0a0a0a',
        envMapIntensity: 4.0,
        roughness: 0.02,
        metalness: 0.0,
      })
    if (materials.orangeglass)
      applyProps(materials.orangeglass, { envMapIntensity: 3.0, roughness: 0.03, metalness: 0.0 })
    if (materials.redglass)
      applyProps(materials.redglass, {
        color: '#cc0000',
        emissive: '#cc0000',
        emissiveIntensity: 0.8,
        roughness: 0.03,
        metalness: 0.0,
      })
    if (materials.tire)
      applyProps(materials.tire, { envMapIntensity: 0.3, roughness: 0.95, metalness: 0.0 })
    if (materials.black)
      applyProps(materials.black, { envMapIntensity: 0.6, roughness: 0.85, metalness: 0.0 })
    if (materials.white)
      applyProps(materials.white, { envMapIntensity: 1.8, roughness: 0.35, metalness: 0.15 })
    if (materials.mattemetal)
      applyProps(materials.mattemetal, { envMapIntensity: 2.5, roughness: 0.45, metalness: 0.85 })
    if (materials.material) applyProps(materials.material, { envMapIntensity: 1.5 })
    if (materials.material_21) applyProps(materials.material_21, { envMapIntensity: 1.5 })
    ;[
      'interior',
      'interior_second',
      'interior_third',
      'interior_fourth',
      'interior_fifth',
      'interior_sixth',
      'interior_seventh',
    ].forEach(name => {
      if (materials[name])
        applyProps(materials[name], { envMapIntensity: 0.4, roughness: 0.85, metalness: 0.05 })
    })
    ;['LicPlate_black', 'LicPlate_blue', 'LicPlate_white', 'LicPlate_yellow'].forEach(name => {
      if (materials[name]) applyProps(materials[name], { envMapIntensity: 1.0 })
    })

    // Align wheel contact point (Y_min) to Y=0 so restPosition controls wheel height directly
    scene.position.y = 0
    scene.updateWorldMatrix(false, true)
    const box = new Box3().setFromObject(scene)
    scene.position.y = -box.min.y
  }, [scene, nodes, materials])

  return <primitive object={scene} scale={isMobile ? MAN_MOBILE_SCALE : MAN_SCALE} />
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
  const idleTime = useRef(config.idlePhase)

  useFrame((_state, delta) => {
    const group = groupRef.current
    if (!group) return

    const clampedDelta = Math.min(delta, 0.05)
    idleTime.current += clampedDelta

    const targetProgress = shouldDropModel || prefersReducedMotion ? 1 : 0
    revealProgress.current = MathUtils.damp(
      revealProgress.current,
      targetProgress,
      prefersReducedMotion ? 10 : 4.5,
      clampedDelta
    )

    const progress = revealProgress.current
    const idleStrength = prefersReducedMotion ? 0 : MathUtils.smoothstep(progress, 0.76, 1)

    group.position.y =
      MathUtils.lerp(DROP_START_Y, config.restPosition[1], progress) +
      Math.sin(idleTime.current * 0.7) * 0.04 * idleStrength

    group.rotation.x = MathUtils.lerp(config.dropRotation[0], config.restRotation[0], progress)
    group.rotation.y = MathUtils.lerp(config.dropRotation[1], config.restRotation[1], progress)
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
  const orbitTime = useRef(0)

  useFrame((state, delta) => {
    const clampedDelta = Math.min(delta, 0.05)
    orbitTime.current += clampedDelta
    const elapsedTime = orbitTime.current
    const activeConfig = getModelConfig(activeModelIndex)
    const targetStrength = prefersReducedMotion ? 0 : allowIdleOrbit ? 1 : 0
    const targetRadius = activeConfig.orbitRadius * (isMobile ? MOBILE_ORBIT_FACTOR : 1)

    orbitStrength.current = MathUtils.damp(orbitStrength.current, targetStrength, 3.2, clampedDelta)
    orbitRadius.current = MathUtils.damp(orbitRadius.current, targetRadius, 4, clampedDelta)
    lookAtY.current = MathUtils.damp(lookAtY.current, activeConfig.lookAtY, 4, clampedDelta)

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
  const { invalidate } = useThree()

  useFrame(() => {
    if (called.current) return

    frames.current += 1
    if (frames.current < READY_GATE_FRAMES) {
      invalidate()
      return
    }

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
          key="skyline"
          shouldDropModel={shouldDropModel}
          prefersReducedMotion={prefersReducedMotion}
          config={activeConfig}
        >
          <SkylineModel />
        </AnimatedVehicle>
      ) : activeModelIndex === 1 ? (
        <AnimatedVehicle
          key="scania"
          shouldDropModel={shouldDropModel}
          prefersReducedMotion={prefersReducedMotion}
          config={activeConfig}
        >
          <ScaniaModel />
        </AnimatedVehicle>
      ) : activeModelIndex === 2 ? (
        <AnimatedVehicle
          key="excavator"
          shouldDropModel={shouldDropModel}
          prefersReducedMotion={prefersReducedMotion}
          config={activeConfig}
        >
          <ExcavatorModel />
        </AnimatedVehicle>
      ) : (
        <AnimatedVehicle
          key="man-bus"
          shouldDropModel={shouldDropModel}
          prefersReducedMotion={prefersReducedMotion}
          config={activeConfig}
        >
          <ManBusModel isMobile={isMobile} />
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

      <Environment preset="forest" frames={1} resolution={256} />
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
  sceneVisible: boolean
  isInViewport: boolean
}

export function HeroCarouselScene({
  activeModelIndex,
  onSceneReady,
  shouldDropModel,
  prefersReducedMotion,
  allowIdleOrbit,
  preloadInactiveModel,
  isMobile,
  sceneVisible,
  isInViewport,
}: HeroCarouselSceneProps) {
  useEffect(() => {
    useGLTF.preload(getModelPath(activeModelIndex))
    useEnvironment.preload({ preset: 'forest' })
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
      frameloop={sceneVisible && isInViewport ? 'always' : 'demand'}
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

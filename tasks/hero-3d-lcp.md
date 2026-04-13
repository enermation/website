# Hero 3D — LCP & Performance Plan

## Quick Wins (no dependencies)

- [ ] Fix `frames={Infinity}` → `frames={1}` on `Environment` — static HDR re-renders every frame for no reason
- [ ] Add `useEnvironment.preload('/models/factory-road-turnaround_1K.exr')` at module level — parallelize env load with model load

## Poster Image Swap (biggest LCP impact)

- [ ] Use Playwright to screenshot both car slides (slide=0 Porsche, slide=1 Lambo) from localhost:3000
- [ ] Convert screenshots to AVIF using `sharp` (already installed)
- [ ] Save to `public/images/hero-poster-0.avif` and `public/images/hero-poster-1.avif`
- [ ] Update `hero-carousel-wrapper.tsx`:
  - Show `<Image src={poster} priority fetchPriority="high" />` immediately (instant LCP signal)
  - Once 3D Canvas is ready (`onModelLoaded` fires), cross-fade from poster to Canvas
  - Must NOT use `opacity: 0` to hide poster (Chrome won't record LCP)

## GLB Compression (KTX2 + Meshopt)

- [ ] Run `bunx gltfpack` on both GLBs:
  ```
  bunx gltfpack -i public/models/lambo.glb -o public/models/lambo.glb -cc -tc
  bunx gltfpack -i public/models/911-transformed.glb -o public/models/911-transformed.glb -cc -tc
  ```
  - `-cc` = meshopt compression (faster decode than Draco on mobile)
  - `-tc` = KTX2/ETC1S texture compression (GPU-ready, skips CPU decode)
- [ ] Enable KTX2 loader in `useGLTF` via `extendLoader` callback
- [ ] Verify models still render correctly after compression

## WebGPU Renderer

- [ ] Update Canvas `gl` prop to async WebGPU init with WebGL2 fallback:
  ```tsx
  gl={async (props) => {
    const renderer = new THREE.WebGPURenderer(props as any)
    await renderer.init()
    return renderer
  }}
  ```
- [ ] Import from `three/webgpu` instead of `three`
- [ ] Extend ThreeElements for TypeScript
- [ ] Test fallback on non-WebGPU browser

## Notes

- Three.js: 0.183.2 (WebGPU supported)
- R3F: 9.5.0 (async gl prop supported)
- Models: `lambo.glb`, `911-transformed.glb`
- Env map: `factory-road-turnaround_1K.exr` (convert to HDR if imagemagick available)
- `sharp` already installed — use for AVIF conversion

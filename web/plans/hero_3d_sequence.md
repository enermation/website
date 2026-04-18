## Overview

Rebuild the homepage hero into a staged cinematic sequence that preserves the premium 3D end state while fixing the current startup lag, glow pop-in, and unstable first paint.

This plan supersedes the older exploratory checklist in `tasks/hero-3d-lcp.md`.

Target sequence:

1. Video background appears immediately, with a poster/image safety net behind it for first-frame stability.
2. `ENERMATION` reveals as DOM text.
3. The rainbow sweep runs automatically from right to left.
4. During the text phase, the first 3D model preloads.
5. The 3D canvas fades in and the car drops from above.
6. The text fades out.
7. The car settles into its idle premium state with lighting, shadows, and subtle motion.

The goal is not to remove the 3D model, lighting, shadows, or motion. The goal is to change the startup sequence so the hero feels intentional instead of overloaded.

---

## Problems to fix

- [ ] The hero currently waits on Shopify homepage data before rendering, even though the hero itself does not depend on that data.
- [ ] The hero wrapper is fully client-only and hides the whole hero behind a skeleton.
- [ ] The `onReady` logic fires too early and more than once, so the loading state does not reflect the actual 3D readiness.
- [ ] The wrong model is preloaded first.
- [ ] The hero has 3 category labels but only 2 3D models, which creates a slide/model mismatch.
- [ ] Video, WebGL, HDR environment lighting, contact shadows, bloom, LUT, and secondary model preloading all compete during initial load.
- [ ] The initial glow/pop on the car suggests HDR reflection and post-processing are appearing before the scene settles.
- [ ] The experience only becomes smooth after assets, shaders, and GPU state warm up.
- [ ] `frameloop="always"` keeps the hero rendering continuously even during phases that may not need full-rate updates.
- [ ] The LUT asset path is currently loaded unconditionally even when the effect is visually disabled.

---

## Visual direction

### Keep

- [ ] Background atmosphere
- [ ] Premium 3D car presentation
- [ ] Lighting and reflections
- [ ] Shadows under the car
- [ ] Subtle idle motion after reveal
- [ ] Cinematic feel

### Change

- [ ] Replace first-frame 3D dependence with a poster-first hero shell
- [ ] Lead with text animation instead of a loading skeleton
- [ ] Delay the model reveal until the first model is actually ready
- [ ] Remove unnecessary startup work from the hero path
- [ ] Stage the polish instead of demanding maximum quality immediately

---

## Accessibility and motion

The hero sequence must stay usable and readable before the 3D scene is visible.

Requirements:

- [ ] Keep `ENERMATION` as real DOM text, not canvas-only text
- [ ] Keep CTA usable before 3D is ready
- [ ] Maintain readable contrast over poster/video backgrounds
- [ ] Add a `prefers-reduced-motion` version that removes or softens:
  - text reveal choreography
  - rainbow sweep motion
  - model drop exaggeration
  - idle orbit if it becomes distracting
- [ ] Ensure the reduced-motion path still preserves a premium static composition

Implementation preference:

- Use CSS-first animation for shell text where possible
- Use heavier JS animation only where sequencing or 3D state requires it

---

## Hero architecture

### 1. Split hero rendering from homepage data

The hero must render independently from Shopify collection and latest-arrivals fetches.

Implementation:

- Move the hero so it renders before the homepage waits on `fetchCollections()` and `fetchCollectionProducts()`
- Keep below-the-fold sections in their own async/suspense boundaries
- Ensure first paint is driven by the hero shell, not store data

Primary file:

- `web/app/page.tsx`

---

### 2. Build a server-rendered hero shell

The hero shell should be immediately visible without waiting for client-side WebGL.

Shell contents:

- Poster or hero image
- Background video layer if retained
- `ENERMATION` text animation
- CTA and layout chrome

Requirements:

- Do not hide the entire hero behind a skeleton
- Video is the primary persistent background — always visible throughout the sequence
- Poster (`/images/fallback-bg.webp`) is a hidden safety net only: shown by the browser before the first video frame loads, then replaced invisibly by the video
- Add `poster="/images/fallback-bg.webp"` to the `<video>` element — export `heroVideoPoster` from `web/lib/data.ts`
- Do not create a visible "poster then video" handoff; the swap must be imperceptible

Likely files:

- `web/components/hero-carousel-wrapper.tsx`
- new `web/components/hero-*` shell components
- `web/lib/data.ts`

---

### 3. Install and adapt the shadcn text effect

Desired behavior:

- The text reveal appears first
- The rainbow gradient effect runs automatically
- The sweep should look like hover, but be driven by code instead of pointer interaction
- The sweep should move from right to left

Implementation:

- Install the registry component via:
  - `bunx shadcn@latest add https://www.shadcn.io/r/text-hover-effect.json?...`
- If installation is blocked or unsuitable, vendor the effect locally
- Convert hover-only styling into state/class/data-attribute driven animation
- Use keyframes or timed React state to trigger the sweep automatically after the text reveal completes
- Do not fake browser hover events; treat the effect as a controlled animation state
- Prefer CSS/keyframes for the text layer before reaching for heavier runtime animation libraries

Files:

- new text effect component under `web/components/`
- `web/app/globals.css` if extra keyframes/utilities are needed

---

### 4. Stage the timeline

The hero should be driven by explicit phases rather than letting everything start at once.

Suggested phases:

- `shell-visible`
- `text-reveal`
- `rainbow-sweep`
- `scene-ready`
- `model-drop`
- `text-exit`
- `idle`

Rules:

- The canvas should not become visible until the first model is actually ready
- The text animation should buy load time for the model
- The text should fade out only after the model reveal has clearly started
- The text should be gone by the time the model reaches its settled idle state

Implementation options:

- local React state with timers
- event-based progression from model-ready callbacks

---

## 3D scene refactor

### 5. Fix first-model loading

The current first preload does not match the model shown first.

Implementation:

- Preload the actual first visible model
- Do not preload the secondary model during the critical first second unless the first scene is already stable
- Load additional models on idle, interaction, or slide change

Primary file:

- `web/components/hero-carousel.tsx`

---

### 6. Fix ready-state handling

The ready state should represent actual model readiness, not component mount.

Implementation:

- Remove any early `onReady` call that fires before the scene is ready
- Keep one source of truth for scene readiness
- Only fade out placeholders and reveal the canvas after:
  - first model assets are loaded
  - environment is ready enough for a stable reveal
  - initial reveal animation can begin cleanly

---

### 7. Simplify initial render cost

The current hero tries to render a showroom-grade scene immediately. That should be reduced during startup.

Initial startup recommendations:

- [ ] Fixed DPR instead of adaptive quality monitoring
- [ ] Revisit `frameloop` strategy so render cost matches hero phase rather than running full-time by default
- [ ] No bloom during first reveal
- [ ] No LUT during first reveal
- [ ] Lazy-load or phase-load the post-processing/LUT path so disabled effects do not still force asset downloads
- [ ] Keep HDR environment lighting only if it remains small and predictable
- [ ] Use cheaper or staged shadows initially
- [ ] Keep one model active during initial reveal
- [ ] Avoid extra runtime quality toggles on first paint

Post-reveal enhancements are acceptable if they do not destabilize the animation.

Notes:

- Do not treat `frameloop="demand"` as mandatory in every phase; choose render cadence based on the actual sequence needs
- If drop animation or idle motion still needs continuous updates, scope that cost intentionally instead of paying it for all hero states
- Do not conditionally call hooks like `useLoader`; isolate LUT/post-processing into a separately mounted or lazy-loaded branch

---

### 8. Implement the drop animation

Desired effect:

- The model starts above frame
- It drops into position after the text sequence
- The landing feels deliberate, not physics-heavy
- Shadow/reflection intensity can ramp in as the car settles

Implementation:

- Use direct interpolation of position/rotation/scale
- Avoid unnecessary physics engines
- Keep the landing readable and premium, not exaggerated

The drop should be smooth on both desktop and mobile.

---

## Background strategy

### Preferred approach

- Video remains as primary persistent atmosphere
- Poster/image acts as hidden first-frame safety net
- 3D reveal after text sequence

### Important constraint

Video is not inherently incompatible with HDR lighting, but the performance cost of:

- decoding a full-screen video
- rendering a transparent WebGL scene
- computing HDR reflections
- running post-processing
- preloading additional 3D assets

all at the same time causes the rough startup currently seen in the hero.

If video is kept:

- it should not be the only background fallback
- it should not force the 3D scene to fight for startup resources
- it should preferably be a local optimized asset or otherwise not a fragile remote dependency for first paint
- it should remain visually continuous through text reveal, model drop, and idle state
- fallback image should match video mood closely enough that any startup protection is visually invisible

---

## Slide and content strategy

### Short-term recommendation

- Reduce the initial hero to one primary model and one polished reveal flow

This is the fastest path to a premium and stable result.

Decision for first implementation pass:

- [ ] Treat one-model-first as default scope
- [ ] Do not preserve multi-slide complexity in the first pass unless it is needed to keep the page functional
- [ ] Only reintroduce additional hero models after the first reveal path is stable and smooth

### If multi-slide hero remains

- The number of hero categories must match the number of actual model states/assets
- URL state, dots, arrow navigation, and model availability must stay aligned
- Additional slides should not degrade first paint

---

## File plan

Likely files to touch:

- `web/app/page.tsx`
- `web/components/hero-carousel.tsx`
- `web/components/hero-carousel-wrapper.tsx`
- `web/lib/data.ts`
- `web/app/globals.css`
- new hero shell / text / sequence components in `web/components/`

Possible new files:

- `web/components/hero-shell.tsx`
- `web/components/hero-sequence.tsx`
- `web/components/hero-brand-text.tsx`

Exact naming can change if a cleaner split emerges during implementation.

---

## Asset follow-up

These are valuable follow-up optimizations, but not prerequisites for starting the hero refactor.

- [ ] Localize and optimize the hero video if video remains in scope
- [ ] Compress or optimize GLB assets after structural fixes land
- [ ] Re-evaluate HDR and texture sizes after the new startup sequence is in place
- [ ] Only add asset-generation workflows if existing repo assets cannot support the final quality target

The first pass should prioritize architectural fixes over deeper asset pipeline work.

---

## Implementation order

1. [ ] Decouple hero rendering from Shopify homepage fetches
2. [ ] Add a server-rendered hero shell with persistent video background and hidden poster/image fallback
3. [ ] Install or vendor the shadcn text-hover component
4. [ ] Convert the hover effect into an automatic right-to-left rainbow sweep
5. [ ] Introduce explicit hero phase state
6. [ ] Fix first-model preload and scene ready-state handling
7. [ ] Remove the slide/model mismatch or reduce hero scope to one model first
8. [ ] Simplify startup rendering quality
9. [ ] Add the car drop-in reveal
10. [ ] Tune transitions so text exit and model reveal overlap cleanly
11. [ ] Reintroduce only the extra polish that proves visually necessary

---

## Acceptance criteria

- [ ] Hero content appears immediately without waiting on Shopify data
- [ ] No full-screen skeleton masks the entire hero during startup
- [ ] Video remains background throughout the sequence without a jarring visible fallback swap
- [ ] Text reveal is visible before the model
- [ ] Rainbow sweep runs automatically without pointer hover
- [ ] The model reveal is delayed until the scene is actually ready
- [ ] The car can still end in a high-quality lit/shadowed state
- [ ] The car retains a premium idle state after landing, including subtle motion/orbit if it still looks intentional
- [ ] No obvious glow pop-in during first reveal
- [ ] No second-wave hitch from unnecessary early preloads
- [ ] Mobile remains smooth and visually coherent
- [ ] The final result still feels premium and cinematic

---

## Notes

- If the shadcn registry install requires network approval, request it during implementation
- After modifying code files, update the graph per repo instructions
- Prefer a stable, polished reveal over maximum first-frame rendering complexity
- `tasks/hero-3d-lcp.md` is not source of truth for implementation ordering

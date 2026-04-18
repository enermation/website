# Changelog

## v0.1.3 (2026-04-18)

### Features
- **Hero**: cinematic 3D hero sequence, multi-model carousel, staged 3D hero carousel
- **Video**: integrate BackgroundVideo with Mux, autoplay on scroll visibility, compressed HDR environment
- **Collection**: editorial luxury redesign, EditorialHero, EditorialFeed editorial stories, GSAP animations
- **Product page**: editorial luxury redesign — typography, stagger, grain
- **Instagram**: redesign feed with trending grid layout, reel support, live Behold JSON feed
- **Search**: header search with Shopify Storefront API integration
- **About**: narrative-driven About Us page
- **Cart**: redesign cart sidebar with editorial styling and animations
- **Homepage**: dark card treatment, refined animations on Latest Arrivals

### Performance
- Optimize GSAP animations and resolve race conditions in hero carousel
- Decouple Instagram feed with nested suspense, fix animation flicker
- Optimize homepage LCP, 3D performance, and RSC payload
- Convert environment map from EXR to HDR (5.7MB → 1.53MB)
- Implement bomb drop entrance and deferred 3D model preloading

### Bug Fixes
- Hero: pull camera back on mobile to prevent model overflow
- Hero: eliminate bright flash with ACES tone mapping and soft start ramp
- Hero: resolve GPU memory leaks and bright flash
- Hero: align camera to orbit path and face Porsche front to camera
- Cart: fix cart not updating after add to cart and sheet visibility
- Collection: wire desktop Filter Stock button and honor reduced-motion preference
- Homepage: audit fixes — bundle size, cache, video URL, and no-JS fallback

### Refactor
- Remove GSAP animations and entrance timelines while retaining 3D camera rig
- Consolidate helpers, name magic numbers, fix revalidateTag
- Remove next-video and Shopify video fetching in favor of static URLs
- Refresh collection UI — typography, brand accents, motion, and atmosphere
- Extract formatPrice utility to eliminate duplicated Intl.NumberFormat calls
- Inline GSAP animation hooks into components

### Chores
- Upgrade @react-three/fiber to 9.6.0
- Remove unused @react-three/postprocessing and postprocessing packages
- Add graphify knowledge graph outputs
- Add @chenglou/pretext for DOM-reflow-free text measurement
- Improve git hooks with commitlint and incremental tsc

---

## v0.1.2 (2026-04-18)

### Features
- Switch to factory road EXR environment with improved camera framing
- Switch to parking garage HDR background
- Use HDR environment map for realistic workshop background
- Add BMW X7 xDrive40i as SUV model
- Add Home link to Shopify menu navigation
- Convert Latest Arrivals grid to swipable carousel
- Replace carousel ring with single-model viewer and optimize GLB assets
- Add multi-model carousel with refined phase sequencing
- Implement staged and cinematic 3D hero carousel

### Bug Fixes
- Remove useProgress from ReadyGate to fix stuck poster transition
- Fix camera orbit to full 360° circle
- Swap 3D models to match category labels (Sedan=Porsche, SUV=Lambo)
- Match PPF workshop dark background and lighting
- Correct model orientation, scale, and nav button styling
- Align wordmark border and use semantic color token
- Improve hero carousel accessibility (a11y)
- Use Stage/Bounds for responsive 3D product framing

### Performance
- Add AVIF poster swap with LCP-first load and env preload
- Delay poster fade until scene is fully rendered
- Add adaptive performance system for 3D carousel
- Match car paint to poster colors and remove skeleton

### Refactor
- Inline FooterNavLinks, remove unused BoldFooter
- Restore SiteFooter with text-based Enermation wordmark
- Replace custom lightbox with yet-another-react-lightbox
- Simplify page layout and use ProductSpecs1 component

### Chores
- Add missing article / fix typo in project description
- Improve git hooks with commitlint and incremental tsc
- Migrate husky/lint-staged to bunx, drop package-lock.json

---

## v0.1.1 (2026-04-18)

### Features
- Add Home link to Shopify menu navigation
- Add BMW X7 xDrive40i as SUV model
- Convert Latest Arrivals grid to swipable carousel
- Replace carousel ring with single-model viewer and optimize GLB assets

### Bug Fixes
- Correct model orientation, scale, and nav button styling
- Adjust camera zoom and add gray background for 3D models
- Add mobile-specific height for hero section and optimize imports
- Use Stage/Bounds for responsive 3D product framing
- Improve hero carousel accessibility (a11y)
- Resolve biome lint formatting errors
- Resolve audit violations — remove dead code, consolidate data, use MDI icons

### Chores
- Add husky + lint-staged for auto-lint on commit
- Add CI/CD workflows for lint, typecheck, build, release, and security
- Remove unused --h-screen-mobile CSS token
- Skip tag/push if already exists in release workflow

---

## v0.1.0 (2026-04-18)

Initial release.

---

## 2026-04-09

**Mobile-first showroom and product experience launch**

The web app shipped major UX upgrades across homepage, collections, showroom, and product details, with a strong focus on mobile-first layouts and reusable UI primitives.

### New Features
- Delivered a mobile-first responsive homepage and header, including a hamburger drawer, responsive content blocks, and mobile/desktop-specific car listing layouts ([108d03c](https://github.com/syedaliabbas1/enermation-website/commit/108d03c)).
- Added a full product detail page structure (`/products/[handle]`) with gallery, specs, enquiry/contact sections, related cars, and related stories ([55d7744](https://github.com/syedaliabbas1/enermation-website/commit/55d7744)).
- Implemented Figma-aligned mobile layout updates for collections and refined showroom/product pages ([2312e5e](https://github.com/syedaliabbas1/enermation-website/commit/2312e5e), [ca26e5d](https://github.com/syedaliabbas1/enermation-website/commit/ca26e5d)).
- Added a Shopify catalog seed workflow to support data setup/automation ([4349d9f](https://github.com/syedaliabbas1/enermation-website/commit/4349d9f)).

### Bug Fixes
- Fixed semantic token usage, shared component consistency, and static data extraction in product/collection flows ([b0a796f](https://github.com/syedaliabbas1/enermation-website/commit/b0a796f), [6ab8817](https://github.com/syedaliabbas1/enermation-website/commit/6ab8817)).
- Corrected showroom links and Shopify query alignment, and removed duplicated footer rendering ([f091b81](https://github.com/syedaliabbas1/enermation-website/commit/f091b81), [eeb626f](https://github.com/syedaliabbas1/enermation-website/commit/eeb626f)).

### Refactoring
- Unified typography with semantic font tokens and migrated key UI blocks to shared shadcn-based components ([4c6a687](https://github.com/syedaliabbas1/enermation-website/commit/4c6a687), [a0b6fff](https://github.com/syedaliabbas1/enermation-website/commit/a0b6fff)).

### Documentation
- Added font usage mapping notes in global styles to improve maintainability ([cb6c8ac](https://github.com/syedaliabbas1/enermation-website/commit/cb6c8ac)).

## 2026-04-08

**Homepage-to-collections transition and Shopify data integration**

The project shifted from static scaffolding to a Shopify-backed, collections-driven experience, while establishing core shared layout/navigation components and repo tooling conventions.

### New Features
- Wired Shopify Storefront API into the homepage and added centralized GraphQL queries/types plus broader API test coverage ([258e0d4](https://github.com/syedaliabbas1/enermation-website/commit/258e0d4)).
- Introduced shared site header/footer/social components and initial showroom/cars navigation scaffolding ([883134e](https://github.com/syedaliabbas1/enermation-website/commit/883134e)).
- Replaced homepage product grid with collections-focused presentation and updated CTA routing to collections ([0c3431e](https://github.com/syedaliabbas1/enermation-website/commit/0c3431e), [a5cdd95](https://github.com/syedaliabbas1/enermation-website/commit/a5cdd95)).

### Refactoring
- Reworked routing from `/cars` to `/collections/*` and updated related query fields to match the new data/display model ([bb0846e](https://github.com/syedaliabbas1/enermation-website/commit/bb0846e)).

### Configuration
- Adopted Biome as the lint/format workflow and tuned includes/exclusions for project directories ([a011783](https://github.com/syedaliabbas1/enermation-website/commit/a011783), [a73a26b](https://github.com/syedaliabbas1/enermation-website/commit/a73a26b), [7ebc5ee](https://github.com/syedaliabbas1/enermation-website/commit/7ebc5ee)).
- Added Figma design token variables to global CSS and mapped them for theme usage ([c1591aa](https://github.com/syedaliabbas1/enermation-website/commit/c1591aa)).

## 2026-04-05

**Initial platform setup and repository structure**

This period established the project foundation, including the app baseline and early Shopify integration structure.

### New Features
- Restructured into `web/` and `graphql/` directories and introduced Shopify storefront client/test-route groundwork ([1cdd3e5](https://github.com/syedaliabbas1/enermation-website/commit/1cdd3e5)).
- Created the initial repository baseline and setup commits ([0158ec0](https://github.com/syedaliabbas1/enermation-website/commit/0158ec0), [bcbd2c8](https://github.com/syedaliabbas1/enermation-website/commit/bcbd2c8)).

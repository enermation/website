---
name: stack
description: Technology stack and dependencies for the Enermation Workspace web application
metadata:
  type: codebase
---

# Technology Stack

**Analysis Date:** 2026-05-25

## Languages

**Primary:**
- TypeScript 5 (strict mode) - All source code
- ES2017 target (tsconfig.json)

**Secondary:**
- CSS/Tailwind v4 - Styling

## Runtime

**Environment:**
- Node.js 20+ (devDependencies specify @types/node ^20)
- Bun (preferred package manager for all scripts)

**Package Manager:**
- Bun (primary)
- npm (fallback)

## Frameworks

**Core:**
- Next.js 16.2.4 - React 19.2.5 framework with App Router
- React 19.2.5 - UI library

**Styling:**
- Tailwind CSS v4 - Utility-first CSS
- shadcn/ui v4.1.2 - Component library (base-nova style)
- @base-ui/react 1.3.0 - Radix-based UI primitives

**Testing:**
- Bun test (built-in) with @happy-dom/global-registrator 20.9.0
- Playwright 1.60.0 - E2E testing
- @testing-library/react 16.3.2 - Component testing

**Build/Dev:**
- Biome 2.4.10 - Linter and formatter
- @changesets/cli 2.30.0 - Version management

## Key Dependencies

**AI & Embeddings:**
- `ai` 6.0.169 - Vercel AI SDK for streaming LLM responses
- `@ai-sdk/anthropic` 3.0.71, `@ai-sdk/cohere` 3.0.34, `@ai-sdk/groq` 3.0.35, `@ai-sdk/gateway` 3.0.107 - Model providers
- `@qdrant/qdrant-js` 1.17.0 - Vector database client (Qdrant)
- `voyageai` 0.2.1 - Embeddings (alternative)

**Shopify Integration:**
- `@shopify/storefront-api-client` 1.0.10 - Storefront API client

**Data & Storage:**
- `@upstash/redis` 1.37.0, `@upstash/vector` 1.2.3, `@upstash/ratelimit` 2.0.8 - Upstash serverless data platform
- `@streamdown/*` packages - Text processing (cjk, code, math, mermaid)

**UI Components:**
- `embla-carousel-react` 8.6.0 - Carousel
- `vaul` 1.1.2 - Drawer/dialog
- `recharts` 3.8.0 - Charts
- `lucide-react` 1.14.0 - Icons
- `@heroicons/react` 2.2.0 - Icons
- `motion` 12.38.0 - Animations
- `gsap` 3.14.2, `@gsap/react` 2.1.2 - Animations
- `three` 0.167.1, `@react-three/fiber` 9.3.0, `@react-three/drei` 10.7.4 - 3D rendering
- `@rive-app/react-webgl2` 4.28.3 - Rive animations
- `@xyflow/react` 12.10.2 - Node graphs
- `maplibre-gl` 5.24.0 - Maps

**Forms & Validation:**
- `react-hook-form` 7.72.1, `@hookform/resolvers` 5.2.2 - Form handling
- `zod` 4.3.6 - Schema validation
- `@radix-ui/react-use-controllable-state` 1.2.2 - Controllable state

**Utilities:**
- `clsx` 2.1.1, `tailwind-merge` 3.5.0 - Class name merging (cn utility)
- `class-variance-authority` 0.7.1 - Component variants
- `nanoid` 5.1.9 - ID generation
- `date-fns` 4.1.0 - Date formatting
- `next-themes` 0.4.6 - Dark mode
- `sonner` 2.0.7 - Toast notifications
- `cmdk` 1.1.1 - Command menu
- `input-otp` 1.4.2 - OTP input
- `react-resizable-panels` 4.9.0 - Resizable panels
- `yet-another-react-lightbox` 3.31.0 - Lightbox
- `tokenlens` 1.3.1 - Token parsing
- `shiki` 4.0.2 - Syntax highlighting
- `streamdown` 2.5.0 - Streaming text

**Analytics:**
- `@vercel/analytics` 2.0.1 - Vercel analytics
- `@vercel/speed-insights` 2.0.0 - Performance monitoring

**Monitoring:**
- `@vercel/oidc` 3.4.0 - OIDC authentication

## Configuration

**TypeScript:** `web/tsconfig.json`
- Target: ES2017
- Strict mode enabled
- Path aliases: `@/*` maps to project root
- JSX: react-jsx

**Biome:** `web/biome.json`
- Linter with recommended rules
- No `any` types (error level)
- 100 character line width
- Single quotes, trailing commas

**Bun Test:** `web/bunfig.toml`
- Preload: `tests/bun-setup.tsx`
- Coverage threshold: 80%
- Timeout: 10000ms

**Next.js:** `web/next.config.ts`
- allowedDevOrigins: `192.168.0.95`
- cacheComponents: true
- Custom image loader
- Remote patterns: cdn.shopify.com, behold.pictures

## Platform Requirements

**Development:**
- Bun 1.0+ preferred
- Node.js 20+ for Playwright

**Production:**
- Vercel (implied by @vercel/* packages)
- Edge runtime compatible

---

*Stack analysis: 2026-05-25*
---
name: structure
description: Directory and file structure for Enermation codebase
metadata:
  type: codebase
---

# Codebase Structure

**Analysis Date:** 2026-05-25

## Directory Layout

```
ew/                                    # Monorepo root
├── web/                               # Next.js 16 application (primary)
│   ├── app/                           # App Router pages + API routes
│   │   ├── (main)/                    # Route group: shared layout (header + footer)
│   │   │   ├── page.tsx               # Home page
│   │   │   ├── about/                 # About page
│   │   │   ├── blog/                  # Blog pages
│   │   │   ├── collections/           # Collection pages
│   │   │   ├── contact/               # Contact page
│   │   │   ├── products/              # Product pages (dynamic handle)
│   │   │   ├── search/                # Search page
│   │   │   └── wishlist/              # Wishlist page
│   │   ├── api/                       # API routes
│   │   │   ├── rag/                   # RAG chat, process-queue, reindex, status, ping, test-webhook
│   │   │   ├── search/                # Search API
│   │   │   ├── shopify-webhook/       # Shopify webhook handler
│   │   │   └── transcribe/            # Transcription API
│   │   ├── actions/                   # Server Actions
│   │   │   ├── cart.ts                # Cart mutations
│   │   │   └── subscribe.ts           # Newsletter signup
│   │   ├── layout.tsx                 # Root layout (server)
│   │   ├── global-error.tsx          # Global error boundary
│   │   ├── miles/                     # Miles standalone page
│   │   ├── robots.ts                  # robots.txt generator
│   │   └── sitemap.ts                 # Sitemap generator
│   ├── components/                    # React components
│   │   ├── ui/                        # shadcn/ui-style primitives (Button, Card, Dialog, etc.)
│   │   ├── ai-elements/               # AI chat UI components (agent, artifact, code-block, etc.)
│   │   ├── rag/                       # RAG-specific components
│   │   ├── add-to-cart-button.tsx     # Feature component
│   │   ├── header-search.tsx          # Header with search
│   │   ├── site-header-client.tsx     # Navigation header (client)
│   │   ├── site-footer.tsx            # Footer
│   │   ├── shopping-cart1.tsx        # Shopping cart
│   │   ├── hero-carousel.tsx          # Hero carousel
│   │   ├── latest-arrivals-carousel.tsx
│   │   └── ...                        # Other feature components
│   ├── hooks/                          # Custom React hooks
│   │   ├── use-mobile.ts              # Mobile breakpoint detection
│   │   ├── use-debounce.ts            # Debounce utility
│   │   ├── use-scroll-to-bottom.ts   # Chat scroll tracking
│   │   └── use-text-measurement.ts   # DOM text measurement (pretext)
│   ├── lib/                            # Libraries and data layer
│   │   ├── shopify.ts                  # Shopify API client (Storefront + Admin)
│   │   ├── queries.ts                  # GraphQL query strings
│   │   ├── types.ts                    # TypeScript types for Shopify data
│   │   ├── data.ts                     # Static content data (typed .ts files)
│   │   ├── header-navigation.ts       # Navigation data
│   │   ├── cart-context.tsx            # Cart React Context
│   │   ├── wishlist-context.tsx       # Wishlist React Context
│   │   ├── rag/                        # RAG pipeline modules
│   │   │   ├── clients.ts              # Qdrant + Cohere client initialization
│   │   │   ├── query.ts                # Vector search + reranking
│   │   │   ├── embed.ts                # Embedding generation
│   │   │   ├── rerank.ts               # Cohere reranking
│   │   │   ├── chunk.ts                # Product chunking for vector DB
│   │   │   ├── indexer.ts              # Qdrant indexing logic
│   │   │   ├── prompt.ts               # System prompts for RAG chat
│   │   │   ├── types.ts                # RAG types
│   │   │   ├── ratelimit.ts           # Rate limiting
│   │   │   ├── vision.ts               # Image description for retrieval
│   │   │   └── ...                     # Other RAG utilities
│   │   ├── utils.ts                    # General utilities (cn, etc.)
│   │   └── text.ts                     # Text measurement utilities
│   ├── public/                         # Static assets (images, fonts)
│   ├── tests/                          # Test files
│   │   ├── bun-setup.tsx              # Test setup (happy-dom, mocks)
│   │   ├── unit/                      # Unit tests
│   │   └── integration/               # Integration tests
│   ├── app/globals.css                # Global styles + design tokens
│   ├── components.json                # shadcn/ui configuration
│   ├── next.config.ts                 # Next.js configuration
│   ├── tsconfig.json                  # TypeScript configuration
│   └── package.json                   # Dependencies
│
├── graphql/                            # Shopify GraphQL learning kit
│   ├── examples/                      # GraphQL query examples by topic
│   │   ├── 00_about_this_repo/
│   │   ├── 01_getting_started/
│   │   ├── 02_metafields_metaobjects/
│   │   ├── 03_international_pricing/
│   │   ├── 04_local_pickup/
│   │   └── 05_collections/
│   ├── build.js                       # Insomnia collection generator
│   └── package.json
│
├── scripts/                            # Build/utility scripts
│   └── ingest.ts                       # RAG vector ingestion script
│
├── .changeset/                        # Changeset configuration
├── tasks/                              # Task management
└── .planning/codebase/                # Codebase documentation output
```

## Directory Purposes

**web/app/:**
- Purpose: Next.js App Router structure - pages, layouts, API routes, Server Actions
- Contains: Route groups `(main)/`, API routes `api/`, Server Actions `actions/`, root layout
- Key files: `layout.tsx`, `(main)/layout.tsx`, `(main)/page.tsx`

**web/components/ui/:**
- Purpose: Reusable base UI primitives (shadcn/ui style)
- Contains: `button.tsx`, `card.tsx`, `dialog.tsx`, `input.tsx`, `select.tsx`, `sheet.tsx`, `table.tsx`, `carousel.tsx`, `chart.tsx`, etc.
- Key files: All components are named exports, use `data-slot` attribute on root element

**web/components/ai-elements/:**
- Purpose: AI chat interface components for RAG-powered chat widget
- Contains: `agent.tsx`, `artifact.tsx`, `code-block.tsx`, `context.tsx`, `panel.tsx`, `tool.tsx`, `terminal.tsx`, etc.
- Key files: These are client components with `'use client'` directive

**web/lib/rag/:**
- Purpose: RAG (Retrieval Augmented Generation) pipeline - embedding, vector search, reranking, chat
- Contains: `clients.ts` (Qdrant + Cohere), `query.ts` (search), `embed.ts` (Cohere embed-v4.0), `rerank.ts` (Cohere rerank-v3.5), `types.ts`
- Key files: `query.ts`, `prompt.ts`, `clients.ts`

**web/hooks/:**
- Purpose: Client-side React hooks
- Contains: `use-mobile.ts`, `use-debounce.ts`, `use-scroll-to-bottom.ts`, `use-text-measurement.ts`, `use-device-tier.ts`, `use-time-based-greeting.ts`

**web/tests/:**
- Purpose: Bun test suite with happy-dom DOM environment
- Contains: `bun-setup.tsx` (preload), `unit/`, `integration/`
- Key files: Test files co-located or in `tests/` directory

## Key File Locations

**Entry Points:**
- `web/app/layout.tsx`: Root layout - fonts, providers, metadata
- `web/app/(main)/layout.tsx`: Main layout - header + footer
- `web/app/(main)/page.tsx`: Home page

**Configuration:**
- `web/package.json`: Dependencies, scripts, engines
- `web/tsconfig.json`: TypeScript strict mode, path aliases (`@/*` -> `web/`)
- `web/next.config.ts`: Next.js configuration (minimal)
- `web/components.json`: shadcn/ui configuration
- `web/app/globals.css`: Global styles + CSS custom properties (design tokens)

**Core Logic:**
- `web/lib/shopify.ts`: Shopify API client with caching (fetchProduct, fetchCollections, etc.)
- `web/lib/queries.ts`: GraphQL query strings for Shopify Storefront API
- `web/lib/types.ts`: TypeScript types for Shopify data models
- `web/lib/rag/query.ts`: Vector search + reranking pipeline

**Testing:**
- `web/tests/bun-setup.tsx`: Test preload - happy-dom setup, mocks (next/image, next/cache, server-only, matchMedia, IntersectionObserver, ResizeObserver, canvas)

## Naming Conventions

**Files:**
- Components: `PascalCase.tsx` (e.g., `SiteHeader.tsx`, `HeroCarousel.tsx`)
- UI primitives: `PascalCase.tsx` (e.g., `Button.tsx`, `Card.tsx`)
- Utilities/hooks: `camelCase.ts` or `camelCase.tsx` (e.g., `use-debounce.ts`, `utils.ts`)
- API routes: `route.ts` in directory (e.g., `api/rag/chat/route.ts`)
- Server Actions: `camelCase.ts` (e.g., `cart.ts`, `subscribe.ts`)

**Directories:**
- Route groups: `(name)/` (e.g., `(main)/`)
- UI components: `ui/`
- Pages: `kebab-case/` (e.g., `blog/`, `products/`)
- Dynamic routes: `[handle]/` or `[...catchall]/`

## Where to Add New Code

**New Feature Page:**
- Primary code: `web/app/(main)/{feature}/page.tsx` (Server Component)
- Tests: `web/tests/unit/{feature}.test.tsx` or co-located `*.test.tsx`

**New API Route:**
- Implementation: `web/app/api/{domain}/{action}/route.ts`
- Examples: `web/app/api/rag/chat/route.ts`

**New UI Primitive (shadcn style):**
- Implementation: `web/components/ui/{component-name}.tsx`
- Must follow pattern: named export, `data-slot` attribute, `cn()` for className merging, accept `className` prop

**New RAG Component:**
- Implementation: `web/components/rag/{component-name}.tsx`
- Client components go in `ai-elements/` directory with `'use client'`

**New Shopify Data Fetcher:**
- Implementation: `web/lib/shopify.ts` (add function with `'use cache'` + `cacheTag`)
- Types: `web/lib/types.ts` (add/update TypeScript types)

**New Hook:**
- Implementation: `web/hooks/{use-feature-name}.ts`
- Must follow React hooks conventions (use prefix, client-side only)

## Special Directories

**web/app/(main)/:**
- Purpose: Route group with shared layout (SiteHeader + FooterContent)
- Generated: No
- Committed: Yes

**web/lib/rag/:**
- Purpose: RAG pipeline modules (embedding, vector search, reranking, chat)
- Generated: No
- Committed: Yes

**web/components/ai-elements/:**
- Purpose: AI chat UI components (agent, artifact, code-block, etc.)
- Generated: No
- Committed: Yes
- Contains 35+ components for rendering AI responses

**web/.next/:**
- Purpose: Next.js build cache and output
- Generated: Yes (by `next dev` or `next build`)
- Committed: No (.gitignore excludes this)

**web/public/:**
- Purpose: Static assets served as `/filename.ext`
- Generated: No (manually added)
- Committed: Yes

---

*Structure analysis: 2026-05-25*
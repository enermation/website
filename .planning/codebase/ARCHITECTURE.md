---
name: architecture
description: System architecture for Enermation Next.js application
metadata:
  type: codebase
---

# Architecture

**Analysis Date:** 2026-05-25

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                      Next.js 16 App Router                           │
│                    (Root Layout - Server)                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │              (main) Route Group - Shared Layout              │   │
│  │                    SiteHeader + Footer                       │   │
│  │           `web/app/(main)/layout.tsx` (Server)               │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              │                                       │
│        ┌─────────────────────┼─────────────────────┐                 │
│        ▼                     ▼                     ▼                 │
│  ┌────────────┐      ┌────────────┐      ┌────────────┐           │
│  │   /page    │      │ /products  │      │ /blog      │           │
│  │ Home Page  │      │  Dynamic   │      │  [handle]  │           │
│  └────────────┘      └────────────┘      └────────────┘           │
│                                                                      │
├─────────────────────────────────────────────────────────────────────┤
│                         API Layer                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │ /api/rag/    │  │ /api/search  │  │ /api/       │              │
│  │  chat,       │  │              │  │  shopify-   │              │
│  │  process-    │  │              │  │  webhook    │              │
│  │  queue,      │  │              │  │             │              │
│  │  reindex     │  │              │  │             │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
│                                                                      │
├─────────────────────────────────────────────────────────────────────┤
│                    Server Actions (`app/actions/`)                   │
│          `cart.ts` (Cart mutations)  │  `subscribe.ts`              │
├─────────────────────────────────────────────────────────────────────┤
│                      Data Layer                                      │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐         │
│  │   Shopify      │  │   Qdrant       │  │   Upstash      │         │
│  │ Storefront API │  │   Vector DB    │  │   Redis        │         │
│  │ (Products,    │  │ (RAG chunks)   │  │ (Rate limit,   │         │
│  │  Collections)  │  │                │  │  Vector)       │         │
│  └────────────────┘  └────────────────┘  └────────────────┘         │
└─────────────────────────────────────────────────────────────────────┘
```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| Root Layout | Font loading, providers, metadata | `web/app/layout.tsx` |
| Main Layout | Header + Footer wrapping all public pages | `web/app/(main)/layout.tsx` |
| SiteHeader | Navigation header (client component) | `web/components/site-header-client.tsx` |
| CartProvider | Shopping cart state via React Context | `web/lib/cart-context.tsx` |
| WishlistProvider | Wishlist state via React Context | `web/lib/wishlist-context.tsx` |
| Shopify Client | Storefront API + Admin API for metafields | `web/lib/shopify.ts` |
| RAG Pipeline | Vector search + reranking + chat | `web/lib/rag/query.ts`, `web/app/api/rag/chat/route.ts` |

## Pattern Overview

**Overall:** Next.js 16 App Router with route groups, Server Components by default, Client Components only where interactivity is required.

**Key Characteristics:**
- Route groups via `(main)` directory for shared layout
- Server Components fetch Shopify data directly (no client-side fetching for product data)
- RAG chat uses streaming response via Vercel AI SDK
- Persistent caching via Next.js `'use cache'` directive with `cacheLife` and `cacheTag`
- Shopify metafields resolved via Admin API (not available in Storefront API)

## Layers

**Pages (`web/app/`):**
- Purpose: Route pages and API endpoints following Next.js App Router conventions
- Location: `web/app/`
- Contains: `page.tsx`, `layout.tsx`, `loading.tsx`, API routes, Server Actions
- Depends on: Components, lib utilities
- Used by: Next.js router

**Components (`web/components/`):**
- Purpose: Reusable UI components split into shadcn/ui primitives (`ui/`) and application-specific components
- Location: `web/components/`
- Contains: `ui/` (shadcn-style primitives), `ai-elements/` (AI chat UI), feature components
- Depends on: Tailwind CSS, design tokens in globals.css
- Used by: Pages via direct imports

**Lib (`web/lib/`):**
- Purpose: Data layer - Shopify API client, RAG pipeline, contexts, typed data, utilities
- Location: `web/lib/`
- Contains: `shopify.ts` (API client + caching), `rag/` (vector search), `cart-context.tsx`, `types.ts`, `data.ts`
- Depends on: External APIs (Shopify, Qdrant, Upstash)
- Used by: Server Components, API routes, Server Actions

**Hooks (`web/hooks/`):**
- Purpose: Client-side state logic (debounce, scroll tracking, text measurement)
- Location: `web/hooks/`
- Contains: `use-mobile.ts`, `use-debounce.ts`, `use-text-measurement.ts`, etc.
- Depends on: React hooks
- Used by: Client Components

**API Routes (`web/app/api/`):**
- Purpose: HTTP endpoints for client-side requests (RAG chat, webhooks, search)
- Location: `web/app/api/`
- Contains: `rag/chat/route.ts`, `rag/process-queue/route.ts`, `search/route.ts`, `shopify-webhook/route.ts`
- Depends on: Lib services
- Used by: Client-side fetch calls, external webhooks

**Server Actions (`web/app/actions/`):**
- Purpose: Form submissions and mutations (cart updates, newsletter signup)
- Location: `web/app/actions/`
- Contains: `cart.ts`, `subscribe.ts`
- Depends on: Lib services
- Used by: Forms with `action=` prop

## Data Flow

### Primary Request Path (Product Page)

1. **Request** enters via Next.js router (`/products/[handle]/page.tsx`)
2. **Data Fetch** - Server Component calls `fetchProduct(handle)` from `lib/shopify.ts` (`web/app/(main)/products/[handle]/page.tsx`)
3. **Cache Check** - `'use cache'` directive checks `cacheTag('products', 'product-{handle}')` (`web/lib/shopify.ts:610`)
4. **Shopify Storefront API** - Returns raw product data with metafield GIDs (`web/lib/shopify.ts:615`)
5. **Metafield Resolution** - `resolveVehicleMetafields()` fetches Admin API to resolve metaobject references (`web/lib/shopify.ts:178`)
6. **Render** - Server Component renders product data + passes to client islands

### RAG Chat Request Path

1. **POST /api/rag/chat** - Request with messages + optional images (`web/app/api/rag/chat/route.ts`)
2. **Rate Limit** - Check via Upstash Redis limiter (`web/app/api/rag/chat/route.ts:35`)
3. **Vision** - If images present, `describeImagesForRetrieval()` generates text description (`web/app/api/rag/chat/route.ts:77`)
4. **Vector Search** - `findRelevantProducts()` queries Qdrant with dense + sparse hybrid search (`web/lib/rag/query.ts:19`)
5. **Rerank** - `rerankCandidates()` uses Cohere rerank-v3.5 to refine results (`web/lib/rag/query.ts:66`)
6. **Stream Response** - AI SDK `streamText()` generates response with product citations (`web/app/api/rag/chat/route.ts:149`)
7. **Response** - SSE stream with `onError` fallback and metadata (citations, suggestions)

### Shopify Webhook Path

1. **External Request** - Shopify sends webhook to `/api/shopify-webhook`
2. **Verify** - HMAC signature verification (implementation in route.ts)
3. **Process** - Handle inventory updates, orders, etc. (route handler logic)
4. **Response** - 200 OK or error

**State Management:**
- **Server State**: `'use cache'` with `cacheLife`/`cacheTag` for Shopify data, product catalog
- **Client State**: React Context for Cart (`CartProvider`) and Wishlist (`WishlistProvider`)
- **Vector Index**: Qdrant collection updated via ingest script (`scripts/ingest.ts`)

## Key Abstractions

**ShopifyStorefrontClient:**
- Purpose: GraphQL client for Shopify Storefront API (2026-04)
- Examples: `web/lib/shopify.ts`
- Pattern: Singleton via `getClient()`, returns typed responses

**RAGRetrievalResult:**
- Purpose: Vector search result with product metadata + relevance score
- Examples: `web/lib/rag/types.ts:32`
- Pattern: `{ metadata: ProductChunkMetadata, score: number }`

**Server Actions:**
- Purpose: Type-safe mutations callable from forms
- Examples: `web/app/actions/cart.ts`
- Pattern: `async function action(formData: FormData)` with Zod validation

## Entry Points

**Root Layout:**
- Location: `web/app/layout.tsx`
- Triggers: Every page request
- Responsibilities: Font loading (Bebas Neue, Barlow Semi Condensed, Inter), providers (Cart, Wishlist), Vercel Analytics/Speed Insights, ChatWidget

**(main) Layout:**
- Location: `web/app/(main)/layout.tsx`
- Triggers: All public pages under `/`
- Responsibilities: SiteHeader, FooterContent

**RAG Chat API:**
- Location: `web/app/api/rag/chat/route.ts`
- Triggers: Client-side AI chat messages
- Responsibilities: Rate limiting, vision description, retrieval, streaming response

## Architectural Constraints

- **Threading:** Single-threaded Node.js event loop; CPU-intensive RAG operations (embedding, reranking) run in-process
- **Global state:** Module-level Shopify client singleton (`getClient()` in `lib/shopify.ts`), Qdrant client singleton, rate limiter instances
- **Circular imports:** None detected; clear dependency direction: pages -> lib -> external APIs
- **Cache poisoning risk:** `'use cache'` functions throw on API failure (never return null/[]) per CLAUDE.md rules

## Anti-Patterns

### Storing empty failure states in persistent cache

**What happens:** Functions using `'use cache'` return `null` or `[]` when Shopify API fails
**Why it's wrong:** Next.js `'use cache'` stores whatever the function returns, including failure states. Subsequent requests serve stale `null`/`[]` until TTL expires.
**Do this instead:** Throw on API failure; callers use `.catch(() => null)` for graceful degradation. Example: `fetchCollections()` throws `"Failed to fetch collections"` (`web/lib/shopify.ts:540`) instead of returning `[]`.

### Combining `'use cache'` with React `cache()`

**What happens:** Both caching systems applied to the same function
**Why it's wrong:** `'use cache'` = persistent cross-request cache (Next.js); `cache()` = within-render deduplication (React). They are separate systems; combining them can break in production builds.
**Do this instead:** Use `'use cache'` alone for server-side persistent caching, or `cache()` alone for client-side deduplication. Example: `resolveVehicleMetafields()` uses `'use cache'` only (`web/lib/shopify.ts:179`).

## Error Handling

**Strategy:** Fail-fast with typed errors; graceful degradation via optional chaining + catch handlers

**Patterns:**
- `catch(() => null)` for optional data that should not block rendering
- Throw with descriptive messages for critical failures (e.g., `throw new Error('Product not found: ${handle}')`)
- Rate limit errors return `429` with `Retry-After` header
- GraphQL errors logged to console, partial data returned where possible

## Cross-Cutting Concerns

**Logging:** `console.error()` for errors (RAG pipeline, API failures); no structured logging library
**Validation:** Zod schemas for API request bodies and Server Action form data
**Authentication:** Shopify webhooks use HMAC signature verification; no user auth system in this codebase
**Caching:** Next.js `'use cache'` with `cacheLife('minutes|hours|days')` and `cacheTag()` for fine-grained invalidation

---

*Architecture analysis: 2026-05-25*
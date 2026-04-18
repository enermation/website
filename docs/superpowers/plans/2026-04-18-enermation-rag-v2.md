# Enermation RAG — Implementation Plan v2

**Spec:** `docs/superpowers/specs/2026-04-18-enermation-rag.md`
**Supersedes:** `docs/superpowers/plans/2026-04-18-enermation-rag-implementation.md` (v1 — archived, not deleted).

This plan is the authoritative implementation order for Phase 1 (widget + `/assistant` + admin reindex). Phase 2 items from the spec (`/search` AI tab, Shopify webhook, chat persistence) are **out of scope** here.

---

## Pre-flight

Before starting Task 1:

1. Re-read the spec end-to-end.
2. Read `web/CLAUDE.md`, `web/AGENTS.md`, `web/lib/shopify.ts`, `web/lib/types.ts`, `web/lib/queries.ts`, `web/app/globals.css`.
3. Confirm account provisioning is the user's job — this plan assumes the user has Voyage, Upstash Vector, Upstash Redis, and Anthropic accounts and will paste keys into the local env file at Task 1 finish.

## Execution protocol

- Work one task at a time. After each task: run `bunx tsc --noEmit` and `bun run lint`; only commit when both pass.
- Commit message convention: `feat(rag): <task summary>` / `chore(rag): ...` / `fix(rag): ...`. No attribution line, no emojis.
- If a step requires a decision the spec does not cover, stop and ask.

---

## File manifest

New files (Phase 1 only):

- `web/lib/rag/types.ts`
- `web/lib/rag/constants.ts`
- `web/lib/rag/clients.ts`
- `web/lib/rag/chunk.ts`
- `web/lib/rag/embed.ts`
- `web/lib/rag/rerank.ts`
- `web/lib/rag/query.ts`
- `web/lib/rag/indexer.ts`
- `web/lib/rag/prompt.ts`
- `web/lib/rag/ratelimit.ts`
- `web/app/api/rag/chat/route.ts`
- `web/app/api/rag/reindex/route.ts`
- `web/app/assistant/page.tsx`
- `web/components/rag/chat-widget.tsx`
- `web/components/rag/product-citation.tsx`
- `web/components/rag/suggested-questions.tsx`

Modified files:

- `web/package.json` (new deps)
- `web/app/globals.css` (widget sizing tokens + utility)
- `web/lib/queries.ts` (paginated query for indexing)
- `web/app/layout.tsx` (mount widget)
- Local env file (user fills keys — Claude only edits the example template)
- Example env template (document keys)

---

## Task 1 — Dependencies, env scaffolding, design tokens

**Goal:** repo compiles with new deps; env template documents every required key; new Tailwind tokens exist.

### Steps

1. Install runtime deps via Bun:

   ```bash
   bun add @upstash/vector @upstash/ratelimit @upstash/redis voyageai @ai-sdk/anthropic @ai-sdk/react
   ```

   No dev deps needed — types ship with the SDKs.

2. Update the example env template (NOT the real local env — user fills that) with the keys in the table below. Each entry: one `KEY=` line plus a one-line comment above it.

   | Variable | Purpose | Required in |
   |---|---|---|
   | `VOYAGE_API_KEY` | Embeddings + reranker | server only |
   | `UPSTASH_VECTOR_REST_URL` | Vector DB endpoint | server only |
   | `UPSTASH_VECTOR_REST_TOKEN` | Vector DB token | server only |
   | `UPSTASH_REDIS_REST_URL` | Rate-limit backing store | server only |
   | `UPSTASH_REDIS_REST_TOKEN` | Redis token | server only |
   | `ANTHROPIC_API_KEY` | Claude Haiku 4.5 | server only |
   | `RAG_ADMIN_SECRET` | Reindex route bearer token | server only |

3. Add widget sizing tokens to `web/app/globals.css`.

   In `@theme inline` block, add:

   ```css
   --size-widget-h: 32rem;
   --size-widget-w: 24rem;
   ```

   In `@layer utilities`, add:

   ```css
   .size-widget {
     width: var(--size-widget-w);
     height: var(--size-widget-h);
   }
   ```

   Rationale: widget is a fixed panel; using a utility keeps us off arbitrary Tailwind values (`h-[32rem]`) which are forbidden by project conventions.

### Acceptance

- `bun install` completes clean; lockfile updated.
- `bunx tsc --noEmit` still green.
- Example env template has all seven keys with comments.
- `globals.css` has the two new tokens and the `.size-widget` utility; no other section changed.

### Commit

`chore(rag): add deps, env template, and widget sizing tokens`

---

## Task 2 — RAG types, constants, and clients

**Goal:** one place each for public types, tunable constants, and typed SDK clients.

### Files

**`web/lib/rag/types.ts`** — exports:

- `ProductChunkMetadata` — mirrors Upstash `Metadata` generic. Fields: `productId: string` (Shopify GID), `handle: string`, `title: string`, `priceAmount: string`, `priceCurrency: string`, `collectionHandles: string[]`, `vendor: string | null`, `make: string | null`, `model: string | null`, `year: string | null`, `mileage: string | null`, `colour: string | null`, `fuelType: string | null`, `transmission: string | null`, `originCountry: string | null`, `condition: string | null`, `engine: string | null`, `imageUrl: string | null`, `url: string` (absolute path `/products/<handle>`), `textSnippet: string`.
- `RagRetrievalResult` — `{ metadata: ProductChunkMetadata; score: number }`.
- `RagChatMessageMetadata` — `{ citations?: string[] /* handles */ }` attached to assistant messages via AI SDK `messageMetadata`.

**`web/lib/rag/constants.ts`** — exports:

- `EMBED_MODEL = 'voyage-3-large'`
- `EMBED_DIMENSIONS = 1024`
- `RERANK_MODEL = 'rerank-2.5'`
- `CHAT_MODEL_ID = 'claude-haiku-4-5'`
- `TOP_K_RETRIEVE = 24`
- `TOP_K_RERANK = 6`
- `INDEX_BATCH_SIZE = 64` (Voyage embed batch)
- `UPSTASH_UPSERT_BATCH = 100`
- `RATELIMIT_WINDOW = '60 s'`
- `RATELIMIT_REQUESTS = 10`
- `SYSTEM_PROMPT_VERSION = 'v1'`

**`web/lib/rag/clients.ts`** — named exports:

- `getVoyageClient()` — lazy singleton via `new VoyageAIClient({ apiKey })` (import `VoyageAIClient` from `voyageai`). Throw if key missing.
- `getVectorIndex()` — lazy singleton `new Index<ProductChunkMetadata>({ url, token })` from `@upstash/vector`.
- `getAnthropic()` — returns `anthropic(CHAT_MODEL_ID)` from `@ai-sdk/anthropic`.
- `getRedis()` — lazy `Redis.fromEnv()` from `@upstash/redis`.

Use the existing `getRequiredEnv()` helper pattern in `web/lib/shopify.ts` — do not duplicate it; import it from there.

### Acceptance

- `bunx tsc --noEmit` green.
- Importing any client without env vars throws a clear message at call time, not at module load.

### Commit

`feat(rag): add shared types, tunable constants, and lazy SDK clients`

---

## Task 3 — Chunking + embedding helpers

**Goal:** one function turns a Shopify product into `{ id, text, metadata }`; two functions embed documents / queries.

### Files

**`web/lib/rag/chunk.ts`** — exports `chunkFromShopifyProduct(product: ShopifyProduct, collectionHandles: string[]): { id: string; text: string; metadata: ProductChunkMetadata }`.

Embedding text template (single chunk per product for Phase 1):

```
Title: <title>
Vendor: <vendor or "—">
Collections: <comma-joined handles or "—">
Make: <make or "—"> | Model: <model or "—"> | Year: <year or "—">
Engine: <engine or "—"> | Fuel: <fuelType or "—"> | Transmission: <transmission or "—">
Mileage: <mileage or "—"> | Colour: <colour or "—"> | Condition: <condition or "—">
Origin: <originCountry or "—">
Description: <first 1500 chars of description>
```

Metadata `textSnippet` = first 240 chars of description (for grounded prompt later).
`id` = `product.handle` (Upstash accepts strings; no hashing needed — resolves a v1 plan bug).
`url` = `/products/${product.handle}` (relative — widget/page render absolute via `<Link>`).

**`web/lib/rag/embed.ts`** — exports:

- `embedDocuments(texts: string[]): Promise<number[][]>` — chunks input into `INDEX_BATCH_SIZE` groups; calls `client.embed({ input, model: EMBED_MODEL, inputType: 'document' })` per batch; flattens and returns. Throws on any batch failure (no partial indexing).
- `embedQuery(text: string): Promise<number[]>` — single call with `inputType: 'query'`.

Both run server-only; add `import 'server-only'` at top of file.

### Acceptance

- `chunkFromShopifyProduct` pure and deterministic; does not call network.
- `embed*` returns arrays of length 1024; throws with a recognizable message when rate-limited.
- No `any` types.

### Commit

`feat(rag): add product chunking and Voyage embedding helpers`

---

## Task 4 — Shopify query extension + indexer

**Goal:** one CLI-free function rebuilds the Upstash index from Shopify. Admin route (Task 6) calls it.

### Files

**`web/lib/queries.ts`** — add `GET_ALL_PRODUCTS_FOR_INDEX` using Storefront pagination: `products(first: 100, after: $cursor)` with `pageInfo { hasNextPage, endCursor }`. Each node selects: `id, handle, title, description, vendor, featuredImage { url, altText }, priceRange { minVariantPrice { amount currencyCode } }, collections(first: 20) { nodes { handle } }`, plus the existing `...PRODUCT_METAFIELDS` fragment.

**`web/lib/rag/indexer.ts`** — exports `reindexAll(): Promise<{ upserted: number; pages: number }>`.

Flow:

1. Loop Shopify pagination until `hasNextPage === false`; accumulate products in memory (catalog is small enough per user description to hold a few thousand records).
2. For each product, build chunk via `chunkFromShopifyProduct(p, p.collections.nodes.map(c => c.handle))`.
3. Batch embed texts into vectors.
4. Batch upsert to Upstash Vector in groups of `UPSTASH_UPSERT_BATCH`: `index.upsert(items.map(i => ({ id: i.id, vector: i.vector, metadata: i.metadata })))`.
5. Return `{ upserted, pages }`.

Before step 4, call `index.reset()` **only if** the caller passed `{ fresh: true }` — default behavior is upsert-over-existing so deletes on reindex require explicit opt-in. (Phase 2 webhook will use deltas; Phase 1 admin supports both.)

Add `import 'server-only'`.

### Acceptance

- Calling `reindexAll()` against a populated store returns counts > 0; index reflects changes visible by subsequent query.
- `bunx tsc --noEmit` green; no `any`.

### Commit

`feat(rag): add paginated indexer and Storefront query extension`

---

## Task 5 — Rerank + query pipeline

**Goal:** `findRelevantProducts(query)` returns top-6 reranked matches.

### Files

**`web/lib/rag/rerank.ts`** — exports `rerankCandidates(query: string, candidates: RagRetrievalResult[]): Promise<RagRetrievalResult[]>`.

Implementation:

1. If `candidates.length <= TOP_K_RERANK`, return candidates sorted by `score` desc.
2. Call `client.rerank({ query, documents: candidates.map(c => c.metadata.textSnippet + ' ' + c.metadata.title), model: RERANK_MODEL, topK: TOP_K_RERANK })` via the Voyage SDK.
3. Map rerank `results[i].index` back to candidates; replace `score` with the rerank relevance score; return top-K.

**`web/lib/rag/query.ts`** — exports `findRelevantProducts(query: string): Promise<RagRetrievalResult[]>`.

Flow: `embedQuery(query)` → `index.query({ vector, topK: TOP_K_RETRIEVE, includeMetadata: true })` → map to `RagRetrievalResult` → `rerankCandidates(...)`.

Both files `server-only`.

### Acceptance

- Manual sanity check (temporary `tmp-test.ts`, deleted before commit): given a real query like `"used Toyota with low mileage"`, returns 6 results whose titles and metadata look relevant.
- Empty-index case returns `[]`, not a throw.

### Commit

`feat(rag): add retrieve-and-rerank query pipeline`

---

## Task 6 — Admin reindex route

**Goal:** `POST /api/rag/reindex` (bearer `RAG_ADMIN_SECRET`) triggers `reindexAll`.

### File

**`web/app/api/rag/reindex/route.ts`** — POST only. Header check `authorization === \`Bearer ${process.env.RAG_ADMIN_SECRET}\``; 401 otherwise. Optional JSON body `{ fresh?: boolean }`. On success, returns `{ ok: true, upserted, pages }`. On failure, return 500 with `{ ok: false, error: string }`. No caching; force-dynamic via `export const dynamic = 'force-dynamic'`.

### Acceptance

- `curl -X POST -H 'Authorization: Bearer ...' http://localhost:3000/api/rag/reindex` returns counts.
- Missing or wrong bearer returns 401.
- Hitting the route without seeded env returns 500 with a clean message (not stack trace in body).

### Commit

`feat(rag): add admin reindex route`

---

## Task 7 — Rate-limited streaming chat route

**Goal:** `POST /api/rag/chat` streams Claude responses grounded on Upstash results.

### Files

**`web/lib/rag/ratelimit.ts`** — exports `getChatLimiter()` — lazy `new Ratelimit({ redis: getRedis(), limiter: Ratelimit.slidingWindow(RATELIMIT_REQUESTS, RATELIMIT_WINDOW), analytics: true, prefix: 'rag:chat' })`.

**`web/lib/rag/prompt.ts`** — exports `buildGroundedSystemPrompt(products: RagRetrievalResult[]): string`.

Template:

```
You are Enermation's dealership assistant. Answer only from the products listed below. If none match, say so and suggest the closest category.

Rules:
- Cite products by handle in square brackets, e.g. [toyota-hilux-2019].
- Never invent prices, mileage, or VIN-like specifics. If a field is "—", say it is not listed.
- Reply in the user's language.

Available products:
<for each product p>
[<p.metadata.handle>] <p.metadata.title> — <p.metadata.priceAmount> <p.metadata.priceCurrency>
  make=<make> model=<model> year=<year> mileage=<mileage> fuel=<fuelType> transmission=<transmission>
  collections=<collectionHandles joined>
  snippet: <textSnippet>
</for>
```

Include `SYSTEM_PROMPT_VERSION` as a trailing comment line so prompt drift is traceable.

**`web/app/api/rag/chat/route.ts`** — runtime `nodejs` (default), `export const dynamic = 'force-dynamic'`, `maxDuration = 30`.

Flow:

1. Parse `{ messages }: { messages: UIMessage[] }` from request JSON.
2. Derive `ip` from `request.headers.get('x-forwarded-for')?.split(',')[0] ?? 'anon'`.
3. `const { success, limit, remaining, reset } = await getChatLimiter().limit(ip)`. If `!success`, return 429 with JSON `{ error: 'rate_limited', retryAfter: reset }` and `Retry-After` header.
4. Extract the last user message text: find last `m.role === 'user'`, join `m.parts.filter(p => p.type === 'text').map(p => p.text)`. If empty → 400.
5. `const products = await findRelevantProducts(userText)`.
6. `const system = buildGroundedSystemPrompt(products)`.
7. `const result = streamText({ model: getAnthropic(), system, messages: convertToModelMessages(messages), temperature: 0.2 })`.
8. `return result.toUIMessageStreamResponse({ messageMetadata: ({ part }) => part.type === 'finish' ? { citations: products.map(p => p.metadata.handle) } as RagChatMessageMetadata : undefined })`.

All helpers imported from `ai` (v6) and `@ai-sdk/anthropic`.

### Acceptance

- `curl -N` with a UIMessage body streams tokens; final assistant message metadata carries a `citations` array.
- 11th request in a minute returns 429.
- Missing env returns 500 with a clean message.

### Commit

`feat(rag): add rate-limited grounded chat streaming route`

---

## Task 8 — AI Elements scaffolding + chat components

**Goal:** reusable chat UI pieces built on shadcn/ui + AI Elements, token-compliant.

### Steps

1. Run `bunx ai-elements@latest add conversation message response prompt-input` — installs components under `web/components/ai-elements/` per AI SDK docs.
2. **`web/components/rag/product-citation.tsx`** — client component, takes `handle: string, products: RagRetrievalResult[]`. Renders an inline `<Link>` to `/products/<handle>` styled with `text-brand-green underline-offset-2 hover:underline text-13`. Falls back to raw handle if not in list.
3. **`web/components/rag/suggested-questions.tsx`** — client component, takes `onPick: (q: string) => void`. Hardcode 4 starter prompts in `web/lib/rag/suggested-questions.ts` (data file, per project rule). Render as a row of `Button` (variant `outline`, size `sm`) using existing shadcn button.

Both rendered using tokens only (no arbitrary values).

### Acceptance

- `web/components/ai-elements/` exists and exports the four primitives.
- No arbitrary Tailwind values in the two new components.
- `bunx tsc --noEmit` green.

### Commit

`feat(rag): scaffold AI Elements and custom chat subcomponents`

---

## Task 9 — Chat widget + mount in layout

**Goal:** floating assistant on every page.

### File

**`web/components/rag/chat-widget.tsx`** — `"use client"`. Uses `useChat` from `@ai-sdk/react` with `new DefaultChatTransport({ api: '/api/rag/chat' })`.

Structure (all tokens):

- A fixed-position wrapper: `fixed bottom-4 right-4 z-50`.
- Collapsed state: a round `Button` (size `icon`, variant `default`) with `mdiChat` icon.
- Expanded state: a `Card` with `size-widget` utility, `flex flex-col`, `shadow-xl`, `border-gray-90`, `bg-background`.
  - Header: title "Enermation Assistant" (`text-13 font-heading`), close button (`mdiClose`).
  - Body: `Conversation` primitive wrapping `Message` items. Assistant messages use `Response`; when final `citations` metadata is present, render `ProductCitation` for each handle.
  - Empty state: `SuggestedQuestions` calling `sendMessage({ role: 'user', parts: [{type: 'text', text: q}] })`.
  - Footer: `PromptInput` with submit handler that calls `sendMessage(...)`.

Error handling: if `status === 'error'`, show a muted `text-13 text-muted-foreground` line "Something went wrong. Try again." and a retry button calling `regenerate()`.

### Mount

Update `web/app/layout.tsx`:

- `import dynamic from 'next/dynamic'`
- `const ChatWidget = dynamic(() => import('@/components/rag/chat-widget').then(m => m.ChatWidget), { ssr: false })`
- Render `<ChatWidget />` as the last sibling inside the existing `<CartProvider>…</CartProvider>` block, after `<SiteFooter />`.

Rationale for `ssr: false`: widget state is purely client; avoids hydration cost on server-rendered pages.

### Acceptance

- Collapsed button visible bottom-right on every route.
- Opening and sending a message streams a response.
- Clicking a suggested question sends it.
- Tabs through focusable controls in logical order; Esc closes the widget.
- No arbitrary Tailwind values anywhere.

### Commit

`feat(rag): add floating chat widget mounted site-wide`

---

## Task 10 — `/assistant` page

**Goal:** full-page chat at `/assistant` that reuses the widget's logic.

### File

**`web/app/assistant/page.tsx`** — server-component shell with a dedicated `<AssistantClient />` inside. The client piece shares the widget's `useChat` setup but renders inside a wider `Card` with `max-w-site mx-auto` and a height using standard Tailwind scale (`h-screen` + `py-section` acceptable; confirm before reaching for arbitrary values).

Add `export const metadata = { title: 'Assistant — Enermation', description: '...' }` on the server shell.

Extract the shared chat machinery into `web/components/rag/chat-panel.tsx` so both `ChatWidget` and the `/assistant` page render the same `Conversation`/`PromptInput` layout with different shells.

### Acceptance

- Navigating to `/assistant` shows a full-page chat identical in behavior to the widget.
- No duplicate `useChat` logic between widget and page (shared via `ChatPanel`).

### Commit

`feat(rag): add /assistant full-page chat using shared chat panel`

---

## Task 11 — Final QA

1. Run `bunx tsc --noEmit && bun run lint && bun run format`.
2. Manual smoke: reindex locally, open `/`, use widget ("show me Toyotas"), click a citation, reach product page. Open `/assistant`, same.
3. Verify no Tailwind arbitrary values: `rg '\[[0-9]' web/components/rag web/app/assistant web/app/api/rag` should return nothing meaningful.
4. Verify no inline styles in new files: `rg 'style=\{\{' web/components/rag web/app/assistant` should return nothing.
5. Verify rate limit: send 11 messages in a minute from the widget; expect an error on the 11th and a surfaced toast/line.
6. Read the diff against `main` one file at a time and ask: "would a staff engineer approve?" per global CLAUDE.md.
7. Update `tasks/todo.md` with a review section.

### Commit

No code commit — this task is QA only. If anything is fixed, use a `fix(rag): ...` commit.

---

## Spec → task traceability

| Spec section | Task(s) |
|---|---|
| §4 Architecture (retrieve-rerank-generate) | 3, 5, 7 |
| §5 Data model (ProductChunkMetadata) | 2, 3, 4 |
| §6.1 Indexing pipeline | 3, 4, 6 |
| §6.2 Query pipeline | 3, 5, 7 |
| §7.1 Chat widget | 8, 9 |
| §7.2 /assistant page | 8, 10 |
| §7.3 Admin reindex | 6 |
| §8 Infra (env, rate limit) | 1, 2, 7 |
| §9 Constraints (tokens, types) | 1, all |
| §10 New design tokens | 1 |

## Phase 2 (explicitly NOT in this plan)

- `/search` AI tab with assistant panel alongside keyword results.
- Shopify `products/update` webhook with signature verification → delta reindex.
- Chat persistence to a DB (session history, shareable links).
- Multi-tenant admin UI for the reindex route.

## Open questions (must answer before Task 7)

1. **System prompt language policy** — should the assistant always reply in English, or mirror the user's language? Spec defaults to mirror; confirm.
2. **Citation format** — `[handle]` visible to user inline, or rewritten to product name on render? Plan currently rewrites to product name via `ProductCitation`.
3. **Error surface** — quiet line vs. toast for rate limit? Plan uses a quiet inline line in the widget.

If any answer changes, update the spec first, then the affected task here, then implement.

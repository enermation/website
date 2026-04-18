# Enermation RAG Assistant — Spec

**Status:** Draft v2
**Date:** 2026-04-19 (rev)
**Owner:** @imossaidqadri

**v2 changes vs v1:**
- Chat model is provider-agnostic (env-configurable: Anthropic **or** Groq). No code change to switch.
- Image input added to Phase 1 via describe-then-search (vision model → text query → existing text-embedding pipeline). **No image embeddings; no re-index.**
- Web-search fallback ("if we don't stock it, tell the user what they have") deferred to Phase 2.

---

## 1. Goal

Give Enermation customers a natural-language assistant that retrieves relevant products from the Shopify catalog (vehicles, energy infrastructure, salvage parts, etc.) and answers grounded questions in real time. Two entry points ship in MVP:

- **Floating chat widget** — available site-wide, anchored bottom-right.
- **`/assistant` page** — dedicated full-width chat experience.

## 2. Non-Goals (MVP)

- **`/search` AI tab** — the existing server-rendered search page stays untouched; integration moves to Phase 2.
- **Shopify webhook live-sync** — inventory is refreshed via an admin-triggered reindex for MVP. Webhooks are Phase 2.
- **Chat history persistence** — conversations are in-memory React state and are lost on reload. No sessions, no auth, no KV.
- **Multi-turn tool-calling / agentic flows** — single-turn RAG only. No function calls to Shopify from the LLM.
- **Multimodal embeddings** — products are embedded by text only (`voyage-3-large`, 1024-dim). Image input is supported (see §6.3), but images are *described into text* before retrieval. No `voyage-multimodal-3`, no product-image embedding, no re-index.
- **Web-search fallback** — if retrieval returns nothing, the assistant says so. It does **not** reach out to the internet to find alternatives in Phase 1 (Phase 2 via Claude `web_search` tool or Groq + Tavily equivalent).

## 3. User Stories

1. A customer lands on the home page, opens the widget, asks "Do you have any low-mileage AMG coupes under £150k?" — gets a grounded answer naming 2–3 matching cars with links.
2. A customer visits `/assistant`, asks a broader question like "What's in your salvage parts inventory?" — gets a summary plus matching product cards.
3. A customer asks about something the store doesn't stock — the assistant says so rather than inventing products.
4. A customer uploads a photo of a spare part (e.g. a brake shoe) with or without a text question — the assistant identifies the part, answers any question, and if the catalog has a match, links to it.
5. An admin POSTs to `/api/rag/reindex` with a bearer token — the Upstash Vector index rebuilds from the current Shopify catalog.

## 4. Architecture

```
┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐
│  Widget / /assistant │  │   /api/rag/chat      │  │  Upstash Ratelimit   │
│  (client, useChat,   │─▶│   (route handler)    │─▶│  (10 req/min/IP)     │
│   text + image parts)│  └──────────┬───────────┘  └──────────────────────┘
└──────────────────────┘             │
                                     ▼
                      ┌────────────────────────────┐
                      │ image parts present?       │
                      │ yes → vision describe step │
                      │ no  → pass-through         │
                      └──────────────┬─────────────┘
                                     ▼
                  ┌──────────────────┼─────────────────┐
                  ▼                                    ▼
         ┌─────────────────┐                   ┌─────────────────┐
         │  Voyage embed   │                   │  streamText     │
         │  (query vector) │                   │  @ai-sdk/<prov> │
         └────────┬────────┘                   │  env-configured │
                  ▼                            └────────▲────────┘
         ┌─────────────────┐                            │
         │  Upstash Vector │  top-K candidates          │
         │  query (topK=25)│───────┐                    │
         └─────────────────┘       ▼                    │
                           ┌───────────────┐            │
                           │ Voyage rerank │  top-6 ctx │
                           │  (rerank-2.5) │────────────┘
                           └───────────────┘
```

`<prov>` is `anthropic` or `groq`, chosen at runtime from env. Both expose a multimodal model (Claude Haiku 4.5 / Llama 4 Scout 17B-16e) — the **same client also does the vision-describe step**, so we don't pull in a second model or provider.

### Ingestion

```
Admin token ──▶ /api/rag/reindex ──▶ Shopify Storefront API
                                        (GET_ALL_PRODUCTS + collections)
                                          │
                                          ▼
                            ┌──────────────────────────┐
                            │ chunkFromShopifyProduct  │
                            └──────────────┬───────────┘
                                           ▼
                            ┌──────────────────────────┐
                            │ Voyage embed (batch 128) │
                            └──────────────┬───────────┘
                                           ▼
                            ┌──────────────────────────┐
                            │ Upstash Vector upsert    │
                            │ (id = product.handle)    │
                            └──────────────────────────┘
```

## 5. Data Model

### Classification rule

**Category = Shopify collection handle.** A product can belong to multiple collections; the metadata stores the full list so filters can target any of them. No `product_type` heuristic, no tag parsing.

### Chunk shape

One chunk per product. No multi-chunk splitting — the catalog is small enough and product descriptions are short enough that a single ~500-token chunk covers the product fully.

```ts
type ProductChunkMetadata = {
  handle: string              // also the vector id
  title: string
  vendor: string
  url: string                 // /products/{handle}
  image_url: string | null
  available: boolean
  price_amount: number        // minVariantPrice.amount as float
  price_currency: string      // e.g. 'GBP'
  collections: string[]       // collection handles
  description_preview: string // first 280 chars, stripped
  // Vehicle metafields (null if absent)
  make: string | null
  model: string | null
  year: string | null
  mileage: number | null
  colour: string | null
  fuel_type: string | null
  transmission: string | null
  condition: string | null
  engine: string | null
}
```

### Embedding text

Concatenation of human-readable fields in priority order. Example for a vehicle:

```
2022 Ferrari SF90 Stradale. Vendor: Ferrari. Personal Vehicles. Red exterior, Tan interior.
3,500 miles. 4.0L V8 Twin-Turbo Hybrid. Petrol/Electric. 7-speed dual-clutch. Excellent condition.
£380,000 GBP. Available. {description first 280 chars}
```

For non-vehicles, vehicle lines are omitted; the title, vendor, collection names, price, and description carry the weight.

### Vector id

`product.handle` (string). Handles are unique in Shopify and URL-safe. No GID hashing needed — Upstash accepts arbitrary strings.

## 6. Pipelines

### Query pipeline

1. Receive `{ messages: UIMessage[] }` — last user message may contain `text` parts and/or `file` parts (images: `image/jpeg`, `image/png`, `image/webp`; cap 4 MB each, 2 per message).
2. Rate-limit check via `@upstash/ratelimit` by IP (sliding window, 10/min).
3. **If the last user message has any image parts:** call the chat model once in "describe mode" — pass image parts + a constrained prompt ("Describe the object: part type, material, visible codes/markings, apparent vehicle make/model, mounting style, measurements if visible. No prose; comma-separated facts.") — concatenate the returned description with any accompanying user text to form the retrieval query. Else: the retrieval query is the user text alone.
4. Embed the retrieval query with Voyage (`voyage-3-large`, `input_type: "query"`, 1024-dim).
5. Query Upstash Vector: `topK = 25`, `includeMetadata: true`.
6. Rerank candidates with Voyage (`rerank-2.5`), keep top 6.
7. Build system prompt with the 6 products inlined as `[title](url)` citations + key attributes.
8. Stream response via `streamText` with the env-configured chat model. Pass the original user messages *with* image parts intact so the model can reference the picture when answering ("the break shoe you uploaded looks like…").
9. Return `toUIMessageStreamResponse()`.

### 6.3 Image input — design notes

- **Why describe-then-search, not multimodal embeddings.** Multimodal embeddings would require re-indexing every product with its `featuredImage` and switching to `voyage-multimodal-3`. In a dealership catalog, product titles already carry the visual signal (make/model/part name), so a text description extracted from the image is sufficient for retrieval. If visual-only queries ("this thing, I don't know what it is") underperform in practice, upgrading to multimodal embeddings is a one-task swap — no spec change.
- **Why reuse the chat model for the describe step.** Both Claude Haiku 4.5 and Llama 4 Scout 17B-16e are multimodal. Using the same client for describe + answer avoids adding a vendor (Cloud Vision / SerpAPI Lens) just for OCR-like extraction.
- **Why no Google Lens.** Lens is a consumer app without an official API. The viable proxies — Cloud Vision (different capability) and SerpAPI's Lens endpoint (third-party scraper, ToS-grey, fragile) — add a vendor without solving catalog matching, which is the part that actually requires our index. The "search the whole internet" behavior is better served by a Phase 2 web-search tool wired into the same LLM.

### Indexing pipeline

1. Auth check (bearer `RAG_ADMIN_SECRET`).
2. Fetch all products via `GET_ALL_PRODUCTS` (extended to return `collections { edges { node { handle } } }`).
3. Transform each product to `ProductChunkMetadata` + embedding text.
4. Batch-embed with Voyage (`input_type: "document"`, chunks of 128).
5. Upsert to Upstash Vector.
6. Return `{ indexed, failed, durationMs }`.

## 7. UIs

### Floating widget

- Always-rendered in root layout (inside `CartProvider`, inside `Suspense`).
- Collapsed state: 56px circular button, `bg-brand-green`, `mdiRobotHappyOutline` icon, fixed `bottom-6 right-6`.
- Expanded state: card-styled panel `border border-gray-90 bg-card rounded-2xl shadow-2xl` sized `w-80 sm:w-96` × `h-[32rem]` — except **using token-equivalent classes** (see §10); height achieved via `max-h-[100dvh] md:max-h-[32rem]` replaced with a new `--size-widget-h: 32rem` token.
- Uses AI Elements `<Conversation>`, `<Message>`, `<Response>` for the message stream; custom `<ProductCitation>` renders source products below the assistant message.
- Empty state: 3 suggested questions (from `lib/assistant-data.ts`).

### `/assistant` page

- Server Component shell (metadata, `<SiteHeader/>`) wrapping a client-side `<AssistantShell/>`.
- Full-width conversation card, max-width `max-w-site`.
- Same AI Elements + `<ProductCitation>` setup as the widget, sized for desktop.

### Copy

All static strings — widget title, greeting, suggested questions, error messages, empty-state copy — live in `web/lib/assistant-data.ts` as a typed export. No strings hardcoded in JSX (per project CLAUDE.md).

## 8. Infrastructure & Dependencies

| Service            | Package                  | Role                                        |
| ------------------ | ------------------------ | ------------------------------------------- |
| Upstash Vector     | `@upstash/vector`        | Vector storage + similarity search          |
| Upstash Ratelimit  | `@upstash/ratelimit`     | Per-IP throttle on chat endpoint            |
| Upstash Redis      | `@upstash/redis`         | Backing store for ratelimit                 |
| Voyage AI          | `voyageai`               | Embeddings (`voyage-3-large`) + reranking (`rerank-2.5`) |
| **Chat provider (choose one at install)** | `@ai-sdk/anthropic` **or** `@ai-sdk/groq` | LLM for describe + streamText. Both multimodal. |
| AI SDK React       | `@ai-sdk/react`          | `useChat` hook (client)                     |
| AI SDK core        | `ai` (^6, already present) | `streamText`, `UIMessage`, helpers       |
| AI Elements        | CLI-installed components | UI primitives for chat                      |

**Both provider packages are installed** (`@ai-sdk/anthropic` + `@ai-sdk/groq`) so swapping is a config change. `getChatModel()` in `lib/rag/clients.ts` returns the configured provider based on `CHAT_PROVIDER`:
- `anthropic` → `anthropic(CHAT_MODEL_ID)` where `CHAT_MODEL_ID` defaults to `claude-haiku-4-5`
- `groq` → `groq(CHAT_MODEL_ID)` where `CHAT_MODEL_ID` defaults to `meta-llama/llama-4-scout-17b-16e-instruct`

### Env vars (documented in the example env template; real values live in the untracked local env file)

| Variable | Purpose | Default / example |
|---|---|---|
| `VOYAGE_API_KEY` | Embeddings + rerank | — |
| `UPSTASH_VECTOR_REST_URL` | Vector DB endpoint | — |
| `UPSTASH_VECTOR_REST_TOKEN` | Vector DB token | — |
| `UPSTASH_REDIS_REST_URL` | Ratelimit backing store | — |
| `UPSTASH_REDIS_REST_TOKEN` | Redis token | — |
| `RAG_ADMIN_SECRET` | Bearer for `/api/rag/reindex` | — |
| `CHAT_PROVIDER` | `anthropic` or `groq` | `anthropic` |
| `CHAT_MODEL_ID` | Model id passed to provider | `claude-haiku-4-5` or `meta-llama/llama-4-scout-17b-16e-instruct` |
| `ANTHROPIC_API_KEY` | Required iff `CHAT_PROVIDER=anthropic` | — |
| `GROQ_API_KEY` | Required iff `CHAT_PROVIDER=groq` | — |

The example env template ships stubs for all of the above; the local env file is user-managed.

## 9. Constraints (non-negotiable)

These come from global CLAUDE.md and project CLAUDE.md. Every file produced must pass all of them.

### Code

- TypeScript strict. **No `any`** — use `unknown` + narrowing at boundaries.
- **Server Components by default.** `"use client"` only for hooks/events/browser APIs.
- Path alias `@/` for all internal imports.
- Named exports only; no default exports for components.
- Each component accepts `className`, merges via `cn()`.
- `data-slot="..."` on the root element of every custom component.

### Styling

- **No Tailwind arbitrary values** — no `h-[32rem]`, `bg-[#...]`, etc. If a value isn't in the scale, add a CSS custom property to `globals.css` and expose it via `@theme inline`.
- **No hardcoded colors** — use `bg-brand-green`, `text-brand-red`, `border-gray-90`, `text-muted-foreground`, etc.
- No inline `style={{}}` unless truly dynamic at runtime.
- Existing brand tokens: `--brand-green`, `--brand-red`, `--gray-*`, `--text-11/13/15/section/banner`, `--font-display/heading/body`, `--max-w-site`.

### Data & content

- All static copy lives in `web/lib/` as typed `.ts` files (`assistant-data.ts`).
- Components import data; they never define it.

### Icons

- Material Design Icons (`@mdi/js` + `@mdi/react`), already installed.
- Default size `size-4`; explicit `size-*` class for other sizes.

### Quality gates per task

Every task's final step runs `bunx tsc --noEmit && bun run lint` **before** `git add`. No task is "done" if either fails.

### Commit style

Conventional commits, no Claude attribution (per global CLAUDE.md).

## 10. New design tokens to add

`globals.css` adds under `@theme inline` and `:root`:

```css
@theme inline {
  --size-widget-h: 32rem;  /* Widget expanded height */
  --size-widget-w: 24rem;  /* Widget expanded width (sm:) */
}
```

All widget and assistant sizing uses these tokens via arbitrary-value-free classes like `h-(--size-widget-h)` (Tailwind v4 CSS-variable syntax) or a utility class added in `globals.css`.

## 11. Success Criteria

MVP is done when:

1. `bun run build` succeeds with no TypeScript errors.
2. `bun run lint` passes.
3. POSTing to `/api/rag/reindex` with the admin token indexes every product in Shopify and returns `{ indexed: N, failed: 0 }`.
4. Opening the widget on `/` and asking "show me a Ferrari" streams an answer within 3s TTFT and cites at least one real product URL that resolves to a 200 page.
5. Uploading an image of a known catalog part (spare part or vehicle photo) via the widget returns a grounded answer that correctly identifies the part and — if present — cites the matching product URL. The describe step adds ≤ 1.5s to TTFT.
6. Switching `CHAT_PROVIDER` from `anthropic` to `groq` (or vice-versa) in the env requires a restart only — no code change — and all success criteria (1–5) still pass.
7. `/assistant` renders the same behavior in a full-page layout.
8. Sending 11 requests from the same IP within 60s returns a 429 on the 11th.
9. Asking about a product not in inventory returns a graceful "I don't have that" answer — **not** a fabricated product.

## 12. Risks & Mitigations

| Risk                                                | Mitigation                                                                                              |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Voyage rerank adds ~400ms latency                   | Parallelize rerank with prompt prep where possible; fall back to vector-score-only ordering on timeout. |
| LLM hallucinates products not in context            | Strict system prompt: "Only reference products listed below. If none match, say so." + temperature 0.3. |
| Rate-limit false positives (shared office IP)       | Use `ip` from `x-forwarded-for`; allow override via header in dev.                                      |
| Reindex blows past serverless timeout on large catalogs | Batch embedding in groups of 128; fail fast and return partial count. Full-refresh reindex stays admin-only. |
| Widget adds global layout weight                    | Lazy-load the widget body with `next/dynamic` + `ssr: false`; only the collapsed button ships in initial HTML. |
| AI Elements API drift between versions              | Pin AI Elements version at install; record component API used in the plan's task comments.             |

## 13. Phase Split

| Area                                  | Phase 1 (this spec) | Phase 2 (follow-up) |
| ------------------------------------- | ------------------- | ------------------- |
| `/assistant` page                     | yes                 |                     |
| Floating widget                       | yes                 |                     |
| Admin reindex endpoint                | yes                 |                     |
| Image input (describe-then-search)    | yes                 |                     |
| Provider-agnostic chat (Anthropic/Groq) | yes               |                     |
| `/search` AI tab                      |                     | yes                 |
| Shopify webhook live-sync             |                     | yes                 |
| Chat history persistence              |                     | yes                 |
| Citation click-through tracking       |                     | yes                 |
| Analytics (which questions get asked) |                     | yes                 |
| Multimodal product embeddings (`voyage-multimodal-3` + image re-index) |  | yes |
| Web-search fallback when RAG misses (Claude `web_search` / Tavily for Groq) | | yes |

## 14. Open Questions

1. Does the user have Voyage / Upstash / Anthropic / Groq accounts provisioned? (User confirmed: "skip part B, I'll handle it.") → assume yes.
2. Are all shopify products to be indexed, or should `availableForSale: false` products be skipped? **Default: index everything, mark availability in metadata so the LLM can state it.**
3. Embedding model — `voyage-3-large` (1024) or `voyage-3-lite` (512)? **Default: `voyage-3-large`** for quality; swap later if cost is a concern.
4. Launch provider — Anthropic (Claude Haiku 4.5) or Groq (Llama 4 Scout 17B-16e)? Code supports both; the choice is a default env value. **Proposed default: `anthropic`** for stronger reasoning; swap to `groq` if cost/latency becomes a concern.
5. Image size + quantity caps — proposed **4 MB/image, 2 images/message**. Over cap → client-side rejection with a friendly message.

---

**Ready to plan.** Plan file: `docs/superpowers/plans/2026-04-18-enermation-rag-v2.md`.

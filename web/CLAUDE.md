@AGENTS.md

## RAG Pipeline (Embedding + Reranking)
- Embedding and reranking route **direct to Cohere** via `@ai-sdk/cohere` — NOT through Vercel AI Gateway.
  Gateway does not support rerank BYOK, causing free-credit rate limits.
- Models: `cohere.embedding('embed-v4.0')` for vectors, `cohere.reranking('rerank-v3.5')` for reranking.
- Both auto-read `COHERE_API_KEY` from env (no explicit key passing needed).
- Ingest script: `bun run scripts/ingest.ts` (embeddings bypass gateway, no OIDC needed).

---

## Caching Rules (`'use cache'` functions)

- NEVER return `null` or `[]` on API failure inside a `'use cache'` function — throw instead. Errors are not cached; null/empty values are. Callers use `.catch(() => null)` to preserve graceful degradation without poisoning the cache.
- NEVER wrap a `'use cache'` function with React's `cache()` — they are separate systems and the combination can break in production builds. Use one or the other: `'use cache'` for persistent cross-request caching, `cache()` for within-render deduplication only.

---

## Pretext — Text Measurement

This project uses **`@chenglou/pretext`** for DOM-reflow-free multiline text measurement.

### When to use
- **Dynamic height containers** where you need text dimensions before rendering (virtualized lists, chat messages, "show more" buttons)
- **AI chat interfaces** — streaming messages with unknown heights
- **Text truncation** where pixel-accurate height matters

### When NOT to use
- CSS `line-clamp-N` handles most truncation needs — use that instead
- Single-line `truncate` — CSS handles this

### Files
- `lib/text.ts` — server-side utilities: `prepareBody()`, `prepareHeading()`, `measureText()`, `truncateForMeta()`, `truncateToLines()`
- `hooks/use-text-measurement.ts` — client-side hook with caching: `useTextMeasurement()`

### Pattern
```ts
// Server (one-time cost, reuse often)
import { prepareBody, measureText, LINE_HEIGHT_BODY } from '@/lib/text'
const prepared = prepareBody(text)
const { height, lineCount } = measureText(prepared, maxWidth, LINE_HEIGHT_BODY)

// Client hook (caches PreparedText internally)
const { measure } = useTextMeasurement()
const { height, lineCount } = measure(text, 'body', containerWidth)
```

# Test Suite Implementation Plan

> For the next agent: build a complete industry-standard test suite for the Enermation Next.js workspace.
> Read `HANDOFF.md` first for context on what was planned and why.

---

## Phase 1 — Infrastructure

### 1.1 Install Dependencies

```bash
cd web
bun add -D vitest @vitejs/plugin-react vitest/globals jsdom @testing-library/react @testing-library/dom @testing-library/jest-dom
bun add -D @playwright/test
bunx playwright install chromium --with-deps
bun add -D msw
```

### 1.2 Write `vitest.config.mts`

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['tests/unit/**/*.test.{ts,tsx}', 'tests/integration/**/*.test.{ts,tsx}'],
  },
})
```

### 1.3 Write `vitest.setup.ts`

```typescript
import '@testing-library/jest-dom'
import { vi } from 'vitest'

// next/image mock
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string }) =>
    React.createElement('img', { src, alt, ...props }),
}))

// window.matchMedia — required by useIsMobile hook
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: query === '(max-width: 767px)',
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// IntersectionObserver — used by conversation scroll button
class IntersectionObserverMock {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
  takeRecords = vi.fn()
}
window.IntersectionObserver = IntersectionObserverMock as unknown as typeof IntersectionObserver
```

### 1.4 Add scripts to `package.json`

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

### 1.5 Smoke test

```bash
cd web
mkdir -p tests/unit/lib
cat > tests/unit/lib/utils.test.ts << 'EOF'
import { describe, it, expect } from 'vitest'
import { cn, formatPrice } from '@/lib/utils'

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })
})

describe('formatPrice', () => {
  it('formats amount as GBP', () => {
    expect(formatPrice('15000', 'GBP')).toBe('£15,000.00')
  })
})
EOF
bun run test:run
```

Expected: tests pass. If this fails, fix the config before proceeding.

---

## Phase 2 — Unit Tests: `lib/`

### 2.1 `lib/utils.test.ts` — HIGH PRIORITY

Pure functions — no mocks needed.

```typescript
// Test file: web/tests/unit/lib/utils.test.ts

// Covered functions:
cn()                      // clsx + twMerge — input combinations
formatPrice()             // currency formatting, string vs number amounts
computeLineTotal()       // line item total
metaValue()              // null guard
parseVehicleFromTitle()   // "Toyota Hilux SR5" → { make: "Toyota", model: "Hilux" }
parseVehicleDescription() // multi-label extraction
formatVehicleDescription() // specs vs equipment split
cleanSuggestionMarkers()  // strips SUGGESTION: trailing blocks
stripMarkdown()          // full markdown strip pipeline
```

**Key edge cases:**
- `parseVehicleFromTitle`: empty string, single word, non-Latin chars
- `parseVehicleDescription`: no labels (returns full text as `{label:'', value}`), overlapping labels
- `formatVehicleDescription`: empty input, equipment with `/` and `,` separators
- `stripMarkdown`: nested bold/italic, links, code blocks, headings, lists

### 2.2 `lib/shopify.test.ts` — CRITICAL

**Mock:** `vi.mock('@shopify/storefront-api-client')` — mock the client so tests don't hit Shopify.

```typescript
// Test file: web/tests/unit/lib/shopify.test.ts

// parseMetaobjectGIDs() — valid JSON array, null, empty [], non-string elements, invalid JSON
// metafieldLabel() — has definition.name, no definition, hyphenated key
// resolveVehicleData() — all types: list.metaobject_reference, metaobject_reference, raw value
// getClient() — throws on missing env vars
// getRequiredEnv() — returns first match, throws when none found
```

### 2.3 `lib/text.test.ts`

```typescript
// prepareBody(), measureText(), truncateToLines(), truncateForMeta()
// Uses @chenglou/pretext — mock at module level
```

### 2.4 `lib/filter-utils.test.ts`

```typescript
// buildFilterDimensions(), applyFilters()
// Build from ShopifyProduct resolvedSpecs dynamically
```

---

## Phase 3 — Unit Tests: Hooks

### 3.1 `hooks/use-mobile.test.ts`

```typescript
// Returns undefined initially (before mount)
// Returns true when viewport < 768px, false otherwise
// Adds + removes matchMedia listener on mount/unmount
// Cleanup on unmount
```

### 3.2 `hooks/use-text-measurement.test.ts`

```typescript
// Returns measure() function
// Pretext calls — mock DOM reflow
```

---

## Phase 4 — Integration Tests

### 4.1 `tests/integration/actions/cart.test.ts` — CRITICAL

**Mock:** MSW to intercept Shopify Storefront API GraphQL calls.

```typescript
// createCartAction()         — success + Shopify error path
// addCartLinesAction()       — success + failure
// updateCartLinesAction()    — success + failure
// removeCartLinesAction()    — success + failure
// getCartAction()            — null for missing cart
// createWishlistCartAction() — has wishlist attribute
// addWishlistLinesAction() / removeWishlistLinesAction() / getWishlistCartAction()
```

**Fixtures via factory functions** (not JSON) — generate from `ShopifyCart`, `ShopifyCartLine` types.

### 4.2 `tests/integration/api/rag-chat.test.ts`

**Mock:** `vi.mock('ai', ...)` to replace `streamText`, `generateObject`.

```typescript
// POST /api/rag/chat — 400 if no user message
// POST /api/rag/chat — 400 if no text or image content
// POST /api/rag/chat — 429 when rate limited
// POST /api/rag/chat — 500 if vision description fails
// POST /api/rag/chat — 500 if retrieval fails
// POST /api/rag/chat — success with text message (assert SSE stream structure)
```

### 4.3 `tests/integration/api/search.test.ts`

```typescript
// GET /api/search?q= — returns results
// GET /api/search — 400 for empty/missing query
// GET /api/search?q=none — empty array
```

---

## Phase 5 — Component Tests

### 5.1 `tests/unit/components/rag/chat-panel.test.tsx` — HIGH PRIORITY

**Mock:** `vi.mock('@ai-sdk/react', ...)` to replace `useChat`.

```typescript
// Empty state: greeting + suggested questions render
// User message: text-only renders
// User message: image attachments render
// Assistant message: text renders
// Assistant message: reasoning collapsible renders
// Assistant message: citation cards render
// Thinking indicator: shows during streaming
// Follow-up buttons: render after assistant message
// File input: rejects non-image files
// File input: enforces MAX_FILES (2)
// File input: enforces MAX_FILE_SIZE (4MB)
// Tab/ArrowRight: applies suggestion to empty input
// handleSubmit: calls sendMessage with correct payload
```

### 5.2 `tests/unit/components/ai-elements/conversation.test.tsx`

```typescript
// Renders children
// Scroll button: shows after scroll threshold
// Scroll button click: scrolls to bottom
```

---

## Phase 6 — RAG Pipeline Tests

### 6.1 `lib/rag/embed.test.ts`

```typescript
vi.mock('@ai-sdk/cohere')
// embedDocuments() — empty, single, batch overflow
// embedQuery() — cache hit on identical query
```

### 6.2 `lib/rag/query.test.ts`

```typescript
vi.mock('@qdrant/qdrant-js')
// findRelevantProducts() — results parsing, reranking integration
```

### 6.3 `lib/rag/ratelimit.test.ts`

```typescript
vi.mock('@upstash/redis')
// getChatLimiter() — singleton
// getRateLimitKey() — sessionId vs IP fallback
```

---

## Phase 7 — E2E (Playwright)

### 7.1 `playwright.config.ts`

```typescript
// web/tests/e2e/playwright.config.ts
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  use: {
    baseURL: 'http://localhost:3000',
  },
  webServer: {
    command: 'bun run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
  },
})
```

### 7.2 `tests/e2e/cart.spec.ts`

```
Add product → view cart → update quantity → remove item → wishlist flow
```

### 7.3 `tests/e2e/chat.spec.ts`

```
Ask vehicle question → streaming response → citations → follow-up suggestions → send follow-up
```

### 7.4 `tests/e2e/search.spec.ts`

```
Type query → product results → click product → PDP navigation
```

---

## Confirmed Decisions

| Decision | Choice |
|----------|--------|
| E2E framework | Playwright |
| Test fixtures | Factory functions (from TypeScript types) |
| CI coverage | Report only (no enforcement blocking PRs) |
| Shopify mocking | MSW (network-layer, not vi.mock) |
| RAG external services | Mock at SDK boundary (`@ai-sdk/cohere`, `qdrant-js`, `@upstash/redis`) |

## Files to Create

```
web/
├── vitest.config.mts
├── vitest.setup.ts
├── playwright.config.ts        # e2e only
├── tests/
│   ├── unit/
│   │   ├── lib/
│   │   │   ├── utils.test.ts
│   │   │   ├── shopify.test.ts
│   │   │   ├── text.test.ts
│   │   │   └── filter-utils.test.ts
│   │   ├── hooks/
│   │   │   ├── use-mobile.test.ts
│   │   │   └── use-text-measurement.test.ts
│   │   └── components/
│   │       └── rag/
│   │           └── chat-panel.test.tsx
│   │       └── ai-elements/
│   │           └── conversation.test.tsx
│   ├── integration/
│   │   ├── actions/
│   │   │   └── cart.test.ts
│   │   └── api/
│   │       ├── rag-chat.test.ts
│   │       └── search.test.ts
│   ├── e2e/
│   │   ├── cart.spec.ts
│   │   ├── chat.spec.ts
│   │   └── search.spec.ts
│   └── fixtures/               # factory functions only, no JSON
│       └── shopify.ts          # ShopifyCart, ShopifyProduct factories
└── .github/workflows/
    └── test.yml
```
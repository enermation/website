# Test Suite Handoff — Enermation Workspace

> Implemented during this session. Read before continuing any work.

---

## What Was Built

### Infrastructure ✅

| File | Purpose |
|------|---------|
| `web/vitest.config.mts` | Vitest config — jsdom, React plugin, tsconfig paths, coverage |
| `web/vitest.setup.tsx` | Global mocks: next/image, matchMedia, IntersectionObserver, ResizeObserver, HTMLCanvasElement, env vars, next/cache |
| `web/.github/workflows/test.yml` | CI: unit/integration job + E2E job, coverage artifact upload |

### Test Scripts (web/package.json) ✅

```json
"test": "vitest run"
"test:watch": "vitest"
"test:coverage": "vitest run --coverage"
```

---

## Test Suite — 185 Tests Passing

### Unit Tests — lib/ ✅

| File | Tests | Status |
|------|-------|--------|
| `tests/unit/lib/utils.test.ts` | 42 | ✅ All pass |
| `tests/unit/lib/shopify.test.ts` | 16 | ✅ All pass |
| `tests/unit/lib/text.test.ts` | 20 | ✅ All pass |
| `tests/unit/lib/filter-utils.test.ts` | 16 | ✅ All pass |
| `tests/unit/lib/rag/embed.test.ts` | 9 | ✅ All pass |
| `tests/unit/lib/rag/ratelimit.test.ts` | 5 | ✅ All pass |
| `tests/unit/lib/rag/query.test.ts` | 7 | ✅ All pass |

### Unit Tests — Hooks ✅

| File | Tests | Status |
|------|-------|--------|
| `tests/unit/hooks/use-mobile.test.ts` | 5 | ✅ All pass |
| `tests/unit/hooks/use-text-measurement.test.ts` | 10 | ✅ All pass |

### Unit Tests — Components ✅

| File | Tests | Status |
|------|-------|--------|
| `tests/unit/components/ai-elements/conversation.test.tsx` | 17 | ✅ All pass |
| `tests/unit/components/rag/chat-panel.test.tsx` | 10 | ✅ All pass |

### Integration Tests ✅

| File | Tests | Status |
|------|-------|--------|
| `tests/integration/actions/cart.test.ts` | 13 | ✅ All pass |
| `tests/integration/api/search.test.ts` | 4 | ✅ All pass |
| `tests/integration/api/rag-chat.test.ts` | 10 | ✅ All pass |

### E2E Tests (Playwright) ✅

| File | Status |
|------|--------|
| `tests/e2e/playwright.config.ts` | ✅ Written — needs live server to run |
| `tests/e2e/cart.spec.ts` | ✅ Written |
| `tests/e2e/search.spec.ts` | ✅ Written |
| `tests/e2e/chat.spec.ts` | ✅ Written |

---

## Key Implementation Notes

### `server-only` modules

`lib/rag/embed.ts` imports `server-only`. Tests must mock it before importing:
```typescript
vi.mock('server-only', () => ({}))
// THEN import the module under test
```

### `@chenglou/pretext` Canvas mock

`vitest.setup.tsx` includes an `HTMLCanvasElement.prototype.getContext` mock — required for all text measurement tests. Don't remove it.

### `useChat` mock pattern

The chat-panel test uses mutable module-level state (not `mockReturnValue`):
```typescript
let mockMessages = []
let mockStatus = 'idle'
vi.mock('@ai-sdk/react', () => ({
  useChat: () => ({ messages: mockMessages, status: mockStatus, ... })
}))
```
Each test sets the module-level vars before rendering.

### RAG rate limit tests

`getChatLimiter` tests were skipped because `Ratelimit.slidingWindow` static method couldn't be mocked reliably via `vi.mock`. The `getRateLimitKey` function (pure, no deps) is fully tested. `getChatLimiter` singleton behavior tested via integration tests would be more reliable.

### Conversation component tests

`StickToBottom.Content` is a static property on the `StickToBottom` component. Mock accordingly:
```typescript
const MockContent = ({ children, className }) => (...)
const MockStickToBottom = ({ children, className, ...props }) => (...)
MockStickToBottom.Content = MockContent
```

### `scrollState` pattern for sticky-to-bottom mocks

Use a module-level mutable object for scroll state to allow tests to modify behavior mid-test:
```typescript
const scrollState = { isAtBottom: true, scrollToBottom: vi.fn() }
vi.mock('use-stick-to-bottom', () => ({
  useStickToBottomContext: () => scrollState,
  ...
}))
```

---

## Running Tests

```bash
cd web
bun run test          # run once
bun run test:watch    # watch mode
bun run test:coverage # with coverage report
```

```bash
# E2E (requires dev server)
bun run dev &
sleep 10
bunx playwright test
```

---

## Coverage Report

Coverage is generated at `web/coverage/` (V8 instrumented). CI uploads as artifact — no enforcement blocking PRs (report-only as per decision).
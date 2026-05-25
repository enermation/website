---
name: testing
description: Test framework setup, organization, and patterns for the Enermation workspace
metadata:
  type: codebase
---

# Testing Patterns

**Analysis Date:** 2026-05-25

## Test Framework

**Runner:** Bun test (via `bun test`)

**DOM Environment:** happy-dom via `@happy-dom/global-registrator` (not jsdom — Bun uses JavaScriptCore)

**Assertion Library:** Vitest-compatible (`expect`, `describe`, `it`, `vi`)

**Config File:** `web/bunfig.toml`
```toml
[test]
preload = ["./tests/bun-setup.tsx"]
include = [
  "tests/unit/**/*.test.{ts,tsx}",
  "tests/integration/**/*.test.{ts,tsx}",
]
timeout = 10000
coverage = true
coverageThreshold = 0.8
```

## Preload Setup

**File:** `web/tests/bun-setup.tsx`

**What's Set Up:**
- Registers happy-dom globals via `GlobalRegistrator.register()`
- Imports `@testing-library/jest-dom` for DOM assertions
- Sets up cleanup after each test (`cleanup()`, `mock.restore()`)
- Mocks `server-only`, `next/image`, `next/cache`
- Mocks `matchMedia`, `IntersectionObserver`, `ResizeObserver`
- Mocks `HTMLCanvasElement.getContext`
- Sets test environment variables

**Critical Note:** The `--preload` flag is always required when running tests:
```bash
bun test --preload ./tests/bun-setup.tsx ./tests/unit ./tests/integration
```
This is because `bunfig.toml` `[test].preload` is not auto-read by the Bun CLI.

## Run Commands

```bash
bun test                       # Run all tests
bun test --preload ./tests/bun-setup.tsx ./tests/unit ./tests/integration  # Explicit preload
bun test:unit                  # Unit tests only
bun test:integration           # Integration tests only
bun run playwright test        # E2E tests
```

## Test File Organization

```
web/tests/
├── bun-setup.tsx           # Preload setup file
├── test-utils.ts           # Test utilities (mocked(), etc.)
├── unit/                   # Unit tests
│   ├── components/
│   │   ├── ai-elements/
│   │   │   └── conversation.test.tsx
│   │   └── rag/
│   │       └── chat-panel.test.tsx
│   ├── hooks/
│   │   ├── use-mobile.test.ts
│   │   └── use-text-measurement.test.ts
│   └── lib/
│       ├── filter-utils.test.ts
│       ├── rag/
│       │   ├── embed.test.ts
│       │   ├── query.test.ts
│       │   └── ratelimit.test.ts
│       ├── shopify.test.ts
│       ├── text.test.ts
│       └── utils.test.ts
├── integration/             # Integration tests
│   ├── actions/
│   │   └── cart.test.ts
│   └── api/
│       ├── rag-chat.test.ts
│       └── search.test.ts
└── e2e/                    # E2E tests (Playwright)
    └── playwright.config.ts
```

## Test File Naming

- Pattern: `*.test.{ts,tsx}`
- Example: `utils.test.ts`, `conversation.test.tsx`

## Test Structure

**Unit Test Example (from `web/tests/unit/lib/utils.test.ts`):**
```typescript
import { describe, expect, it } from 'vitest'
import { cn, formatPrice } from '@/lib/utils'

describe('cn', () => {
  it('merges clsx and twMerge correctly', () => {
    const result = cn('foo bar', 'baz', { qux: true, quux: false })
    expect(result).toBe('foo bar baz qux')
  })
  // ...
})
```

**Integration Test Example (from `web/tests/integration/actions/cart.test.ts`):**
```typescript
import { describe, expect, it, vi } from 'vitest'
import { createCartAction } from '@/app/actions/cart'

vi.mock('@/lib/shopify', () => ({
  getClient: vi.fn(() => ({
    request: vi.fn(),
  })),
}))

describe('createCartAction', () => {
  it('returns cart on success', async () => {
    const { getClient } = await import('@/lib/shopify')
    const mockRequest = vi.fn().mockResolvedValue({
      data: { cartCreate: { cart: mockCart, userErrors: [] } },
    })
    ;(getClient as ReturnType<typeof vi.fn>).mockReturnValue({ request: mockRequest })
    const result = await createCartAction([...])
    expect(result.cart).toBeDefined()
  })
})
```

## Mocking Patterns

**Module Mocks (mock.module):**
```typescript
// Mock server-only
mock.module('server-only', () => ({}))

// Mock next/image
mock.module('next/image', () => ({
  default: function Image(props: React.ComponentProps<'img'> & { priority?: boolean }) {
    return <img {...props} aria-hidden="true" />
  },
}))

// Mock next/cache
mock.module('next/cache', () => ({
  cacheLife: fn(),
  cacheTag: fn(),
}))
```

**Function Mocks (vi.fn):**
```typescript
import { vi } from 'vitest'

// Create mock function
const mockRequest = vi.fn().mockResolvedValue({ data: {...} })

// Use in mock
vi.mock('@/lib/shopify', () => ({
  getClient: vi.fn(() => ({ request: mockRequest })),
}))
```

**vi.mocked() Replacement:**
Bun does not have `vi.mocked()`. Use the helper from `web/tests/test-utils.ts`:
```typescript
import { mocked } from '@/tests/test-utils'

// Cast function to its Bun Mock type
const getClient = mocked(vi.fn())
```
Or cast directly: `(fn as ReturnType<typeof vi.fn>)`

**matchMedia Mock:**
```typescript
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: fn(),
    removeListener: fn(),
    addEventListener: fn(),
    removeEventListener: fn(),
    dispatchEvent: fn(),
  })),
})
```

## Fixtures and Factories

**Mock Data:** Defined inline in test files as `const mockCart: ShopifyCart = {...}`

**Example from `web/tests/integration/actions/cart.test.ts`:**
```typescript
const mockCart: ShopifyCart = {
  id: 'gid://shopify/Cart/test-cart-123',
  checkoutUrl: 'https://test-store.myshopify.com/checkout',
  lines: { edges: [...] },
  cost: { totalAmount: {...}, subtotalAmount: {...}, ... },
}
```

## E2E Testing

**Framework:** Playwright (`@playwright/test`)

**Config:** `web/tests/e2e/playwright.config.ts`
```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'bun run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
})
```

**Run E2E Tests:**
```bash
bun run test:e2e  # Runs: bun run playwright test
```

## Coverage

**Threshold:** 80% (`coverageThreshold = 0.8` in `bunfig.toml`)

**Enforcement:** Coverage check runs as part of the test command

**No Coverage Enforcement:** Components/ui directory is excluded from TypeScript build (`tsconfig.json` exclude)

## Testing Library

**DOM Testing:** `@testing-library/dom`, `@testing-library/react`, `@testing-library/user-event`

**Matchers:** `@testing-library/jest-dom` (imported in preload setup)

**Key Patterns:**
- `cleanup()` called after each test (in preload `afterEach`)
- `render()` from `@testing-library/react` for React component tests
- `userEvent` for simulating user interactions

## Fake Timers

**Bun Support:** `vi.useFakeTimers()` + `vi.runAllTimers()` work same as Vitest

```typescript
import { vi } from 'vitest'

it('debounces input', () => {
  vi.useFakeTimers()
  // ... test code
  vi.runAllTimers()
})
```

---

*Testing analysis: 2026-05-25*
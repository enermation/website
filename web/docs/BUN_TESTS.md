# Bun Test Reference

## Running Tests

```bash
bun test --preload ./tests/bun-setup.tsx ./tests/unit ./tests/integration
```

> Note: The `--preload` flag is required. Bun does not read `bunfig.toml` `[test].preload` from the project root, so the config is ignored when running from the CLI.

## bun-setup.tsx

The preload file at `tests/bun-setup.tsx` sets up the test environment before any tests run.

### What it provides

| Mock | Purpose |
|---|---|
| `next/image` | Returns a bare `<img>` element instead of rendering the component |
| `next/cache` | Mocks `cacheLife` and `cacheTag` as no-op functions |
| `server-only` | Returns an empty object — prevents server-only modules from throwing in client test context |
| `window.matchMedia` | Returns a no-op `MediaQueryList` |
| `IntersectionObserver` | Returns a no-op observer |
| `ResizeObserver` | Returns a no-op observer |
| `HTMLCanvasElement.getContext` | Returns a mock `CanvasRenderingContext2D` |

### Environment variables

The preload also sets test env vars so tests don't need a `.env.test`:

```
PUBLIC_STORE_DOMAIN=test-store.myshopify.com
PRIVATE_STOREFRONT_API_TOKEN=test-token
SHOPIFY_ADMIN_ACCESS_TOKEN=test-admin-token
SHOPIFY_ADMIN_STORE_DOMAIN=test-store.myshopify.com
COHERE_API_KEY=test-cohere-key
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=test-qdrant-key
UPSTASH_REDIS_REST_URL=http://localhost:6379
UPSTASH_REDIS_REST_TOKEN=test-redis-token
```

## Migration: vi.mocked() → (fn as ReturnType<typeof vi.fn>)

If you migrate from Vitest to Bun and have:

```ts
const myMock = vi.fn()
vi.mocked(myMock) // Error: vi.mocked does not exist in Bun
```

Replace with:

```ts
const myMock = vi.fn()
myMock as ReturnType<typeof vi.fn>
```

Or use the exported `fn` alias directly in the file:

```ts
import { fn } from 'bun:test'
const myMock = fn()
```

## Fake Timers

Use `vi.useFakeTimers()` / `vi.useRealTimers()` the same way as in Vitest:

```ts
beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})
```

## Happy-DOM

`happy-dom` is registered globally via `GlobalRegistrator` in the preload. All `describe`/`it`/`expect` blocks run with DOM globals automatically — no setup needed per test file.

## Skip Setup Per File

If a test file needs a completely clean slate (no mocks, no happy-dom), add this comment at the top to prevent the preload from running:

```ts
// @bun-preload-skip
```
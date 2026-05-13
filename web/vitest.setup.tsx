import '@testing-library/jest-dom'
import { vi } from 'vitest'

// ── next/image mock ────────────────────────────────────────────────────────────
vi.mock('next/image', () => ({
  default: function Image(props: React.ComponentProps<'img'> & { priority?: boolean }) {
    // biome-ignore lint/performance/noImgElement: next/image mock in test environment
    // biome-ignore lint/a11y/useAltText: mock does not render real images
    return <img {...props} aria-hidden="true" />
  },
}))

// ── window.matchMedia mock ────────────────────────────────────────────────────
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// ── IntersectionObserver mock ─────────────────────────────────────────────────
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
  takeRecords: vi.fn(),
}))

// ── ResizeObserver mock ────────────────────────────────────────────────────────
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// ── HTMLCanvasElement mock (required by @chenglou/pretext) ─────────────────────
if (typeof HTMLCanvasElement !== 'undefined') {
  HTMLCanvasElement.prototype.getContext = function (
    _contextType: string
  ): CanvasRenderingContext2D | null {
    const mockCtx: CanvasRenderingContext2D = {
      fillText: vi.fn(),
      measureText: vi.fn((text: string) => ({ width: text.length * 10 })),
      font: '',
      textAlign: 'start',
      textBaseline: 'alphabetic',
      direction: 'ltr',
      fillRect: vi.fn(),
      clearRect: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      scale: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      canvas: this as HTMLCanvasElement,
    } as unknown as CanvasRenderingContext2D
    return mockCtx
  }
}

// ── Environment variables stub ────────────────────────────────────────────────
process.env.PUBLIC_STORE_DOMAIN = 'test-store.myshopify.com'
process.env.PRIVATE_STOREFRONT_API_TOKEN = 'test-token'
process.env.SHOPIFY_ADMIN_ACCESS_TOKEN = 'test-admin-token'
process.env.SHOPIFY_ADMIN_STORE_DOMAIN = 'test-store.myshopify.com'
process.env.COHERE_API_KEY = 'test-cohere-key'
process.env.QDRANT_URL = 'http://localhost:6333'
process.env.QDRANT_API_KEY = 'test-qdrant-key'
process.env.UPSTASH_REDIS_REST_URL = 'http://localhost:6379'
process.env.UPSTASH_REDIS_REST_TOKEN = 'test-redis-token'

// ── next/cache mocks ───────────────────────────────────────────────────────────
vi.mock('next/cache', () => ({
  cacheLife: vi.fn(),
  cacheTag: vi.fn(),
}))

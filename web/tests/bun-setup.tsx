import '@testing-library/jest-dom'
import { afterEach, mock, vi } from 'bun:test'
import { GlobalRegistrator } from '@happy-dom/global-registrator'
import * as matchers from '@testing-library/jest-dom/matchers'
import { cleanup } from '@testing-library/react'

// Use vi.fn() for mock functions (Vitest compatibility)
const fn = vi.fn

// ── Register happy-dom globals ────────────────────────────────────────────────
GlobalRegistrator.register()

// ── Extend expect with jest-dom matchers ──────────────────────────────────────
expect.extend(matchers)

// ── Cleanup after each test ────────────────────────────────────────────────────
afterEach(() => {
  cleanup()
  mock.restore()
})

// ── Mock next/image ────────────────────────────────────────────────────────────
mock.module('next/image', () => ({
  default: function Image(props: React.ComponentProps<'img'> & { priority?: boolean }) {
    // biome-ignore lint/performance/noImgElement: next/image mock in test environment
    // biome-ignore lint/a11y/useAltText: mock does not render real images
    return <img {...props} aria-hidden="true" />
  },
}))

// ── Mock next/cache ──────────────────────────────────────────────────────────
mock.module('next/cache', () => ({
  cacheLife: fn(),
  cacheTag: fn(),
}))

// ── Mock matchMedia ──────────────────────────────────────────────────────────
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

// ── Mock IntersectionObserver ─────────────────────────────────────────────────
global.IntersectionObserver = fn().mockImplementation(() => ({
  observe: fn(),
  unobserve: fn(),
  disconnect: fn(),
  takeRecords: fn(),
})) as unknown as typeof IntersectionObserver

// ── Mock ResizeObserver ───────────────────────────────────────────────────────
global.ResizeObserver = fn().mockImplementation(() => ({
  observe: fn(),
  unobserve: fn(),
  disconnect: fn(),
})) as unknown as typeof ResizeObserver

// ── Mock HTMLCanvasElement.getContext ────────────────────────────────────────
if (typeof HTMLCanvasElement !== 'undefined') {
  HTMLCanvasElement.prototype.getContext = function (
    _contextType: string
  ): CanvasRenderingContext2D | null {
    const mockCtx = {
      fillText: fn(),
      measureText: fn((text: string) => ({ width: text.length * 10 })),
      font: '',
      textAlign: 'start' as const,
      textBaseline: 'alphabetic' as const,
      direction: 'ltr' as const,
      fillRect: fn(),
      clearRect: fn(),
      beginPath: fn(),
      moveTo: fn(),
      lineTo: fn(),
      stroke: fn(),
      save: fn(),
      restore: fn(),
      scale: fn(),
      translate: fn(),
      rotate: fn(),
      canvas: this as HTMLCanvasElement,
    } as unknown as CanvasRenderingContext2D
    return mockCtx
  }
}

// ── Environment variables ─────────────────────────────────────────────────────
process.env.PUBLIC_STORE_DOMAIN = 'test-store.myshopify.com'
process.env.PRIVATE_STOREFRONT_API_TOKEN = 'test-token'
process.env.SHOPIFY_ADMIN_ACCESS_TOKEN = 'test-admin-token'
process.env.SHOPIFY_ADMIN_STORE_DOMAIN = 'test-store.myshopify.com'
process.env.COHERE_API_KEY = 'test-cohere-key'
process.env.QDRANT_URL = 'http://localhost:6333'
process.env.QDRANT_API_KEY = 'test-qdrant-key'
process.env.UPSTASH_REDIS_REST_URL = 'http://localhost:6379'
process.env.UPSTASH_REDIS_REST_TOKEN = 'test-redis-token'

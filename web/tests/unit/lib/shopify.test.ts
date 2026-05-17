import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { RawMetafield } from '@/lib/shopify'
import { getClient, metafieldLabel, parseMetaobjectGIDs } from '@/lib/shopify'

// ── Mock Shopify client ────────────────────────────────────────────────────────
vi.mock('@shopify/storefront-api-client', () => ({
  createStorefrontApiClient: vi.fn(() => ({
    request: vi.fn(),
  })),
}))

// Mock next/cache
vi.mock('next/cache', () => ({
  cacheLife: vi.fn(),
  cacheTag: vi.fn(),
}))

// ── parseMetaobjectGIDs ────────────────────────────────────────────────────────

describe('parseMetaobjectGIDs', () => {
  it('parses valid JSON array of GIDs', () => {
    const input =
      '["gid://shopify/Metaobject/193218642106","gid://shopify/Metaobject/193218642107"]'
    const result = parseMetaobjectGIDs(input)
    expect(result).toEqual([
      'gid://shopify/Metaobject/193218642106',
      'gid://shopify/Metaobject/193218642107',
    ])
  })

  it('returns empty array for null', () => {
    expect(parseMetaobjectGIDs(null)).toEqual([])
  })

  it('returns empty array for empty string', () => {
    expect(parseMetaobjectGIDs('')).toEqual([])
  })

  it('throws for invalid JSON', () => {
    expect(() => parseMetaobjectGIDs('not json')).toThrow('Invalid metaobject GIDs JSON: not json')
  })

  it('throws when JSON is not an array', () => {
    expect(() => parseMetaobjectGIDs('"single string"')).toThrow(
      'Expected metaobject GIDs array, got string'
    )
  })

  it('filters out non-string elements', () => {
    const input = '["gid://shopify/Metaobject/1", 123, null, "gid://shopify/Metaobject/2"]'
    const result = parseMetaobjectGIDs(input)
    expect(result).toEqual(['gid://shopify/Metaobject/1', 'gid://shopify/Metaobject/2'])
  })

  it('returns empty array when all elements are non-strings', () => {
    const input = '[123, null, false]'
    expect(parseMetaobjectGIDs(input)).toEqual([])
  })
})

// ── metafieldLabel ────────────────────────────────────────────────────────────

describe('metafieldLabel', () => {
  it('uses definition name when present', () => {
    const mf: RawMetafield = {
      namespace: 'shopify',
      key: 'transmission-type',
      value: '["gid://shopify/Metaobject/1"]',
      type: 'list.metaobject_reference',
      definition: { name: 'Transmission Type' },
    }
    expect(metafieldLabel(mf)).toBe('Transmission Type')
  })

  it('derives label from key when no definition', () => {
    const mf: RawMetafield = {
      namespace: 'custom',
      key: 'model-year',
      value: '2022',
      type: 'number_integer',
      definition: null,
    }
    expect(metafieldLabel(mf)).toBe('Model Year')
  })

  it('handles key with hyphens', () => {
    const mf: RawMetafield = {
      namespace: 'custom',
      key: 'fuel-supply',
      value: 'Petrol',
      type: 'single_line_text_field',
      definition: null,
    }
    expect(metafieldLabel(mf)).toBe('Fuel Supply')
  })

  it('handles definition with empty name', () => {
    const mf: RawMetafield = {
      namespace: 'shopify',
      key: 'some-field',
      value: 'value',
      type: 'single_line_text_field',
      definition: { name: '' },
    }
    expect(metafieldLabel(mf)).toBe('Some Field')
  })
})

// ── getClient ─────────────────────────────────────────────────────────────────

describe('getClient', () => {
  beforeEach(() => {
    // vi.resetModules() not available in Bun - env vars are set per-test
  })

  it('creates client with correct parameters', () => {
    process.env.PUBLIC_STORE_DOMAIN = 'test-store.myshopify.com'
    process.env.PRIVATE_STOREFRONT_API_TOKEN = 'test-token'

    const client = getClient()
    expect(client).toBeDefined()
    expect(typeof client.request).toBe('function')
  })

  it('throws when PUBLIC_STORE_DOMAIN is missing', () => {
    delete process.env.PUBLIC_STORE_DOMAIN
    delete process.env.SHOPIFY_STORE_DOMAIN
    process.env.PRIVATE_STOREFRONT_API_TOKEN = 'test-token'

    expect(() => getClient()).toThrow(
      'Missing required Shopify environment variable: PUBLIC_STORE_DOMAIN'
    )
  })

  it('throws when PRIVATE_STOREFRONT_API_TOKEN is missing', () => {
    process.env.PUBLIC_STORE_DOMAIN = 'test-store.myshopify.com'
    delete process.env.PRIVATE_STOREFRONT_API_TOKEN
    delete process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN

    expect(() => getClient()).toThrow(
      'Missing required Shopify environment variable: PRIVATE_STOREFRONT_API_TOKEN'
    )
  })

  it('accepts alias env var for store domain', () => {
    process.env.PUBLIC_STORE_DOMAIN = ''
    process.env.SHOPIFY_STORE_DOMAIN = 'alias-store.myshopify.com'
    process.env.PRIVATE_STOREFRONT_API_TOKEN = 'test-token'

    const client = getClient()
    expect(client).toBeDefined()
  })

  it('accepts alias env var for storefront token', () => {
    process.env.PUBLIC_STORE_DOMAIN = 'test-store.myshopify.com'
    process.env.PRIVATE_STOREFRONT_API_TOKEN = ''
    process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN = 'alias-token'

    const client = getClient()
    expect(client).toBeDefined()
  })
})

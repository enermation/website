import { describe, expect, it } from 'vitest'
import { applyFilters, buildFilterDimensions } from '@/lib/filter-utils'
import type { ShopifyProduct } from '@/lib/types'

// ── Test fixtures ─────────────────────────────────────────────────────────────

const makeProduct = (
  specs: Array<{ ns: string; key: string; label: string; value: string }>
): ShopifyProduct =>
  ({
    id: 'gid://shopify/Product/1',
    title: 'Test Product',
    handle: 'test-product',
    vendor: 'Test Vendor',
    description: '',
    availableForSale: true,
    images: { edges: [] },
    priceRange: { minVariantPrice: { amount: '1000', currencyCode: 'GBP' } },
    variants: { edges: [] },
    resolvedSpecs: specs.map(s => ({
      namespace: s.ns,
      key: s.key,
      label: s.label,
      value: s.value,
    })),
  }) as unknown as ShopifyProduct

// ── buildFilterDimensions ────────────────────────────────────────────────────

describe('buildFilterDimensions', () => {
  it('builds filter dimensions from product specs', () => {
    const products = [
      makeProduct([
        { ns: 'shopify', key: 'fuel-supply', label: 'Fuel Supply', value: 'Petrol' },
        { ns: 'shopify', key: 'transmission-type', label: 'Transmission', value: 'Automatic' },
      ]),
      makeProduct([
        { ns: 'shopify', key: 'fuel-supply', label: 'Fuel Supply', value: 'Diesel' },
        { ns: 'shopify', key: 'transmission-type', label: 'Transmission', value: 'Automatic' },
      ]),
    ]

    const dims = buildFilterDimensions(products)
    expect(dims.length).toBeGreaterThan(0)

    const fuelDim = dims.find(d => d.key === 'shopify.fuel-supply')
    expect(fuelDim).toBeDefined()
    expect(fuelDim?.options).toContainEqual(expect.objectContaining({ value: 'Petrol', count: 1 }))
    expect(fuelDim?.options).toContainEqual(expect.objectContaining({ value: 'Diesel', count: 1 }))
  })

  it('sorts by preferred label order', () => {
    const products = [
      makeProduct([
        { ns: 'custom', key: 'make', label: 'Make', value: 'Toyota' },
        { ns: 'custom', key: 'colour', label: 'Colour', value: 'Red' },
      ]),
    ]

    const dims = buildFilterDimensions(products)
    // Make should come before colour in preferred order
    const makeDim = dims.find(d => d.key === 'custom.make')
    const colourDim = dims.find(d => d.key === 'custom.colour')
    if (makeDim && colourDim) {
      expect(dims.indexOf(makeDim)).toBeLessThan(dims.indexOf(colourDim))
    }
  })

  it('excludes shopify.vehicle-features', () => {
    const products = [
      makeProduct([
        { ns: 'shopify', key: 'vehicle-features', label: 'Features', value: 'AC,Sunroof' },
        { ns: 'shopify', key: 'fuel-supply', label: 'Fuel', value: 'Petrol' },
      ]),
    ]

    const dims = buildFilterDimensions(products)
    expect(dims.find(d => d.key === 'shopify.vehicle-features')).toBeUndefined()
    expect(dims.find(d => d.key === 'shopify.fuel-supply')).toBeDefined()
  })

  it('sorts numeric values numerically', () => {
    const products = [
      makeProduct([{ ns: 'custom', key: 'year', label: 'Year', value: '2020' }]),
      makeProduct([{ ns: 'custom', key: 'year', label: 'Year', value: '2018' }]),
      makeProduct([{ ns: 'custom', key: 'year', label: 'Year', value: '2022' }]),
    ]

    const dims = buildFilterDimensions(products)
    const yearDim = dims.find(d => d.key === 'custom.year')
    expect(yearDim?.options[0]?.value).toBe('2022') // descending numeric
    expect(yearDim?.type).toBe('number')
  })

  it('sorts text values alphabetically', () => {
    const products = [
      makeProduct([{ ns: 'custom', key: 'make', label: 'Make', value: 'BMW' }]),
      makeProduct([{ ns: 'custom', key: 'make', label: 'Make', value: 'Audi' }]),
      makeProduct([{ ns: 'custom', key: 'make', label: 'Make', value: 'Toyota' }]),
    ]

    const dims = buildFilterDimensions(products)
    const makeDim = dims.find(d => d.key === 'custom.make')
    expect(makeDim?.options[0]?.value).toBe('Audi') // alphabetical
    expect(makeDim?.type).toBe('text')
  })

  it('excludes dimensions with empty options', () => {
    const products = [makeProduct([{ ns: 'custom', key: 'make', label: 'Make', value: 'Toyota' }])]

    const dims = buildFilterDimensions(products)
    expect(dims.every(d => d.options.length > 0)).toBe(true)
  })

  it('returns empty array for products with no specs', () => {
    const products = [makeProduct([])]
    expect(buildFilterDimensions(products)).toEqual([])
  })
})

// ── applyFilters ─────────────────────────────────────────────────────────────

describe('applyFilters', () => {
  it('returns all products when no filters active', () => {
    const products = [
      makeProduct([{ ns: 'shopify', key: 'fuel', label: 'Fuel', value: 'Petrol' }]),
      makeProduct([{ ns: 'shopify', key: 'fuel', label: 'Fuel', value: 'Diesel' }]),
    ]

    expect(applyFilters(products, {}).length).toBe(2)
  })

  it('filters by single spec', () => {
    const products = [
      makeProduct([{ ns: 'shopify', key: 'fuel', label: 'Fuel', value: 'Petrol' }]),
      makeProduct([{ ns: 'shopify', key: 'fuel', label: 'Fuel', value: 'Diesel' }]),
    ]

    const result = applyFilters(products, { 'shopify.fuel': 'Petrol' })
    expect(result.length).toBe(1)
    expect(result[0].resolvedSpecs?.[0].value).toBe('Petrol')
  })

  it('filters by multiple specs (AND logic)', () => {
    const products = [
      makeProduct([
        { ns: 'shopify', key: 'fuel', label: 'Fuel', value: 'Petrol' },
        { ns: 'shopify', key: 'transmission', label: 'Transmission', value: 'Automatic' },
      ]),
      makeProduct([
        { ns: 'shopify', key: 'fuel', label: 'Fuel', value: 'Petrol' },
        { ns: 'shopify', key: 'transmission', label: 'Transmission', value: 'Manual' },
      ]),
    ]

    const result = applyFilters(products, {
      'shopify.fuel': 'Petrol',
      'shopify.transmission': 'Automatic',
    })
    expect(result.length).toBe(1)
  })

  it('excludes products that do not match filter', () => {
    const products = [
      makeProduct([{ ns: 'custom', key: 'make', label: 'Make', value: 'Toyota' }]),
      makeProduct([{ ns: 'custom', key: 'make', label: 'Make', value: 'BMW' }]),
    ]

    const result = applyFilters(products, { 'custom.make': 'Toyota' })
    expect(result.length).toBe(1)
    expect(result[0].resolvedSpecs?.[0].value).toBe('Toyota')
  })

  it('ignores "Show All" filter values', () => {
    const products = [makeProduct([{ ns: 'custom', key: 'make', label: 'Make', value: 'Toyota' }])]

    const result = applyFilters(products, { 'custom.make': 'Show All' })
    expect(result.length).toBe(1)
  })

  it('handles empty/undefined filter values', () => {
    const products = [makeProduct([{ ns: 'custom', key: 'make', label: 'Make', value: 'Toyota' }])]

    const result = applyFilters(products, { 'custom.make': '' })
    expect(result.length).toBe(1)
  })
})

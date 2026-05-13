import { describe, expect, it, vi } from 'vitest'
import {
  addCartLinesAction,
  addWishlistLinesAction,
  createCartAction,
  createWishlistCartAction,
  getCartAction,
  getWishlistCartAction,
  removeCartLinesAction,
  removeWishlistLinesAction,
  updateCartLinesAction,
} from '@/app/actions/cart'
import type { ShopifyCart } from '@/lib/types'

// ── Mock Shopify client ───────────────────────────────────────────────────────

vi.mock('@/lib/shopify', () => ({
  getClient: vi.fn(() => ({
    request: vi.fn(),
  })),
}))

vi.mock('next/cache', () => ({
  cacheLife: vi.fn(),
  cacheTag: vi.fn(),
}))

// ── Fixtures ───────────────────────────────────────────────────────────────────

const mockCart: ShopifyCart = {
  id: 'gid://shopify/Cart/test-cart-123',
  checkoutUrl: 'https://test-store.myshopify.com/checkout',
  lines: {
    edges: [
      {
        node: {
          id: 'gid://shopify/CartLine/1',
          quantity: 2,
          merchandise: {
            id: 'gid://shopify/ProductVariant/1',
            title: 'Default Title',
            price: { amount: '2999.99', currencyCode: 'GBP' },
            compareAtPrice: null,
            selectedOptions: [],
            product: {
              title: 'Test Product',
              handle: 'test-product',
              images: { edges: [] },
            },
          },
        },
      },
    ],
  },
  cost: {
    totalAmount: { amount: '5999.98', currencyCode: 'GBP' },
    subtotalAmount: { amount: '5999.98', currencyCode: 'GBP' },
    totalTaxAmount: null,
    totalDutyAmount: null,
  },
}

const mockUserErrors = [
  {
    code: 'INVALID_INPUT',
    field: ['lines'],
    message: 'Invalid cart line input',
  },
]

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('createCartAction', () => {
  it('returns cart on success', async () => {
    const { getClient } = await import('@/lib/shopify')
    const mockRequest = vi.fn().mockResolvedValue({
      data: {
        cartCreate: {
          cart: mockCart,
          userErrors: [],
        },
      },
    })
    ;(getClient as ReturnType<typeof vi.fn>).mockReturnValue({ request: mockRequest })

    const result = await createCartAction([
      { merchandiseId: 'gid://shopify/ProductVariant/1', quantity: 1 },
    ])
    expect(result.cart).toBeDefined()
    expect(result.error).toBeNull()
  })

  it('returns error on userErrors', async () => {
    const { getClient } = await import('@/lib/shopify')
    const mockRequest = vi.fn().mockResolvedValue({
      data: {
        cartCreate: {
          cart: null,
          userErrors: mockUserErrors,
        },
      },
    })
    ;(getClient as ReturnType<typeof vi.fn>).mockReturnValue({ request: mockRequest })

    const result = await createCartAction([
      { merchandiseId: 'gid://shopify/ProductVariant/1', quantity: 1 },
    ])
    expect(result.cart).toBeNull()
    expect(result.error).toEqual({
      code: 'INVALID_INPUT',
      field: ['lines'],
      message: 'Invalid cart line input',
    })
  })

  it('returns error when cartCreate is null', async () => {
    const { getClient } = await import('@/lib/shopify')
    const mockRequest = vi.fn().mockResolvedValue({ data: null })
    ;(getClient as ReturnType<typeof vi.fn>).mockReturnValue({ request: mockRequest })

    const result = await createCartAction([])
    expect(result.cart).toBeNull()
    expect(result.error).toBeDefined()
  })
})

describe('addCartLinesAction', () => {
  it('returns cart on success', async () => {
    const { getClient } = await import('@/lib/shopify')
    const mockRequest = vi.fn().mockResolvedValue({
      data: {
        cartLinesAdd: {
          cart: mockCart,
          userErrors: [],
        },
      },
    })
    ;(getClient as ReturnType<typeof vi.fn>).mockReturnValue({ request: mockRequest })

    const result = await addCartLinesAction('gid://shopify/Cart/test-cart-123', [
      { merchandiseId: 'gid://shopify/ProductVariant/1', quantity: 1 },
    ])
    expect(result.cart).toBeDefined()
    expect(result.error).toBeNull()
  })

  it('returns error on failure', async () => {
    const { getClient } = await import('@/lib/shopify')
    const mockRequest = vi.fn().mockResolvedValue({
      data: {
        cartLinesAdd: {
          cart: null,
          userErrors: mockUserErrors,
        },
      },
    })
    ;(getClient as ReturnType<typeof vi.fn>).mockReturnValue({ request: mockRequest })

    const result = await addCartLinesAction('gid://shopify/Cart/test-cart-123', [
      { merchandiseId: 'invalid', quantity: 1 },
    ])
    expect(result.cart).toBeNull()
    expect(result.error).toBeDefined()
  })
})

describe('updateCartLinesAction', () => {
  it('returns cart on success', async () => {
    const { getClient } = await import('@/lib/shopify')
    const mockRequest = vi.fn().mockResolvedValue({
      data: {
        cartLinesUpdate: {
          cart: mockCart,
          userErrors: [],
        },
      },
    })
    ;(getClient as ReturnType<typeof vi.fn>).mockReturnValue({ request: mockRequest })

    const result = await updateCartLinesAction('gid://shopify/Cart/test-cart-123', [
      { id: 'gid://shopify/CartLine/1', quantity: 3 },
    ])
    expect(result.cart).toBeDefined()
    expect(result.error).toBeNull()
  })

  it('returns error on failure', async () => {
    const { getClient } = await import('@/lib/shopify')
    const mockRequest = vi.fn().mockResolvedValue({
      data: {
        cartLinesUpdate: {
          cart: null,
          userErrors: [{ code: 'INVALID_LINE_ID', field: ['id'], message: 'Cart line not found' }],
        },
      },
    })
    ;(getClient as ReturnType<typeof vi.fn>).mockReturnValue({ request: mockRequest })

    const result = await updateCartLinesAction('gid://shopify/Cart/test-cart-123', [
      { id: 'invalid-id', quantity: 1 },
    ])
    expect(result.cart).toBeNull()
    expect(result.error).toBeDefined()
  })
})

describe('removeCartLinesAction', () => {
  it('returns cart on success', async () => {
    const { getClient } = await import('@/lib/shopify')
    const mockRequest = vi.fn().mockResolvedValue({
      data: {
        cartLinesRemove: {
          cart: mockCart,
          userErrors: [],
        },
      },
    })
    ;(getClient as ReturnType<typeof vi.fn>).mockReturnValue({ request: mockRequest })

    const result = await removeCartLinesAction('gid://shopify/Cart/test-cart-123', [
      'gid://shopify/CartLine/1',
    ])
    expect(result.cart).toBeDefined()
    expect(result.error).toBeNull()
  })

  it('returns error on failure', async () => {
    const { getClient } = await import('@/lib/shopify')
    const mockRequest = vi.fn().mockResolvedValue({
      data: {
        cartLinesRemove: {
          cart: null,
          userErrors: mockUserErrors,
        },
      },
    })
    ;(getClient as ReturnType<typeof vi.fn>).mockReturnValue({ request: mockRequest })

    const result = await removeCartLinesAction('gid://shopify/Cart/test-cart-123', ['invalid-id'])
    expect(result.cart).toBeNull()
    expect(result.error).toBeDefined()
  })
})

describe('getCartAction', () => {
  it('returns cart when found', async () => {
    const { getClient } = await import('@/lib/shopify')
    const mockRequest = vi.fn().mockResolvedValue({
      data: { cart: mockCart },
    })
    ;(getClient as ReturnType<typeof vi.fn>).mockReturnValue({ request: mockRequest })

    const result = await getCartAction('gid://shopify/Cart/test-cart-123')
    expect(result).toEqual(mockCart)
  })

  it('returns null when cart not found', async () => {
    const { getClient } = await import('@/lib/shopify')
    const mockRequest = vi.fn().mockResolvedValue({
      data: { cart: null },
    })
    ;(getClient as ReturnType<typeof vi.fn>).mockReturnValue({ request: mockRequest })

    const result = await getCartAction('non-existent-cart')
    expect(result).toBeNull()
  })
})

describe('createWishlistCartAction', () => {
  it('returns cart on success with wishlist attribute', async () => {
    const { getClient } = await import('@/lib/shopify')
    const mockRequest = vi.fn().mockResolvedValue({
      data: {
        cartCreate: {
          cart: { ...mockCart, id: 'gid://shopify/Cart/wishlist-123' },
          userErrors: [],
        },
      },
    })
    ;(getClient as ReturnType<typeof vi.fn>).mockReturnValue({ request: mockRequest })

    const result = await createWishlistCartAction([
      { merchandiseId: 'gid://shopify/ProductVariant/1', quantity: 1 },
    ])
    expect(result.cart).toBeDefined()
    expect(result.error).toBeNull()
  })

  it('returns error on failure', async () => {
    const { getClient } = await import('@/lib/shopify')
    const mockRequest = vi.fn().mockResolvedValue({
      data: {
        cartCreate: {
          cart: null,
          userErrors: mockUserErrors,
        },
      },
    })
    ;(getClient as ReturnType<typeof vi.fn>).mockReturnValue({ request: mockRequest })

    const result = await createWishlistCartAction([])
    expect(result.cart).toBeNull()
    expect(result.error).toBeDefined()
  })
})

describe('addWishlistLinesAction', () => {
  it('returns cart on success', async () => {
    const { getClient } = await import('@/lib/shopify')
    const mockRequest = vi.fn().mockResolvedValue({
      data: {
        cartLinesAdd: {
          cart: mockCart,
          userErrors: [],
        },
      },
    })
    ;(getClient as ReturnType<typeof vi.fn>).mockReturnValue({ request: mockRequest })

    const result = await addWishlistLinesAction('wishlist-cart-id', [
      { merchandiseId: 'gid://shopify/ProductVariant/1', quantity: 1 },
    ])
    expect(result.cart).toBeDefined()
    expect(result.error).toBeNull()
  })
})

describe('removeWishlistLinesAction', () => {
  it('returns cart on success', async () => {
    const { getClient } = await import('@/lib/shopify')
    const mockRequest = vi.fn().mockResolvedValue({
      data: {
        cartLinesRemove: {
          cart: mockCart,
          userErrors: [],
        },
      },
    })
    ;(getClient as ReturnType<typeof vi.fn>).mockReturnValue({ request: mockRequest })

    const result = await removeWishlistLinesAction('wishlist-cart-id', ['gid://shopify/CartLine/1'])
    expect(result.cart).toBeDefined()
    expect(result.error).toBeNull()
  })
})

describe('getWishlistCartAction', () => {
  it('returns cart when found', async () => {
    const { getClient } = await import('@/lib/shopify')
    const mockRequest = vi.fn().mockResolvedValue({
      data: { cart: mockCart },
    })
    ;(getClient as ReturnType<typeof vi.fn>).mockReturnValue({ request: mockRequest })

    const result = await getWishlistCartAction('wishlist-cart-id')
    expect(result).toEqual(mockCart)
  })

  it('returns null when cart not found', async () => {
    const { getClient } = await import('@/lib/shopify')
    const mockRequest = vi.fn().mockResolvedValue({
      data: { cart: null },
    })
    ;(getClient as ReturnType<typeof vi.fn>).mockReturnValue({ request: mockRequest })

    const result = await getWishlistCartAction('non-existent-wishlist')
    expect(result).toBeNull()
  })
})

'use server'

import {
  ADD_CART_LINES,
  CREATE_CART,
  CREATE_WISHLIST_CART,
  GET_CART,
  REMOVE_CART_LINES,
  UPDATE_CART_LINES,
} from '@/lib/queries'
import { getClient } from '@/lib/shopify'
import type { CartMutationResponse, CartUserError, ShopifyCart } from '@/lib/types'

const WISHLIST_CART_ATTRIBUTE = { key: 'type', value: 'wishlist' }

type CartMutationResult = {
  cart: ShopifyCart | null
  userErrors?: { field: string[]; message: string; code: string }[]
}

function normalizeUserError(errors: CartMutationResult['userErrors']): CartUserError | null {
  if (!errors?.length) return null
  const e = errors[0]
  return { code: e.code ?? 'UNKNOWN', field: e.field ?? null, message: e.message }
}

export async function createCartAction(
  lines: { merchandiseId: string; quantity: number }[]
): Promise<CartMutationResponse> {
  const shopify = await getClient()

  const { data } = await shopify.request<{
    cartCreate: {
      cart: ShopifyCart | null
      userErrors?: { field: string[]; message: string; code: string }[]
    } | null
  }>(CREATE_CART, {
    variables: {
      cartInput: {
        lines,
      },
    },
  })

  const error = normalizeUserError(data?.cartCreate?.userErrors)
  if (error || !data?.cartCreate?.cart) {
    return { cart: null, error }
  }

  return { cart: data.cartCreate.cart, error: null }
}

export async function addCartLinesAction(
  cartId: string,
  lines: { merchandiseId: string; quantity: number }[]
): Promise<CartMutationResponse> {
  const shopify = await getClient()

  const { data } = await shopify.request<{
    cartLinesAdd: CartMutationResult | null
  }>(ADD_CART_LINES, {
    variables: { cartId, lines },
  })

  const error = normalizeUserError(data?.cartLinesAdd?.userErrors)
  if (error || !data?.cartLinesAdd?.cart) {
    return { cart: null, error }
  }

  return { cart: data.cartLinesAdd.cart, error: null }
}

export async function updateCartLinesAction(
  cartId: string,
  lines: { id: string; quantity: number }[]
): Promise<CartMutationResponse> {
  const shopify = await getClient()

  const { data } = await shopify.request<{
    cartLinesUpdate: CartMutationResult | null
  }>(UPDATE_CART_LINES, {
    variables: { cartId, lines },
  })

  const error = normalizeUserError(data?.cartLinesUpdate?.userErrors)
  if (error || !data?.cartLinesUpdate?.cart) {
    return { cart: null, error }
  }

  return { cart: data.cartLinesUpdate.cart, error: null }
}

export async function removeCartLinesAction(
  cartId: string,
  lineIds: string[]
): Promise<CartMutationResponse> {
  const shopify = await getClient()

  const { data } = await shopify.request<{
    cartLinesRemove: CartMutationResult | null
  }>(REMOVE_CART_LINES, {
    variables: { cartId, lineIds },
  })

  const error = normalizeUserError(data?.cartLinesRemove?.userErrors)
  if (error || !data?.cartLinesRemove?.cart) {
    return { cart: null, error }
  }

  return { cart: data.cartLinesRemove.cart, error: null }
}

export async function getCartAction(cartId: string): Promise<ShopifyCart | null> {
  const shopify = await getClient()

  const { data } = await shopify.request<{ cart: ShopifyCart | null }>(GET_CART, {
    variables: { cartId },
  })

  return data?.cart ?? null
}

// ─── Wishlist Cart ────────────────────────────────────────────────────────────

export async function createWishlistCartAction(
  lines: { merchandiseId: string; quantity: number }[]
): Promise<CartMutationResponse> {
  const shopify = await getClient()

  const { data } = await shopify.request<{
    cartCreate: {
      cart: ShopifyCart | null
      userErrors?: { field: string[]; message: string; code: string }[]
    }
  }>(CREATE_WISHLIST_CART, {
    variables: {
      cartInput: {
        lines,
        attributes: [WISHLIST_CART_ATTRIBUTE],
      },
    },
  })

  const error = normalizeUserError(data?.cartCreate?.userErrors)
  if (error || !data?.cartCreate?.cart) {
    return { cart: null, error }
  }

  return { cart: data.cartCreate.cart, error: null }
}

export async function addWishlistLinesAction(
  cartId: string,
  lines: { merchandiseId: string; quantity: number }[]
): Promise<CartMutationResponse> {
  const shopify = await getClient()

  const { data } = await shopify.request<{
    cartLinesAdd: {
      cart: ShopifyCart | null
      userErrors?: { field: string[]; message: string; code: string }[]
    }
  }>(ADD_CART_LINES, {
    variables: { cartId, lines },
  })

  const error = normalizeUserError(data?.cartLinesAdd?.userErrors)
  if (error || !data?.cartLinesAdd?.cart) {
    return { cart: null, error }
  }

  return { cart: data.cartLinesAdd.cart, error: null }
}

export async function removeWishlistLinesAction(
  cartId: string,
  lineIds: string[]
): Promise<CartMutationResponse> {
  const shopify = await getClient()

  const { data } = await shopify.request<{
    cartLinesRemove: {
      cart: ShopifyCart | null
      userErrors?: { field: string[]; message: string; code: string }[]
    }
  }>(REMOVE_CART_LINES, {
    variables: { cartId, lineIds },
  })

  const error = normalizeUserError(data?.cartLinesRemove?.userErrors)
  if (error || !data?.cartLinesRemove?.cart) {
    return { cart: null, error }
  }

  return { cart: data.cartLinesRemove.cart, error: null }
}

export async function getWishlistCartAction(cartId: string): Promise<ShopifyCart | null> {
  const shopify = await getClient()

  const { data } = await shopify.request<{ cart: ShopifyCart | null }>(GET_CART, {
    variables: { cartId },
  })

  return data?.cart ?? null
}

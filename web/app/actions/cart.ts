'use server'

import {
  ADD_CART_LINES,
  CREATE_CART,
  GET_CART,
  REMOVE_CART_LINES,
  UPDATE_CART_LINES,
} from '@/lib/queries'
import { getClient } from '@/lib/shopify'
import type { ShopifyCart } from '@/lib/types'

type CartMutationResult = {
  cart: ShopifyCart | null
  userErrors?: { field: string[]; message: string }[]
}

export async function createCartAction(
  lines: { merchandiseId: string; quantity: number }[]
): Promise<ShopifyCart | null> {
  const shopify = await getClient()

  const { data } = await shopify.request<{
    cartCreate: { cart: ShopifyCart | null } | null
  }>(CREATE_CART, {
    variables: {
      cartInput: {
        lines,
      },
    },
  })

  if (!data?.cartCreate?.cart) return null

  return data.cartCreate.cart
}

export async function addCartLinesAction(
  cartId: string,
  lines: { merchandiseId: string; quantity: number }[]
): Promise<ShopifyCart | null> {
  const shopify = await getClient()

  const { data } = await shopify.request<{
    cartLinesAdd: CartMutationResult | null
  }>(ADD_CART_LINES, {
    variables: { cartId, lines },
  })

  if (data?.cartLinesAdd?.userErrors?.length) {
    console.error('Shopify cartLinesAdd errors:', data.cartLinesAdd.userErrors)
    return null
  }

  if (!data?.cartLinesAdd?.cart) return null

  return data.cartLinesAdd.cart
}

export async function updateCartLinesAction(
  cartId: string,
  lines: { id: string; quantity: number }[]
): Promise<ShopifyCart | null> {
  const shopify = await getClient()

  const { data } = await shopify.request<{
    cartLinesUpdate: CartMutationResult | null
  }>(UPDATE_CART_LINES, {
    variables: { cartId, lines },
  })

  if (data?.cartLinesUpdate?.userErrors?.length) {
    console.error('Shopify cartLinesUpdate errors:', data.cartLinesUpdate.userErrors)
    return null
  }

  if (!data?.cartLinesUpdate?.cart) return null

  return data.cartLinesUpdate.cart
}

export async function removeCartLinesAction(
  cartId: string,
  lineIds: string[]
): Promise<ShopifyCart | null> {
  const shopify = await getClient()

  const { data } = await shopify.request<{
    cartLinesRemove: CartMutationResult | null
  }>(REMOVE_CART_LINES, {
    variables: { cartId, lineIds },
  })

  if (data?.cartLinesRemove?.userErrors?.length) {
    console.error('Shopify cartLinesRemove errors:', data.cartLinesRemove.userErrors)
    return null
  }

  if (!data?.cartLinesRemove?.cart) return null

  return data.cartLinesRemove.cart
}

export async function getCartAction(cartId: string): Promise<ShopifyCart | null> {
  const shopify = await getClient()

  const { data } = await shopify.request<{ cart: ShopifyCart | null }>(GET_CART, {
    variables: { cartId },
  })

  return data?.cart ?? null
}

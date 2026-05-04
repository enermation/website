'use client'

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  addCartLinesAction,
  createCartAction,
  getCartAction,
  removeCartLinesAction,
  updateCartLinesAction,
} from '@/app/actions/cart'
import type { ShopifyCart, ShopifyMoney } from '@/lib/types'

const CART_ID_STORAGE_KEY = 'shopify_cart_id'

function getStoredCartId(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(CART_ID_STORAGE_KEY)
}

function storeCartId(cartId: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(CART_ID_STORAGE_KEY, cartId)
}

function clearStoredCartId(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(CART_ID_STORAGE_KEY)
}

type CartLineItem = {
  id: string
  merchandiseId: string
  title: string
  productTitle: string
  productHandle: string
  image: { url: string; altText: string | null } | null
  price: ShopifyMoney
  quantity: number
  selectedOptions: { name: string; value: string }[]
}

type CartState = {
  cart: ShopifyCart | null
  lines: CartLineItem[]
  checkoutUrl: string | null
  subtotal: ShopifyMoney
  totalItemCount: number
  isLoading: boolean
  isUpdating: boolean
  cartError: { code: string; message: string } | null
}

type CartContextType = CartState & {
  addToCart: (merchandiseId: string, quantity: number) => Promise<void>
  updateLine: (lineId: string, quantity: number) => Promise<void>
  removeLine: (lineId: string) => Promise<void>
  openCart: () => void
  closeCart: () => void
  isCartOpen: boolean
  refreshCart: () => Promise<void>
  clearCartError: () => void
}

const CartContext = createContext<CartContextType | null>(null)

function mapCartLines(lines: ShopifyCart['lines']['edges']): CartLineItem[] {
  return lines.map(edge => {
    const node = edge.node
    const merchandise = node.merchandise

    return {
      id: node.id,
      merchandiseId: merchandise.id,
      title: merchandise.title,
      productTitle: merchandise.product.title,
      productHandle: merchandise.product.handle,
      image: merchandise.product.images.edges[0]?.node ?? null,
      price: merchandise.price,
      quantity: node.quantity,
      selectedOptions: merchandise.selectedOptions,
    }
  })
}

function computeSubtotal(lines: CartLineItem[]): ShopifyMoney {
  const total = lines.reduce((sum, line) => {
    return sum + parseFloat(line.price.amount) * line.quantity
  }, 0)

  const currency = lines[0]?.price.currencyCode ?? 'USD'

  return {
    amount: total.toFixed(2),
    currencyCode: currency,
  }
}

function computeTotalItemCount(lines: CartLineItem[]): number {
  return lines.reduce((sum, line) => sum + line.quantity, 0)
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<ShopifyCart | null>(null)
  const [lines, setLines] = useState<CartLineItem[]>([])
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [cartError, setCartError] = useState<{ code: string; message: string } | null>(null)

  const loadCart = useCallback(async (cartId: string) => {
    setIsLoading(true)
    const result = await getCartAction(cartId)

    if (!result) {
      clearStoredCartId()
      setCart(null)
      setLines([])
      setCheckoutUrl(null)
      setIsLoading(false)
      return
    }

    setCart(result)
    setLines(mapCartLines(result.lines.edges))
    setCheckoutUrl(result.checkoutUrl)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    const cartId = getStoredCartId()

    if (!cartId) {
      setIsLoading(false)
      return
    }

    void loadCart(cartId)
  }, [loadCart])

  const addToCart = useCallback(async (merchandiseId: string, quantity: number) => {
    if (!merchandiseId) return

    setIsUpdating(true)
    setCartError(null)
    const cartId = getStoredCartId()

    let newCartId: string | null = null

    try {
      if (!cartId) {
        const result = await createCartAction([{ merchandiseId, quantity }])

        if (result.error) {
          setCartError({ code: result.error.code, message: result.error.message })
          setIsUpdating(false)
          return
        }
        if (result.cart) {
          storeCartId(result.cart.id)
          newCartId = result.cart.id
        }
      } else {
        const result = await addCartLinesAction(cartId, [{ merchandiseId, quantity }])

        if (result.error) {
          setCartError({ code: result.error.code, message: result.error.message })
          setIsUpdating(false)
          return
        }
        if (result.cart) {
          newCartId = cartId
        }
      }

      if (newCartId) {
        const fullCart = await getCartAction(newCartId)

        if (fullCart) {
          setCart(fullCart)
          setLines(mapCartLines(fullCart.lines.edges))
          setCheckoutUrl(fullCart.checkoutUrl)
          setIsCartOpen(true)
        }
      }
    } catch {
    } finally {
      setIsUpdating(false)
    }
  }, [])

  const updateLine = useCallback(async (lineId: string, quantity: number) => {
    const cartId = getStoredCartId()

    if (!cartId) return

    setIsUpdating(true)
    setCartError(null)

    try {
      let result: {
        cart: import('@/lib/types').ShopifyCart | null
        error: import('@/lib/types').CartUserError | null
      } | null
      if (quantity <= 0) {
        result = await removeCartLinesAction(cartId, [lineId])
      } else {
        result = await updateCartLinesAction(cartId, [{ id: lineId, quantity }])
      }

      if (result.error) {
        setCartError({ code: result.error.code, message: result.error.message })
        setIsUpdating(false)
        return
      }

      const fullCart = await getCartAction(cartId)

      if (fullCart) {
        setCart(fullCart)
        setLines(mapCartLines(fullCart.lines.edges))
        setCheckoutUrl(fullCart.checkoutUrl)
      }
    } catch {
    } finally {
      setIsUpdating(false)
    }
  }, [])

  const removeLine = useCallback(async (lineId: string) => {
    const cartId = getStoredCartId()

    if (!cartId) return

    setIsUpdating(true)
    setCartError(null)

    try {
      const result = await removeCartLinesAction(cartId, [lineId])

      if (result.error) {
        setCartError({ code: result.error.code, message: result.error.message })
        setIsUpdating(false)
        return
      }

      const fullCart = await getCartAction(cartId)

      if (fullCart) {
        setCart(fullCart)
        setLines(mapCartLines(fullCart.lines.edges))
        setCheckoutUrl(fullCart.checkoutUrl)
      }
    } catch {
    } finally {
      setIsUpdating(false)
    }
  }, [])

  const refreshCart = useCallback(async () => {
    const cartId = getStoredCartId()

    if (!cartId) return
    await loadCart(cartId)
  }, [loadCart])

  const openCart = useCallback(() => setIsCartOpen(true), [])
  const closeCart = useCallback(() => setIsCartOpen(false), [])
  const clearCartError = useCallback(() => setCartError(null), [])

  const subtotal = useMemo(() => computeSubtotal(lines), [lines])
  const totalItemCount = useMemo(() => computeTotalItemCount(lines), [lines])

  const value = useMemo<CartContextType>(
    () => ({
      cart,
      lines,
      checkoutUrl,
      subtotal,
      totalItemCount,
      isLoading,
      isUpdating,
      cartError,
      addToCart,
      updateLine,
      removeLine,
      openCart,
      closeCart,
      isCartOpen,
      refreshCart,
      clearCartError,
    }),
    [
      cart,
      lines,
      checkoutUrl,
      subtotal,
      totalItemCount,
      isLoading,
      isUpdating,
      cartError,
      addToCart,
      updateLine,
      removeLine,
      openCart,
      closeCart,
      isCartOpen,
      refreshCart,
      clearCartError,
    ]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartContextType {
  const context = useContext(CartContext)

  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }

  return context
}

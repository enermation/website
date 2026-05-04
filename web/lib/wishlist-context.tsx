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
  addWishlistLinesAction,
  createWishlistCartAction,
  getWishlistCartAction,
  removeWishlistLinesAction,
} from '@/app/actions/cart'
import type { ShopifyCart, ShopifyMoney } from '@/lib/types'

const WISHLIST_CART_ID_STORAGE_KEY = 'shopify_wishlist_cart_id'

function getStoredWishlistCartId(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(WISHLIST_CART_ID_STORAGE_KEY)
}

function storeWishlistCartId(cartId: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(WISHLIST_CART_ID_STORAGE_KEY, cartId)
}

function clearStoredWishlistCartId(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(WISHLIST_CART_ID_STORAGE_KEY)
}

type WishlistLineItem = {
  id: string
  merchandiseId: string
  title: string
  productTitle: string
  productHandle: string
  image: { url: string; altText: string | null } | null
  price: ShopifyMoney
  quantity: number
}

type WishlistState = {
  lines: WishlistLineItem[]
  isLoading: boolean
  isUpdating: boolean
}

type WishlistContextType = WishlistState & {
  addToWishlist: (merchandiseId: string) => Promise<void>
  removeFromWishlist: (lineId: string) => Promise<void>
  moveToCart: (lineId: string) => Promise<void>
  moveAllToCart: () => Promise<void>
  isInWishlist: (merchandiseId: string) => boolean
  getLineId: (merchandiseId: string) => string | null
}

const WishlistContext = createContext<WishlistContextType | null>(null)

function mapWishlistLines(lines: ShopifyCart['lines']['edges']): WishlistLineItem[] {
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
    }
  })
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<WishlistLineItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)

  const loadWishlist = useCallback(async (cartId: string) => {
    setIsLoading(true)
    const result = await getWishlistCartAction(cartId)

    if (!result) {
      clearStoredWishlistCartId()
      setLines([])
      setIsLoading(false)
      return
    }

    setLines(mapWishlistLines(result.lines.edges))
    setIsLoading(false)
  }, [])

  useEffect(() => {
    const cartId = getStoredWishlistCartId()

    if (!cartId) {
      setIsLoading(false)
      return
    }

    void loadWishlist(cartId)
  }, [loadWishlist])

  const addToWishlist = useCallback(async (merchandiseId: string) => {
    setIsUpdating(true)
    const cartId = getStoredWishlistCartId()

    try {
      if (!cartId) {
        const result = await createWishlistCartAction([{ merchandiseId, quantity: 1 }])

        if (result.cart) {
          storeWishlistCartId(result.cart.id)
          setLines(mapWishlistLines(result.cart.lines.edges))
        }
      } else {
        const result = await addWishlistLinesAction(cartId, [{ merchandiseId, quantity: 1 }])

        if (result.cart) {
          setLines(mapWishlistLines(result.cart.lines.edges))
        }
      }
    } finally {
      setIsUpdating(false)
    }
  }, [])

  const removeFromWishlist = useCallback(async (lineId: string) => {
    const cartId = getStoredWishlistCartId()
    if (!cartId) return

    setIsUpdating(true)

    try {
      const result = await removeWishlistLinesAction(cartId, [lineId])

      if (result.cart) {
        setLines(mapWishlistLines(result.cart.lines.edges))
      }
    } finally {
      setIsUpdating(false)
    }
  }, [])

  const moveToCart = useCallback(async (lineId: string) => {
    const cartId = getStoredWishlistCartId()
    if (!cartId) return

    setIsUpdating(true)

    try {
      const result = await removeWishlistLinesAction(cartId, [lineId])

      if (result.cart) {
        setLines(mapWishlistLines(result.cart.lines.edges))
      }
    } finally {
      setIsUpdating(false)
    }
  }, [])

  const moveAllToCart = useCallback(async () => {
    const cartId = getStoredWishlistCartId()
    if (!cartId) return

    const lineIds = lines.map(l => l.id)

    setIsUpdating(true)

    try {
      const result = await removeWishlistLinesAction(cartId, lineIds)

      if (result.cart) {
        setLines(mapWishlistLines(result.cart.lines.edges))
      }
    } finally {
      setIsUpdating(false)
    }
  }, [lines])

  const isInWishlist = useCallback(
    (merchandiseId: string) => {
      return lines.some(l => l.merchandiseId === merchandiseId)
    },
    [lines]
  )

  const getLineId = useCallback(
    (merchandiseId: string) => {
      const line = lines.find(l => l.merchandiseId === merchandiseId)
      return line?.id ?? null
    },
    [lines]
  )

  const value = useMemo<WishlistContextType>(
    () => ({
      lines,
      isLoading,
      isUpdating,
      addToWishlist,
      removeFromWishlist,
      moveToCart,
      moveAllToCart,
      isInWishlist,
      getLineId,
    }),
    [
      lines,
      isLoading,
      isUpdating,
      addToWishlist,
      removeFromWishlist,
      moveToCart,
      moveAllToCart,
      isInWishlist,
      getLineId,
    ]
  )

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
}

export function useWishlist(): WishlistContextType {
  const context = useContext(WishlistContext)

  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider')
  }

  return context
}

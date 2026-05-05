'use client'

import { Wishlist1 } from '@/components/wishlist1'
import { useCart } from '@/lib/cart-context'
import { useWishlist } from '@/lib/wishlist-context'

export function WishlistClientPage() {
  const { addToCart } = useCart()
  const { lines, removeFromWishlist, moveToCart, moveAllToCart, isUpdating } = useWishlist()

  const items = lines.map(line => ({
    id: line.merchandiseId,
    name: line.productTitle,
    image: line.image?.url ?? '',
    price: parseFloat(line.price.amount),
    inStock: true,
  }))

  const handleMoveToCart = async (merchandiseId: string, lineId: string) => {
    await addToCart(merchandiseId, 1)
    await moveToCart(lineId)
  }

  const handleAddAllToCart = async () => {
    for (const line of lines) {
      await addToCart(line.merchandiseId, line.quantity)
    }
    await moveAllToCart()
  }

  const handleRemove = async (lineId: string) => {
    await removeFromWishlist(lineId)
  }

  return (
    <Wishlist1
      items={items}
      isUpdating={isUpdating}
      lineIdByMerchandiseId={Object.fromEntries(lines.map(l => [l.merchandiseId, l.id]))}
      onMoveToCart={handleMoveToCart}
      onAddAllToCart={handleAddAllToCart}
      onRemove={handleRemove}
    />
  )
}

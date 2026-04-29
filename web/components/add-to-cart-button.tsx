'use client'

import { Banknote, ShoppingCart } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/lib/cart-context'
import { cn } from '@/lib/utils'

type AddToCartButtonProps = {
  merchandiseId: string
  availableForSale: boolean
  className?: string
}

export function AddToCartButton({
  merchandiseId,
  availableForSale,
  className,
}: AddToCartButtonProps) {
  const { addToCart, isUpdating, openCart } = useCart()
  const [isAdding, setIsAdding] = useState(false)

  const disabled = !availableForSale || isUpdating || isAdding || !merchandiseId

  async function handleAddToCart() {
    if (disabled || !merchandiseId) return

    setIsAdding(true)
    await addToCart(merchandiseId, 1)
    setIsAdding(false)
  }

  async function handleBuyNow() {
    if (disabled || !merchandiseId) return

    setIsAdding(true)
    await addToCart(merchandiseId, 1)
    setIsAdding(false)
    openCart()
  }

  return (
    <div className={cn('flex flex-col gap-3 sm:flex-row sm:items-center', className)}>
      <Button
        onClick={handleAddToCart}
        disabled={disabled}
        size="lg"
        className={cn(
          'w-full font-heading text-13 font-semibold uppercase tracking-wider sm:w-auto',
          'bg-brand-green text-background hover:bg-brand-green/90',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
      >
        <ShoppingCart className="mr-2 size-4" aria-hidden="true" />
        {isAdding ? 'Adding...' : 'Add to Cart'}
      </Button>
      <Button
        onClick={handleBuyNow}
        disabled={disabled}
        variant="outline"
        size="lg"
        className={cn(
          'w-full font-heading text-13 font-semibold uppercase tracking-wider sm:w-auto',
          'border-foreground text-foreground hover:bg-foreground hover:text-background',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
      >
        <Banknote className="mr-2 size-4" aria-hidden="true" />
        {isAdding ? 'Adding...' : 'Buy Now'}
      </Button>
    </div>
  )
}

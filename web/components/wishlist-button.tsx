'use client'

import { Heart } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useWishlist } from '@/lib/wishlist-context'

type WishlistButtonProps = {
  merchandiseId: string
  productTitle: string
  className?: string
}

export function WishlistButton({ merchandiseId, productTitle, className }: WishlistButtonProps) {
  const { addToWishlist, removeFromWishlist, isInWishlist, isUpdating, getLineId } = useWishlist()
  const [isToggling, setIsToggling] = useState(false)

  const inWishlist = isInWishlist(merchandiseId)

  async function handleToggle() {
    if (isToggling || isUpdating) return

    setIsToggling(true)

    if (inWishlist) {
      const lineId = getLineId(merchandiseId)
      if (lineId) {
        await removeFromWishlist(lineId)
        toast.success(`Removed from wishlist`)
      }
    } else {
      await addToWishlist(merchandiseId)
      toast.success(`${productTitle} added to wishlist`)
    }

    setIsToggling(false)
  }

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={handleToggle}
      disabled={isToggling || isUpdating}
      aria-label={
        inWishlist ? `Remove ${productTitle} from wishlist` : `Add ${productTitle} to wishlist`
      }
      className={className}
    >
      <Heart
        className={cn(
          'size-5 transition-colors',
          inWishlist ? 'fill-destructive text-destructive' : 'text-muted-foreground'
        )}
        aria-hidden="true"
      />
    </Button>
  )
}

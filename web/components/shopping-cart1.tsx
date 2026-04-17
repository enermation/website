'use client'

import { mdiClose } from '@mdi/js'
import { Icon } from '@mdi/react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useCart } from '@/lib/cart-context'
import { cart } from '@/lib/data'
import { cn, computeLineTotal, formatPrice } from '@/lib/utils'

type ShoppingCart1Props = {
  className?: string
  onCheckoutClick?: () => void
}

export function ShoppingCart1({ className, onCheckoutClick }: ShoppingCart1Props) {
  const { lines, subtotal, removeLine, isUpdating, checkoutUrl } = useCart()

  const handleCheckout = () => {
    if (checkoutUrl) {
      window.location.href = checkoutUrl
    }

    onCheckoutClick?.()
  }

  if (lines.length === 0) {
    return (
      <div className={cn('flex flex-col items-center justify-center py-16', className)}>
        {/* Decorative accent rules */}
        <div className="mb-6 flex items-center gap-2">
          <div className="h-0.5 w-8 bg-brand-green" />
          <div className="h-0.5 w-8 border border-white-solid" />
          <div className="h-0.5 w-8 bg-brand-red" />
        </div>

        <p className="mb-3 font-heading text-section font-semibold uppercase tracking-wider text-on-dark">
          {cart.emptyTitle}
        </p>
        <p className="font-body text-15 text-on-dark-muted">{cart.emptyDescription}</p>
      </div>
    )
  }

  return (
    <div className={cn('grain-overlay relative pt-4 pb-8', className)}>
      {/* Cart items */}
      <div className="space-y-4">
        {lines.map(line => (
          <div
            key={line.id}
            className="group relative rounded-xl border border-white-30 bg-white-5 p-5 transition-all duration-200 hover:border-white-40 hover:bg-white-10 cart-item-in"
          >
            <div className="flex items-start gap-5">
              {/* Product image */}
              <div className="size-20 shrink-0 overflow-hidden rounded-lg bg-white-20">
                {line.image ? (
                  <Image
                    src={line.image.url}
                    alt={line.image.altText ?? line.productTitle}
                    width={80}
                    height={80}
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center text-on-dark-muted">
                    {cart.noImage}
                  </div>
                )}
              </div>

              {/* Product info */}
              <div className="min-w-0 flex-1">
                <h3 className="font-body text-15 font-semibold leading-snug text-on-dark">
                  {line.productTitle}
                </h3>
                {line.selectedOptions.length > 0 && (
                  <p className="mt-1 font-body text-13 text-on-dark-muted">
                    {line.selectedOptions.map(opt => opt.value).join(' / ')}
                  </p>
                )}
                <p className="mt-1 font-body text-13 text-on-dark-muted">
                  {cart.quantityLabel}: {line.quantity}
                </p>
              </div>

              {/* Line total */}
              <div className="shrink-0 text-right">
                <p className="font-heading text-15 font-semibold text-on-dark">
                  {computeLineTotal({
                    amount: line.price.amount,
                    currencyCode: line.price.currencyCode,
                    quantity: line.quantity,
                  })}
                </p>
              </div>

              {/* Remove button */}
              <Button
                variant="ghost"
                size="icon-sm"
                className="relative size-9 shrink-0 text-on-dark-muted transition-colors hover:bg-white-20 hover:text-on-dark"
                onClick={() => removeLine(line.id)}
                disabled={isUpdating}
                aria-label={`Remove ${line.productTitle} from cart`}
              >
                <Icon path={mdiClose} size={1} className="size-4" aria-hidden="true" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="pt-6">
        <Separator className="mb-6 bg-white-20" />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-heading text-15 font-semibold uppercase tracking-wide text-on-dark">
              {cart.subtotalLabel}
            </span>
            <span className="font-heading text-15 font-semibold text-on-dark">
              {formatPrice(subtotal.amount, subtotal.currencyCode)}
            </span>
          </div>

          <Button
            size="lg"
            className="checkout-cta w-full font-heading text-13 font-semibold uppercase tracking-wider text-whiteSolid bg-brand-green hover:bg-brand-green/90 disabled:opacity-50"
            onClick={handleCheckout}
            disabled={isUpdating}
          >
            {cart.checkoutButton}
          </Button>
        </div>
      </div>
    </div>
  )
}

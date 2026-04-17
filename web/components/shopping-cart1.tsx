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
      <section className={cn('py-12', className)}>
        <div className="mx-auto max-w-lg text-center">
          <p className="mb-4 font-heading text-xl text-on-dark">{cart.emptyTitle}</p>
          <p className="mb-8 font-body text-on-dark-muted">{cart.emptyDescription}</p>
        </div>
      </section>
    )
  }

  return (
    <section className={cn('py-12', className)}>
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-8 font-display text-2xl uppercase tracking-widest text-on-dark">
          {cart.title}
        </h1>

        <div className="space-y-4">
          {lines.map(line => (
            <div
              key={line.id}
              className="flex items-center gap-4 rounded-lg border border-white-20 p-4"
            >
              <div className="size-20 shrink-0 overflow-hidden rounded-md bg-white-20">
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

              <div className="flex-1">
                <h3 className="font-body text-base font-medium text-on-dark">
                  {line.productTitle}
                </h3>
                {line.selectedOptions.length > 0 && (
                  <p className="text-sm text-on-dark-muted">
                    {line.selectedOptions.map(opt => opt.value).join(' / ')}
                  </p>
                )}
                <p className="text-sm text-on-dark-muted">
                  {cart.quantityLabel}: {line.quantity}
                </p>
              </div>

              <div className="text-right">
                <p className="font-heading text-base font-semibold text-on-dark">
                  {computeLineTotal({ amount: line.price.amount, currencyCode: line.price.currencyCode, quantity: line.quantity })}
                </p>
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 text-on-dark hover:bg-white-20"
                onClick={() => removeLine(line.id)}
                disabled={isUpdating}
              >
                <Icon path={mdiClose} size={1} className="size-4" aria-hidden="true" />
              </Button>
            </div>
          ))}
        </div>

        <Separator className="my-6 bg-white-20" />

        <div className="space-y-4">
          <div className="flex justify-between text-lg font-semibold text-on-dark">
            <span>{cart.subtotalLabel}</span>
            <span>{formatPrice(subtotal.amount, subtotal.currencyCode)}</span>
          </div>

          <Button
            size="lg"
            className="w-full font-heading text-13 font-semibold uppercase tracking-wider bg-brand-green text-background hover:bg-brand-green/90"
            onClick={handleCheckout}
            disabled={isUpdating}
          >
            {cart.checkoutButton}
          </Button>
        </div>
      </div>
    </section>
  )
}

'use client'

import { useRef } from 'react'
import { useStripeBarAnimation } from '@/hooks/use-stripe-bar-animation'
import { cn } from '@/lib/utils'

type StripeBarProps = {
  dark?: boolean
  className?: string
}

export function StripeBar({ dark = false, className }: StripeBarProps) {
  const stripeRef = useRef<HTMLDivElement>(null)

  useStripeBarAnimation({ elementRef: stripeRef })

  return (
    <div
      ref={stripeRef}
      data-slot="stripe-bar"
      className={cn('flex items-center', className)}
      style={{ transformOrigin: 'center' }}
    >
      <div className="h-1 w-10 bg-brand-green" />
      <div className={cn('h-1 w-10', dark ? 'bg-white' : 'bg-white border border-subtle')} />
      <div className="h-1 w-10 bg-brand-red" />
    </div>
  )
}

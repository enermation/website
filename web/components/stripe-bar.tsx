'use client'

import { useRef } from 'react'
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap'
import { cn } from '@/lib/utils'

type StripeBarProps = {
  dark?: boolean
  className?: string
}

export function StripeBar({ dark = false, className }: StripeBarProps) {
  const stripeRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (!stripeRef.current) return

      gsap.fromTo(
        stripeRef.current,
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: stripeRef.current,
            start: 'top 85%',
            once: true,
          },
        }
      )
    },
    { scope: stripeRef }
  )

  return (
    <div
      ref={stripeRef}
      data-slot="stripe-bar"
      className={cn('flex items-center', className)}
      style={{ transformOrigin: 'center' }}
    >
      <div className="h-1 w-10 bg-brand-green" />
      <div
        className={cn('h-1 w-10', dark ? 'bg-white-solid' : 'bg-white-solid border-white-solid')}
      />
      <div className="h-1 w-10 bg-brand-red" />
    </div>
  )
}

import { useRef } from 'react'
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap'

type StripeBarAnimationOptions = {
  elementRef: React.RefObject<HTMLElement | null>
  duration?: number
  ease?: string
}

export function useStripeBarAnimation({
  elementRef,
  duration = 0.8,
  ease = 'power2.out',
}: StripeBarAnimationOptions) {
  useGSAP(
    () => {
      if (!elementRef.current) return

      gsap.fromTo(
        elementRef.current,
        { scaleX: 0 },
        {
          scaleX: 1,
          duration,
          ease,
          scrollTrigger: {
            trigger: elementRef.current,
            start: 'top 85%',
            once: true,
          },
        }
      )
    },
    { scope: elementRef }
  )
}

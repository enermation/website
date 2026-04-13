import { useRef } from 'react'
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap'

type HeroParallaxOptions = {
  triggerRef: React.RefObject<HTMLElement | null>
  imageRef: React.RefObject<HTMLElement | null>
}

export function useHeroParallax({ triggerRef, imageRef }: HeroParallaxOptions) {
  useGSAP(
    () => {
      if (!triggerRef.current || !imageRef.current) return

      gsap.to(imageRef.current, {
        y: 150,
        ease: 'none',
        scrollTrigger: {
          trigger: triggerRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      })
    },
    { scope: triggerRef }
  )
}

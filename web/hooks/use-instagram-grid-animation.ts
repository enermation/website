import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap'

type InstagramGridAnimationOptions = {
  containerRef: React.RefObject<HTMLElement | null>
  stagger?: number
  duration?: number
  ease?: string
}

export function useInstagramGridAnimation({
  containerRef,
  stagger = 0.05,
  duration = 0.4,
  ease = 'power2.out',
}: InstagramGridAnimationOptions) {
  useGSAP(
    () => {
      if (!containerRef.current) return

      const items = containerRef.current.querySelectorAll('[data-instagram-item]')

      // Set initial state
      gsap.set(items, { opacity: 0, scale: 0.8 })

      ScrollTrigger.batch(items, {
        start: 'top 85%',
        once: true,
        onEnter: elements => {
          gsap.to(elements, {
            opacity: 1,
            scale: 1,
            duration,
            ease,
            stagger: {
              each: stagger,
              from: 'random',
            },
            overwrite: true,
          })
        },
      })
    },
    { scope: containerRef }
  )
}

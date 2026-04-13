import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap'

type ScrollRevealOptions = {
  stagger?: number
  duration?: number
  ease?: string
  once?: boolean
  start?: string
}

export function useScrollReveal(
  containerRef: React.RefObject<HTMLElement | null>,
  options: ScrollRevealOptions = {}
) {
  const {
    stagger = 0.1,
    duration = 0.6,
    ease = 'power2.out',
    once = true,
    start = 'top 85%',
  } = options

  useGSAP(
    () => {
      if (!containerRef.current) return

      const items = containerRef.current.querySelectorAll('[data-reveal]')

      // Set initial state
      gsap.set(items, { opacity: 0, y: 40 })

      ScrollTrigger.batch(items, {
        start,
        once,
        onEnter: elements => {
          gsap.to(elements, {
            opacity: 1,
            y: 0,
            duration,
            ease,
            stagger,
            overwrite: true,
          })
        },
      })
    },
    { scope: containerRef }
  )
}

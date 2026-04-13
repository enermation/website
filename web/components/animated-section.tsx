'use client'

import { useRef } from 'react'
import { useInstagramGridAnimation } from '@/hooks/use-instagram-grid-animation'
import { useScrollReveal } from '@/hooks/use-scroll-reveal'
import { cn } from '@/lib/utils'

type AnimatedSectionProps = {
  children: React.ReactNode
  className?: string
  stagger?: number
}

export function AnimatedSection({ children, className, stagger = 0.15 }: AnimatedSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useScrollReveal(containerRef, { stagger })

  return (
    <div ref={containerRef} className={cn(className)}>
      {children}
    </div>
  )
}

export function InstagramGrid({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null)

  useInstagramGridAnimation({ containerRef })

  return <div ref={containerRef}>{children}</div>
}

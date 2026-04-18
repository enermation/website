'use client'

import { TextHoverEffect } from '@/components/ui/text-hover-effect'

type HeroBrandTextProps = {
  text: string
}

export function HeroBrandText({ text }: HeroBrandTextProps) {
  return (
    <div className="hero-stage__text-hover">
      <TextHoverEffect text={text} />
    </div>
  )
}

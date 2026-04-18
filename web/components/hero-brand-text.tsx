'use client'

import { motion } from 'motion/react'
import { useEffect, useId, useState } from 'react'

const SWEEP_START_POSITION = {
  cx: '112%',
  cy: '50%',
}

const SWEEP_END_POSITION = {
  cx: '-12%',
  cy: '50%',
}

const STATIC_POSITION = {
  cx: '50%',
  cy: '50%',
}

type HeroBrandTextProps = {
  text: string
  sweepActive: boolean
  prefersReducedMotion: boolean
}

export function HeroBrandText({ text, sweepActive, prefersReducedMotion }: HeroBrandTextProps) {
  const gradientId = useId().replace(/:/g, '')
  const textGradientId = `${gradientId}-text-gradient`
  const revealMaskId = `${gradientId}-reveal-mask`
  const textMaskId = `${gradientId}-text-mask`
  const [maskPosition, setMaskPosition] = useState(
    prefersReducedMotion ? STATIC_POSITION : SWEEP_START_POSITION
  )

  useEffect(() => {
    if (prefersReducedMotion) {
      setMaskPosition(STATIC_POSITION)
      return
    }

    setMaskPosition(sweepActive ? SWEEP_END_POSITION : SWEEP_START_POSITION)
  }, [prefersReducedMotion, sweepActive])

  return (
    <svg
      aria-label={text}
      className="hero-stage__text-svg"
      role="img"
      viewBox="0 0 1200 240"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient
          id={textGradientId}
          x1="100%"
          x2="0%"
          y1="50%"
          y2="50%"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="var(--hero-spectrum-1)" />
          <stop offset="22%" stopColor="var(--hero-spectrum-2)" />
          <stop offset="44%" stopColor="var(--hero-spectrum-3)" />
          <stop offset="66%" stopColor="var(--hero-spectrum-4)" />
          <stop offset="84%" stopColor="var(--hero-spectrum-5)" />
          <stop offset="100%" stopColor="var(--hero-spectrum-6)" />
        </linearGradient>

        <motion.radialGradient
          id={revealMaskId}
          initial={prefersReducedMotion ? STATIC_POSITION : SWEEP_START_POSITION}
          animate={maskPosition}
          r={prefersReducedMotion ? '120%' : '24%'}
          transition={{
            duration: prefersReducedMotion ? 0 : 1.2,
            ease: [0.16, 1, 0.3, 1],
          }}
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="white" />
          <stop offset="48%" stopColor="white" />
          <stop offset="100%" stopColor="black" />
        </motion.radialGradient>

        <mask id={textMaskId}>
          <rect x="0" y="0" width="100%" height="100%" fill={`url(#${revealMaskId})`} />
        </mask>
      </defs>

      <text
        x="50%"
        y="52%"
        textAnchor="middle"
        dominantBaseline="middle"
        className="hero-stage__text-svg-base"
      >
        {text}
      </text>

      <motion.text
        x="50%"
        y="52%"
        textAnchor="middle"
        dominantBaseline="middle"
        className="hero-stage__text-svg-outline"
        initial={{ strokeDashoffset: 1000, strokeDasharray: 1000 }}
        animate={{
          strokeDashoffset: 0,
          strokeDasharray: 1000,
        }}
        transition={{
          duration: prefersReducedMotion ? 0 : 3.4,
          ease: 'easeInOut',
        }}
      >
        {text}
      </motion.text>

      <text
        x="50%"
        y="52%"
        textAnchor="middle"
        dominantBaseline="middle"
        className="hero-stage__text-svg-reveal"
        mask={`url(#${textMaskId})`}
        stroke={`url(#${textGradientId})`}
      >
        {text}
      </text>
    </svg>
  )
}

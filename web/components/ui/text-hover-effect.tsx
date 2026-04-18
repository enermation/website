'use client'

import { motion } from 'motion/react'

const STROKE_WIDTH = 0.8
const DRAW_DURATION = 4

export function TextHoverEffect({ text }: { text: string }) {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 300 100"
      xmlns="http://www.w3.org/2000/svg"
      textRendering="geometricPrecision"
      className="select-none"
      aria-label={text}
      role="img"
    >
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        strokeWidth={STROKE_WIDTH}
        vectorEffect="non-scaling-stroke"
        className="fill-transparent font-heading text-7xl font-bold"
        style={{ stroke: 'var(--white-30)' }}
      >
        {text}
      </text>
      <motion.text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        strokeWidth={STROKE_WIDTH}
        vectorEffect="non-scaling-stroke"
        className="fill-transparent font-heading text-7xl font-bold"
        style={{ stroke: 'var(--white-70)' }}
        initial={{ strokeDashoffset: 1000, strokeDasharray: 1000 }}
        animate={{ strokeDashoffset: 0, strokeDasharray: 1000 }}
        transition={{ duration: DRAW_DURATION, ease: 'easeInOut' }}
      >
        {text}
      </motion.text>
    </svg>
  )
}

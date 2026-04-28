'use client'

import { motion } from 'motion/react'

const STROKE_WIDTH = 0.8
const DRAW_DURATION = 3
const TRAIL_DURATION = 3.5

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
      {/* Static base layer */}
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        strokeWidth={STROKE_WIDTH}
        vectorEffect="non-scaling-stroke"
        className="fill-transparent font-display text-7xl font-normal"
        style={{ stroke: 'var(--white-30)' }}
      >
        {text}
      </text>
      {/* First draw - main stroke */}
      <motion.text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        strokeWidth={STROKE_WIDTH}
        vectorEffect="non-scaling-stroke"
        className="fill-transparent font-display text-7xl font-normal"
        style={{ stroke: 'var(--white-70)' }}
        initial={{ strokeDashoffset: 1000, strokeDasharray: 1000 }}
        animate={{ strokeDashoffset: 0, strokeDasharray: 1000 }}
        transition={{ duration: DRAW_DURATION, ease: 'easeInOut' }}
      >
        {text}
      </motion.text>
      {/* Second draw - trailing echo */}
      <motion.text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        strokeWidth={STROKE_WIDTH * 0.6}
        vectorEffect="non-scaling-stroke"
        className="fill-transparent font-display text-7xl font-normal"
        style={{ stroke: 'var(--white-50)' }}
        initial={{ strokeDashoffset: 1000, strokeDasharray: 1000 }}
        animate={{ strokeDashoffset: 0, strokeDasharray: 1000 }}
        transition={{
          duration: TRAIL_DURATION,
          ease: 'easeOut',
          delay: 0.15,
        }}
      >
        {text}
      </motion.text>
    </svg>
  )
}

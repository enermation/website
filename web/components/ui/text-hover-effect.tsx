'use client'

const STROKE_WIDTH = 0.8

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
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        strokeWidth={STROKE_WIDTH}
        vectorEffect="non-scaling-stroke"
        className="fill-transparent font-display text-7xl font-normal text-draw-primary"
        style={{ stroke: 'var(--white-70)', strokeDasharray: 1000 }}
      >
        {text}
      </text>
      {/* Second draw - trailing echo */}
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        strokeWidth={STROKE_WIDTH * 0.6}
        vectorEffect="non-scaling-stroke"
        className="fill-transparent font-display text-7xl font-normal text-draw-trail"
        style={{ stroke: 'var(--white-50)', strokeDasharray: 1000 }}
      >
        {text}
      </text>
    </svg>
  )
}

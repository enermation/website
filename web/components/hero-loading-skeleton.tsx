'use client'

export function HeroLoadingSkeleton() {
  return (
    <div className="relative min-h-screen bg-surface-dark flex items-center justify-center">
      {/* Pulsing placeholder */}
      <div className="flex flex-col items-center gap-6 animate-pulse">
        <div className="size-32 rounded-full bg-on-dark/10" />
        <div className="h-4 w-48 rounded bg-on-dark/10" />
        <div className="h-3 w-32 rounded bg-on-dark/10" />
      </div>
    </div>
  )
}

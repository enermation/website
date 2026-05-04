import { Skeleton } from '@/components/ui/skeleton'

const SKELETON_KEYS = ['a', 'b', 'c', 'd', 'e', 'f'] as const

export default function Loading() {
  return (
    <>
      {/* Header skeleton */}
      <Skeleton className="h-16 w-full" />

      {/* Desktop sub-navigation skeleton */}
      <nav
        aria-label="Collection navigation"
        className="hidden md:block border-b border-border bg-background"
      >
        <div className="max-w-site mx-auto flex justify-center">
          <div className="flex">
            {[1, 2, 3, 4, 5].map(i => (
              <Skeleton key={i} className="h-12 w-24 mx-1" />
            ))}
          </div>
        </div>
      </nav>

      {/* Mobile sub-navigation skeleton */}
      <nav
        aria-label="Mobile collection navigation"
        className="border-b border-border bg-background md:hidden"
      >
        <div className="flex gap-4 px-4 py-3 overflow-x-auto">
          {[1, 2, 3, 4, 5].map(i => (
            <Skeleton key={i} className="h-10 w-24 shrink-0" />
          ))}
        </div>
      </nav>

      {/* Content skeleton */}
      <section className="relative bg-background py-3 md:py-6 overflow-hidden">
        <div className="relative z-10 max-w-site mx-auto px-3">
          {/* Filter bar skeleton */}
          <div className="mb-6 flex flex-wrap gap-3">
            <Skeleton className="h-9 w-40" />
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-9 w-36 ml-auto" />
          </div>

          {/* Product grid skeleton */}
          <div className="grid grid-cols-1 gap-y-6 md:grid-cols-3 md:gap-6">
            {SKELETON_KEYS.map((k, i) => (
              <div
                key={k}
                className="animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                {/* Card image */}
                <div className="aspect-[3/2] w-full overflow-hidden rounded-xl border border-border bg-card">
                  <Skeleton className="h-full w-full" />
                </div>

                {/* Card content */}
                <div className="flex grow flex-col p-3">
                  <div className="flex items-start justify-between gap-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-5 w-5" />
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <div className="mt-auto flex items-end justify-between pt-3">
                    <Skeleton className="h-6 w-24" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

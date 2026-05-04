import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <>
      {/* Header skeleton */}
      <Skeleton className="h-16 w-full" />

      {/* Page content */}
      <main className="flex-1 bg-background">
        <div className="container max-w-6xl mx-auto px-4 py-16 md:py-24">
          {/* Header skeleton */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <Skeleton className="h-9 w-48" />
              <Skeleton className="mt-1 h-5 w-32" />
            </div>
            <Skeleton className="h-10 w-40" />
          </div>

          {/* Wishlist grid skeleton - mirrors Wishlist1 grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className="group gap-0 overflow-hidden rounded-xl border border-border bg-card"
              >
                {/* Image */}
                <div className="relative aspect-square bg-muted">
                  <Skeleton className="h-full w-full" />
                  {/* Badges placeholder */}
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    <Skeleton className="h-5 w-20" />
                  </div>
                  {/* Remove button placeholder */}
                  <div className="absolute top-3 right-3">
                    <Skeleton className="h-8 w-8" />
                  </div>
                </div>
                {/* Content */}
                <div className="p-4">
                  <Skeleton className="h-5 w-3/4" />
                  <div className="mt-2 flex items-center gap-2">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="mt-4 h-10 w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  )
}

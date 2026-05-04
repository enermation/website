import { Skeleton } from '@/components/ui/skeleton'

const RESULT_SKELETON_KEYS = ['a', 'b', 'c', 'd', 'e', 'f'] as const

export default function Loading() {
  return (
    <>
      {/* Header skeleton */}
      <Skeleton className="h-16 w-full" />

      {/* Search heading skeleton */}
      <section className="bg-background border-b border-gray-90 px-3 py-10 text-center">
        <Skeleton className="mx-auto h-8 w-64" />
        <Skeleton className="mx-auto mt-3 h-4 w-48" />
        <div className="mt-6 flex justify-center">
          <Skeleton className="h-1 w-32" />
        </div>
      </section>

      {/* Results skeleton */}
      <section className="bg-background py-8 md:py-12">
        <div className="max-w-site mx-auto px-3">
          <div className="grid grid-cols-1 gap-y-6 md:grid-cols-3 md:gap-6">
            {RESULT_SKELETON_KEYS.map((k, i) => (
              <div
                key={k}
                className="animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                {/* Card - mirrors SearchResultCard structure */}
                <div className="flex flex-col rounded-2xl border border-gray-90 bg-card overflow-hidden">
                  {/* Image */}
                  <div className="relative aspect-[3/2] overflow-hidden bg-muted">
                    <Skeleton className="h-full w-full" />
                  </div>
                  {/* Content */}
                  <div className="flex flex-col gap-1 p-4">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-3 w-16 mt-1" />
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

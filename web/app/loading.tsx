import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="min-h-full flex flex-col">
      {/* Header skeleton */}
      <Skeleton className="h-16 w-full" />

      {/* Hero skeleton */}
      <div className="bg-surface-elevated">
        <div className="max-w-site mx-auto px-4 py-16">
          <div className="flex flex-col items-center gap-6">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-12 w-96" />
          </div>
        </div>
      </div>

      {/* Latest Arrivals skeleton */}
      <section className="bg-card">
        <div className="mx-auto max-w-site px-4 pb-14 pt-8 md:pt-12 md:px-6 md:pb-16">
          <div className="flex flex-col items-center gap-4 mb-8">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-1 w-32" />
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-6">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className="animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <Skeleton className="aspect-[3/2] w-full rounded-xl" />
                <div className="mt-4 flex flex-col gap-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <div className="mt-2 flex gap-2">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Collections skeleton */}
      <section className="bg-card">
        <div className="mx-auto max-w-site px-4 md:px-6">
          <div className="flex flex-col items-center gap-4 py-12">
            <Skeleton className="h-8 w-56" />
            <Skeleton className="h-1 w-32" />
          </div>
          <div className="grid grid-cols-3 gap-8 pb-16">
            {[1, 2, 3].map(i => (
              <div key={i}>
                <Skeleton className="aspect-[3/2] w-full rounded-xl" />
                <div className="mt-3 flex flex-col gap-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Instagram placeholder */}
      <section className="bg-muted px-4 py-16 md:px-20 md:py-20">
        <div className="mx-auto max-w-site">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-4">
            <Skeleton className="col-span-2 aspect-square rounded-xl" />
            <Skeleton className="aspect-square rounded-xl" />
            <Skeleton className="aspect-square rounded-xl" />
            <Skeleton className="aspect-square rounded-xl hidden lg:block" />
          </div>
        </div>
      </section>
    </div>
  )
}

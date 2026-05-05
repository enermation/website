import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <>
      {/* Header skeleton */}
      <Skeleton className="h-16 w-full" />

      {/* Hero section skeleton */}
      <section className="bg-surface py-20 lg:py-32">
        <div className="mx-auto max-w-site px-4 md:px-6 text-center">
          <Skeleton className="mx-auto h-4 w-24" />
          <Skeleton className="mx-auto mt-4 h-12 w-64" />
          <Skeleton className="mx-auto mt-6 h-5 w-96" />
        </div>
      </section>

      {/* Blog posts grid skeleton - mirrors BlogCardGrid structure */}
      <section className="bg-background py-16 lg:py-24">
        <div className="mx-auto max-w-site px-4 md:px-6">
          <div className="flex flex-col items-center">
            <Skeleton className="mt-6 h-16 w-64" />
          </div>
          <div className="mt-6 grid gap-6 md:mt-8 md:grid-cols-2 lg:mt-10 lg:grid-cols-3 lg:gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div
                key={i}
                className="animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                {/* Card - mirrors BlogCardGrid Card structure */}
                <div className="grid grid-rows-[auto_auto_1fr_auto] overflow-hidden rounded-xl border border-border bg-card pt-0">
                  {/* Image */}
                  <div className="aspect-video w-full">
                    <Skeleton className="h-full w-full" />
                  </div>
                  {/* Header */}
                  <div className="p-4 pb-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="mt-2 h-4 w-1/2" />
                  </div>
                  {/* Content */}
                  <div className="p-4 pt-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="mt-2 h-4 w-2/3" />
                  </div>
                  {/* Footer */}
                  <div className="p-4 pt-0">
                    <Skeleton className="h-4 w-24" />
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

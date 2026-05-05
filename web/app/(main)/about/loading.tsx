import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <>
      {/* Header skeleton */}
      <Skeleton className="h-16 w-full" />

      {/* Page content */}
      <main className="flex-1 bg-background">
        <div className="mx-auto max-w-site px-4 py-20 lg:py-32 text-center">
          <Skeleton className="mx-auto h-12 w-64" />
          <Skeleton className="mx-auto mt-8 h-1 w-48" />
          <Skeleton className="mx-auto mt-8 h-6 w-96" />
          <Skeleton className="mx-auto mt-4 h-6 w-80" />
        </div>

        {/* Narrative sections skeleton */}
        <div className="bg-card">
          {[1, 2, 3].map(i => (
            <div key={i} className="mx-auto max-w-site px-4 md:px-6 py-12 lg:py-20">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                <Skeleton className="aspect-[3/2] w-full rounded-xl" />
                <div className="flex flex-col gap-6">
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-1 w-24" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA section skeleton */}
        <div className="bg-muted py-20 lg:py-24">
          <div className="mx-auto max-w-site px-4 md:px-6 text-center">
            <Skeleton className="mx-auto h-8 w-64" />
            <Skeleton className="mx-auto mt-8 h-1 w-32" />
            <Skeleton className="mx-auto mt-10 h-12 w-48" />
          </div>
        </div>
      </main>
    </>
  )
}

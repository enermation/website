import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <>
      {/* Header skeleton */}
      <Skeleton className="h-16 w-full" />

      {/* Article hero skeleton - mirrors BlogPost structure */}
      <section className="bg-background py-32">
        <div className="container mx-auto">
          <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 text-center">
            <Skeleton className="h-14 w-3/4" />
            <Skeleton className="h-6 w-96" />
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
          <div className="mx-auto mt-8 mb-8 max-w-5xl">
            <Skeleton className="aspect-video w-full rounded-lg" />
          </div>
        </div>
      </section>

      {/* Article content skeleton */}
      <section className="bg-background py-12">
        <div className="container mx-auto">
          <div className="mx-auto max-w-3xl">
            <div className="flex flex-col gap-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

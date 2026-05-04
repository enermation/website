import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <>
      {/* Header skeleton */}
      <Skeleton className="h-16 w-full" />

      {/* Breadcrumb skeleton */}
      <div className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-site items-center gap-2 px-6 py-3">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-40" />
        </div>
      </div>

      {/* Gallery skeleton */}
      <section className="bg-background">
        <div className="mx-auto max-w-site px-4 md:px-6 md:pt-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
            <Skeleton className="aspect-[4/3] w-full rounded-xl" />
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              <Skeleton className="aspect-square rounded-xl" />
              <Skeleton className="aspect-square rounded-xl" />
              <Skeleton className="aspect-square rounded-xl hidden md:block" />
              <Skeleton className="aspect-square rounded-xl hidden md:block" />
            </div>
          </div>
        </div>
      </section>

      {/* Product info skeleton */}
      <section className="bg-background">
        <div className="mx-auto max-w-site px-4 py-6 md:px-6 md:py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 md:gap-10">
            <div className="md:col-span-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-2 h-8 w-3/4" />
              <Skeleton className="mt-4 h-4 w-16" />
              <Skeleton className="mt-6 h-32 w-full" />
              <Skeleton className="mt-6 h-20 w-full" />
            </div>
            <aside className="hidden md:block">
              <Skeleton className="h-48 w-full rounded-2xl" />
            </aside>
          </div>
        </div>
      </section>

      {/* Similar cars section */}
      <div className="bg-muted py-12 md:py-16">
        <div className="mx-auto max-w-site px-4 md:px-6">
          <Skeleton className="mx-auto mb-8 h-8 w-48" />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <Skeleton className="aspect-[3/2] w-full rounded-xl" />
            <Skeleton className="aspect-[3/2] w-full rounded-xl" />
            <Skeleton className="aspect-[3/2] w-full rounded-xl" />
          </div>
        </div>
      </div>
    </>
  )
}

import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <>
      {/* Header skeleton */}
      <Skeleton className="h-16 w-full" />

      {/* Page content */}
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-site px-4 py-20 md:px-6">
          <Skeleton className="mx-auto h-10 w-48" />
          <Skeleton className="mx-auto mt-4 h-5 w-64" />
        </div>
      </main>
    </>
  )
}

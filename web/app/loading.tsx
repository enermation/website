import { Skeleton } from '@/components/ui/skeleton'

const SKELETON_KEYS = ['a', 'b', 'c', 'd', 'e', 'f'] as const

export default function Loading() {
  return (
    <div className="max-w-site mx-auto px-3">
      <div className="mb-4 flex flex-wrap items-end gap-4 rounded-2xl border border-border border-t-2 border-t-brand-green bg-surface-elevated px-6 py-5 shadow-sm">
        <div className="flex flex-col gap-1">
          <Skeleton className="h-3 w-16 rounded" />
          <Skeleton className="h-10 w-40 rounded-sm border border-select-border bg-background" />
        </div>
        <div className="flex flex-col gap-1">
          <Skeleton className="h-3 w-16 rounded" />
          <Skeleton className="h-10 w-40 rounded-sm border border-select-border bg-background" />
        </div>
        <div className="ml-auto flex flex-col gap-1">
          <Skeleton className="h-3 w-16 rounded" />
          <Skeleton className="h-10 w-44 rounded-sm border border-select-border bg-background" />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-y-6 md:grid-cols-3 md:gap-6">
        {SKELETON_KEYS.map((k, i) => (
          <div
            key={k}
            className="animate-in fade-in slide-in-from-bottom-4"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <Skeleton className="h-64 w-full rounded-xl bg-muted" />
            <div className="mt-3 flex flex-col gap-2">
              <Skeleton className="h-4 w-3/4 rounded" />
              <Skeleton className="h-3 w-1/2 rounded" />
              <Skeleton className="h-6 w-1/3 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

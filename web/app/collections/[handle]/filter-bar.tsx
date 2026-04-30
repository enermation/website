'use client'

import { Bars3Icon, Squares2X2Icon } from '@heroicons/react/24/outline'
import { X } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { sortOptions } from '@/lib/data'
import type { ActiveFilters, FilterDimension } from '@/lib/types'
import { cn } from '@/lib/utils'

type FilterBarProps = {
  dimensions: FilterDimension[]
  active: ActiveFilters
  currentSort?: string
  totalCount: number
  filteredCount: number
}

export function FilterBar({
  dimensions,
  active,
  currentSort,
  totalCount,
  filteredCount,
}: FilterBarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (!value || value === 'Show All') {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    const query = params.toString()
    startTransition(() => {
      router.push(query ? `${pathname}?${query}` : pathname)
    })
  }

  function resetFilters() {
    const params = new URLSearchParams()
    // Preserve only the sort param if set
    if (currentSort) {
      params.set('sort', currentSort)
    }
    const query = params.toString()
    startTransition(() => {
      router.push(query ? `${pathname}?${query}` : pathname)
    })
  }

  const activeEntries = Object.entries(active).filter(([, v]) => v)
  const hasActiveFilters = activeEntries.length > 0

  return (
    <>
      {/* ── Mobile ──────────────────────────────────────────────── */}
      <div className="flex flex-col gap-6 md:hidden">
        {/* Active filter chips + sort row */}
        <div className="flex flex-col gap-3 px-3">
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2">
              {activeEntries.map(([key, value]) => (
                <button
                  type="button"
                  key={key}
                  onClick={() => updateParam(key, null)}
                  className="flex items-center gap-1.5 rounded-full bg-foreground px-3 py-1 font-body text-xs font-medium text-background transition-opacity hover:opacity-80"
                >
                  {value}
                  <X className="size-3" aria-hidden="true" />
                </button>
              ))}
              <button
                type="button"
                onClick={resetFilters}
                className="rounded-full border border-border px-3 py-1 font-body text-xs text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
              >
                Clear all
              </button>
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="font-body text-sm text-muted-foreground">
              {filteredCount === totalCount
                ? `${totalCount} results`
                : `${filteredCount} of ${totalCount}`}
            </span>
            <div className="ml-auto flex items-center gap-2">
              {/* Sort */}
              <Select
                value={currentSort ?? 'price-desc'}
                onValueChange={value => updateParam('sort', value)}
                disabled={isPending}
              >
                <SelectTrigger className="h-9 w-40 rounded-sm border-select-border bg-background font-body text-sm text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map(o => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {/* Filter sheet trigger */}
              <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <SheetTrigger
                  render={
                    <Button
                      aria-label="Open filters"
                      className="h-9 rounded-sm border-2 border-foreground bg-foreground px-3 font-heading text-xs font-semibold uppercase tracking-wide text-background hover:bg-foreground/90"
                    >
                      <Bars3Icon className="size-4 mr-1" aria-hidden="true" />
                      Filter
                      {hasActiveFilters && (
                        <span className="ml-1.5 flex size-4 items-center justify-center rounded-full bg-background text-foreground">
                          {activeEntries.length}
                        </span>
                      )}
                    </Button>
                  }
                />
                <SheetContent
                  side="right"
                  showCloseButton={true}
                  className="w-72 gap-10 border-none bg-surface-dark p-0 text-background sm:max-w-none"
                >
                  <div className="flex flex-col gap-10 overflow-y-auto py-12">
                    <div className="px-8">
                      <SheetTitle className="font-heading text-lg font-semibold uppercase tracking-widest text-on-dark-muted">
                        Filter By
                      </SheetTitle>
                      <div className="mt-4 h-0.5 w-10 bg-white/30" />
                    </div>

                    <div className="flex flex-col gap-6 px-8">
                      {dimensions.map(dim => (
                        <div key={dim.key} className="flex flex-col gap-2">
                          <label
                            htmlFor={`mobile-${dim.key}`}
                            className="font-heading text-13 font-semibold uppercase tracking-wide text-on-dark-muted"
                          >
                            {dim.label}
                          </label>
                          <Select
                            value={active[dim.key] ?? 'Show All'}
                            onValueChange={value => updateParam(dim.key, value)}
                            disabled={isPending}
                          >
                            <SelectTrigger
                              id={`mobile-${dim.key}`}
                              className="h-10 w-full rounded-sm border-white/20 bg-white/10 px-3 font-body text-base text-background"
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Show All">All {dim.label}s</SelectItem>
                              {dim.options.map(opt => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  {opt.label} ({opt.count})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      ))}
                    </div>

                    <div className="px-8">
                      <Button
                        variant="outline"
                        onClick={resetFilters}
                        disabled={isPending}
                        className="h-10 w-full justify-center rounded-sm border-2 border-white/20 bg-white/10 font-heading text-xs font-semibold uppercase tracking-wide text-background hover:bg-white/20"
                      >
                        <Squares2X2Icon className="mr-2 size-3.5" aria-hidden="true" />
                        View All
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>

      {/* ── Desktop ────────────────────────────────────────────── */}
      <div className="hidden md:block">
        {/* Active filter chips */}
        {hasActiveFilters && (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="font-body text-sm text-muted-foreground">
              {filteredCount === totalCount
                ? `${totalCount} results`
                : `${filteredCount} of ${totalCount}`}
            </span>
            <span className="text-muted-foreground">·</span>
            {activeEntries.map(([key, value]) => (
              <button
                type="button"
                key={key}
                onClick={() => updateParam(key, null)}
                className="flex items-center gap-1.5 rounded-full bg-foreground px-3 py-1 font-body text-xs font-medium text-background transition-opacity hover:opacity-80"
              >
                {value}
                <X className="size-3" aria-hidden="true" />
              </button>
            ))}
            <button
              type="button"
              onClick={resetFilters}
              className="rounded-full border border-border px-3 py-1 font-body text-xs text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Filter bar */}
        <div className="rounded-2xl border border-border border-t-2 border-t-brand-green bg-surface-elevated px-6 py-5 shadow-sm">
          <div className="flex flex-wrap items-end gap-0">
            {/* Filter dimensions */}
            {dimensions.map(dim => (
              <div key={dim.key} className="flex min-w-0 shrink-0 flex-col gap-1 px-3 pt-6">
                <label
                  htmlFor={`desktop-${dim.key}`}
                  className={cn(
                    'font-heading font-semibold text-13 uppercase tracking-wider transition-colors',
                    active[dim.key] && active[dim.key] !== 'Show All'
                      ? 'text-brand-green'
                      : 'text-foreground'
                  )}
                >
                  {dim.label}
                </label>
                <Select
                  value={active[dim.key] ?? 'Show All'}
                  onValueChange={value => updateParam(dim.key, value)}
                  disabled={isPending}
                >
                  <SelectTrigger
                    id={`desktop-${dim.key}`}
                    className="h-10 w-full border border-select-border bg-background px-3 font-body text-base text-foreground"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Show All">All {dim.label}s</SelectItem>
                    {dim.options.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label} ({opt.count})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}

            {/* Sort + actions */}
            <div className="ml-auto flex items-end gap-0 px-3 pt-6">
              <div className="flex min-w-0 shrink-0 flex-col gap-1">
                <label
                  htmlFor="desktop-sort"
                  className="font-heading font-semibold text-13 text-foreground uppercase tracking-wider"
                >
                  Sort By
                </label>
                <Select
                  value={currentSort ?? 'price-desc'}
                  onValueChange={value => updateParam('sort', value)}
                  disabled={isPending}
                >
                  <SelectTrigger
                    id="desktop-sort"
                    className="h-10 w-44 border border-select-border bg-background px-3 font-body text-base text-foreground"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map(o => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={resetFilters}
                disabled={isPending}
                aria-label="View all products and reset filters"
                className="ml-4 h-10 border-2 border-foreground px-4 font-heading text-xs font-semibold uppercase tracking-wider hover:bg-accent"
              >
                <Squares2X2Icon className="mr-2 size-3.5" aria-hidden="true" />
                View All
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

'use client'

import { Heart, LayoutGrid, SlidersHorizontal } from 'lucide-react'
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
import { cn } from '@/lib/utils'

type FilterBarProps = {
  makeOptions: { label: string; count: number }[]
  currentMake?: string
  currentSort?: string
}

export function FilterBar({ makeOptions, currentMake, currentSort }: FilterBarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const makeLabels = makeOptions.map(option => option.label)

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
    const params = new URLSearchParams(searchParams.toString())
    params.delete('make')
    params.delete('sort')

    const query = params.toString()
    startTransition(() => {
      router.push(query ? `${pathname}?${query}` : pathname)
    })
  }

  function selectMake(label: string) {
    setIsFilterOpen(false)
    updateParam('make', label)
  }

  return (
    <>
      <div className="flex flex-col gap-6 md:hidden">
        <div className="flex flex-col gap-6 px-3">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="brand-select-mobile"
              className="font-heading text-13 font-semibold uppercase tracking-wide text-foreground"
            >
              Make
            </label>
            <Select
              value={currentMake ?? 'Show All'}
              onValueChange={value => updateParam('make', value)}
              disabled={isPending}
            >
              <SelectTrigger
                id="brand-select-mobile"
                className="h-10 w-full rounded-sm border-select-border bg-background px-3 font-body text-base text-foreground"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {makeLabels.map(make => (
                  <SelectItem key={make} value={make}>
                    {make}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="sort-select-mobile"
              className="font-heading text-13 font-semibold uppercase tracking-wide text-foreground"
            >
              Sort By
            </label>
            <Select
              value={currentSort ?? 'price-desc'}
              onValueChange={value => updateParam('sort', value)}
              disabled={isPending}
            >
              <SelectTrigger
                id="sort-select-mobile"
                className="h-10 w-full rounded-sm border-select-border bg-background px-3 font-body text-base text-foreground"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              onClick={resetFilters}
              disabled={isPending}
              className="h-10 justify-center rounded-none border-2 border-foreground bg-background font-heading text-xs font-semibold uppercase tracking-wide text-foreground"
            >
              <LayoutGrid className="size-3.5" />
              View All
            </Button>
            <Button
              variant="outline"
              disabled
              className="h-10 justify-center rounded-none border-2 border-foreground bg-background font-heading text-xs font-semibold uppercase tracking-wide text-foreground disabled:opacity-100"
            >
              <Heart className="size-3.5" />
              Wishlist (0)
            </Button>
            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <SheetTrigger
                render={
                  <Button className="h-10 justify-center rounded-none border-2 border-foreground bg-foreground font-heading text-xs font-semibold uppercase tracking-wide text-background hover:bg-gray-16" />
                }
              >
                <SlidersHorizontal className="size-3.5" />
                Filter Stock
              </SheetTrigger>
              <SheetContent
                side="right"
                showCloseButton={false}
                className="w-72 gap-10 border-none bg-gray-7 p-0 text-background sm:max-w-none"
              >
                <div className="flex flex-col gap-10 overflow-y-auto py-12">
                  <div className="px-8">
                    <SheetTitle className="font-heading text-lg font-semibold uppercase tracking-widest text-gray-93">
                      Filter By Make
                    </SheetTitle>
                    <div className="mt-4 h-0.5 w-10 bg-white-30" />
                  </div>

                  <div className="flex flex-col">
                    {makeOptions.map(option => {
                      const isActive =
                        (currentMake ?? 'Show All') === option.label ||
                        (!currentMake && option.label === 'Show All')

                      return (
                        <button
                          key={option.label}
                          type="button"
                          onClick={() => selectMake(option.label)}
                          className={cn(
                            'flex items-center justify-between px-8 py-2 text-left transition-colors',
                            isActive ? 'bg-gray-20' : 'bg-transparent'
                          )}
                        >
                          <span className="font-heading text-13 font-semibold uppercase tracking-wider text-background">
                            {option.label}
                          </span>
                          <span className="min-w-7 rounded-full bg-white-20 px-2 py-1 text-center font-body text-xs font-medium uppercase tracking-wide text-background">
                            {option.count}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      <div className="hidden flex-wrap items-end gap-0 border-b border-gray-90 pb-3 md:flex">
        <div className="flex min-w-0 w-1/3 shrink-0 flex-col gap-1 px-3 pt-6">
          <label
            htmlFor="brand-select"
            className="font-heading font-semibold text-13 text-foreground uppercase tracking-wider"
          >
            Make
          </label>
          <Select
            value={currentMake ?? 'Show All'}
            onValueChange={value => updateParam('make', value)}
            disabled={isPending}
          >
            <SelectTrigger
              id="brand-select"
              className="w-full h-10 px-3 border border-select-border rounded font-body text-base text-foreground bg-background"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {makeLabels.map(m => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex w-1/5 min-w-0 shrink-0 flex-col gap-1 px-3 pt-6">
          <label
            htmlFor="sort-select"
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
              id="sort-select"
              className="w-full h-10 px-3 border border-select-border rounded font-body text-base text-foreground bg-background"
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

        <div className="ml-auto flex items-end gap-0 px-3 pt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={resetFilters}
            disabled={isPending}
            className="h-10 px-5 border-2 border-foreground font-heading font-semibold text-xs uppercase tracking-wider"
          >
            <LayoutGrid className="size-3.5 shrink-0" />
            View All
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-10 px-5 border-2 border-l-0 border-foreground font-heading font-semibold text-xs uppercase tracking-wider"
          >
            <Heart className="size-3.5 shrink-0" />
            Wishlist (0)
          </Button>
          <Button
            variant="default"
            size="sm"
            className="h-10 px-5 border-2 border-foreground bg-foreground text-background hover:bg-gray-16 font-heading font-semibold text-xs uppercase tracking-wider"
          >
            <SlidersHorizontal className="size-3.5 shrink-0" />
            Filter Stock
          </Button>
        </div>
      </div>
    </>
  )
}

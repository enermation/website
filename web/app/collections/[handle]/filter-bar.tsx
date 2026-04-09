"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { LayoutGrid, Heart, SlidersHorizontal } from "lucide-react"
import { sortOptions } from "@/lib/data"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"

type FilterBarProps = {
  makes: string[]
  currentMake?: string
  currentSort?: string
}

export function FilterBar({ makes, currentMake, currentSort }: FilterBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (!value || value === "Show All") {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap items-end gap-0 border-b border-gray-90 pb-3">
      {/* Brand select */}
      <div className="flex flex-col gap-1 px-3 pt-6 w-1/3 min-w-0 shrink-0">
        <label className="font-heading font-semibold text-13 text-foreground uppercase tracking-wider">
          Brand
        </label>
        <Select
          value={currentMake ?? "Show All"}
          onValueChange={(value) => updateParam("make", value)}
        >
          <SelectTrigger className="w-full h-10 px-3 border border-select-border rounded font-body text-base text-foreground bg-background">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {makes.map((m) => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Sort select */}
      <div className="flex flex-col gap-1 px-3 pt-6 w-1/5 min-w-0 shrink-0">
        <label className="font-heading font-semibold text-13 text-foreground uppercase tracking-wider">
          Sort By
        </label>
        <Select
          value={currentSort ?? ""}
          onValueChange={(value) => updateParam("sort", value)}
        >
          <SelectTrigger className="w-full h-10 px-3 border border-select-border rounded font-body text-base text-foreground bg-background">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Action buttons */}
      <div className="flex items-end gap-0 ml-auto px-3 pt-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const params = new URLSearchParams(searchParams.toString())
            params.delete("make")
            params.delete("sort")
            router.push(`?${params.toString()}`)
          }}
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
  )
}


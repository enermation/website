"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { LayoutGrid, Heart, SlidersHorizontal } from "lucide-react"
import { sortOptions } from "@/lib/data"
import { cn } from "@/lib/utils"

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
        <label className="font-montserrat font-semibold text-13 text-black uppercase tracking-wider">
          Brand
        </label>
        <select
          value={currentMake ?? "Show All"}
          onChange={(e) => updateParam("make", e.target.value)}
          className="w-full h-10 px-3 border border-select-border rounded font-roboto text-base text-black bg-white focus:outline-none focus:ring-1 focus:ring-black appearance-none cursor-pointer"
        >
          {makes.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      {/* Sort select */}
      <div className="flex flex-col gap-1 px-3 pt-6 w-1/5 min-w-0 shrink-0">
        <label className="font-montserrat font-semibold text-13 text-black uppercase tracking-wider">
          Sort By
        </label>
        <select
          value={currentSort ?? ""}
          onChange={(e) => updateParam("sort", e.target.value)}
          className="w-full h-10 px-3 border border-select-border rounded font-roboto text-base text-black bg-white focus:outline-none focus:ring-1 focus:ring-black appearance-none cursor-pointer"
        >
          {sortOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* Action buttons */}
      <div className="flex items-end gap-0 ml-auto px-3 pt-6">
        <button
          onClick={() => {
            const params = new URLSearchParams(searchParams.toString())
            params.delete("make")
            params.delete("sort")
            router.push(`?${params.toString()}`)
          }}
          className={cn(
            "flex items-center gap-2 h-10 px-5 border-2 border-black font-montserrat font-semibold text-xs uppercase tracking-wider transition-colors whitespace-nowrap",
            "text-black bg-white hover:bg-black hover:text-white"
          )}
        >
          <LayoutGrid className="size-3.5 shrink-0" />
          View All
        </button>
        <button
          className={cn(
            "flex items-center gap-2 h-10 px-5 border-2 border-l-0 border-black font-montserrat font-semibold text-xs uppercase tracking-wider transition-colors whitespace-nowrap",
            "text-black bg-white hover:bg-black hover:text-white"
          )}
        >
          <Heart className="size-3.5 shrink-0" />
          Wishlist (0)
        </button>
        <button
          className={cn(
            "flex items-center gap-2 h-10 px-5 border-2 border-l-0 border-black font-montserrat font-semibold text-xs uppercase tracking-wider transition-colors whitespace-nowrap",
            "text-white bg-black hover:bg-gray-16"
          )}
        >
          <SlidersHorizontal className="size-3.5 shrink-0" />
          Filter Stock
        </button>
      </div>
    </div>
  )
}

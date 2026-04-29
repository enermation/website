'use client'

import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Input } from '@/components/ui/input'
import useDebounce from '@/hooks/use-debounce'
import { searchCopy } from '@/lib/data'
import type { SearchResult } from '@/lib/shopify'
import { cn } from '@/lib/utils'

const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'

type HeaderSearchProps = {
  variant?: 'desktop' | 'mobile'
}

export function HeaderSearch({ variant = 'desktop' }: HeaderSearchProps) {
  const [open, setOpen] = useState(variant === 'desktop')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const debouncedQuery = useDebounce(query, 300)
  const router = useRouter()

  const fetchResults = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([])
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      setResults(data.results ?? [])
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!open) return
    fetchResults(debouncedQuery)
    setActiveIndex(-1)
  }, [debouncedQuery, open, fetchResults])

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus()
    }
  }, [open])

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        if (variant === 'mobile') {
          setOpen(false)
        }
        setQuery('')
        setResults([])
      }
    }
    if (open) {
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, variant])

  // Close on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        if (variant === 'mobile') {
          setOpen(false)
        }
        setQuery('')
        setResults([])
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClick)
    }
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open, variant])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!results.length) return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setActiveIndex(prev => (prev < results.length - 1 ? prev + 1 : 0))
          break
        case 'ArrowUp':
          e.preventDefault()
          setActiveIndex(prev => (prev > 0 ? prev - 1 : results.length - 1))
          break
        case 'Enter':
          e.preventDefault()
          if (activeIndex >= 0 && results[activeIndex]) {
            router.push(`/products/${results[activeIndex].handle}`)
            if (variant === 'mobile') setOpen(false)
            setQuery('')
          } else if (query.trim()) {
            router.push(`/search?q=${encodeURIComponent(query)}`)
            if (variant === 'mobile') setOpen(false)
            setQuery('')
          }
          break
      }
    },
    [results, activeIndex, query, router, variant]
  )

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (query.trim()) {
        router.push(`/search?q=${encodeURIComponent(query)}`)
        if (variant === 'mobile') setOpen(false)
        setQuery('')
      }
    },
    [query, router, variant]
  )

  const handleResultSelect = useCallback(
    (result: SearchResult) => {
      router.push(`/products/${result.handle}`)
      if (variant === 'mobile') setOpen(false)
      setQuery('')
    },
    [router, variant]
  )

  const handleOpen = useCallback(() => {
    setOpen(true)
    setQuery('')
    setResults([])
    setActiveIndex(-1)
  }, [])

  const handleClose = useCallback(() => {
    if (variant === 'mobile') {
      setOpen(false)
    }
    setQuery('')
    setResults([])
    setActiveIndex(-1)
  }, [variant])

  // Mobile variant — toggleable search icon/input
  if (variant === 'mobile') {
    return (
      <div ref={containerRef} className={cn('relative flex items-center', open && 'w-full')}>
        {!open ? (
          <button
            type="button"
            onClick={handleOpen}
            className={cn(
              'inline-flex size-11 items-center justify-center rounded-full text-background transition-colors hover:bg-white-20',
              focusRing
            )}
            aria-label={searchCopy.label}
          >
            <MagnifyingGlassIcon className="size-5" aria-hidden="true" />
          </button>
        ) : (
          <div className="relative w-full">
            <form onSubmit={handleSubmit} className="relative">
              <Input
                ref={inputRef}
                type="search"
                placeholder={searchCopy.placeholder}
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className={cn(
                  'h-10 rounded-full border-white-30 bg-white-20 pr-10 pl-10 text-sm text-background placeholder:text-on-dark-muted focus-visible:border-brand-green',
                  focusRing
                )}
                aria-label={searchCopy.label}
                aria-expanded={results.length > 0}
              />
              <MagnifyingGlassIcon className="size-4" aria-hidden="true" />
              <button
                type="button"
                onClick={handleClose}
                className="absolute top-1/2 right-3.5 flex size-4 -translate-y-1/2 items-center justify-center text-on-dark-muted transition-colors hover:text-background"
                aria-label={searchCopy.closeLabel}
              >
                <XMarkIcon className="size-3" aria-hidden="true" />
              </button>
            </form>

            {results.length > 0 && (
              <div className="absolute right-0 top-full z-50 mt-2 max-h-80 w-80 overflow-y-auto rounded-2xl border border-white-20 bg-surface-dark p-2 shadow-xl">
                {results.map((result, i) => (
                  <button
                    key={result.id}
                    type="button"
                    onClick={() => handleResultSelect(result)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors hover:bg-white-20',
                      i === activeIndex && 'bg-white-20'
                    )}
                  >
                    <div className="relative size-14 shrink-0 overflow-hidden rounded-lg border border-white-30 bg-white-20">
                      {result.image ? (
                        <Image
                          src={result.image.url}
                          alt={result.image.altText ?? result.title}
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center">
                          <Icon
                            path={mdiMagnify}
                            size={1}
                            className="size-4 text-muted-foreground"
                          />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-heading text-13 font-semibold text-background">
                        {result.title}
                      </p>
                      <p className="font-body text-xs text-on-dark-muted">
                        {result.price.currencyCode} {result.price.amount}
                      </p>
                    </div>
                  </button>
                ))}
                <Link
                  href={`/search?q=${encodeURIComponent(query)}`}
                  className="flex items-center justify-center rounded-xl border border-white-30 bg-white-20 px-3 py-2 font-heading text-13 font-semibold text-background transition-colors hover:bg-white-30"
                  onClick={handleClose}
                >
                  {searchCopy.seeAllLabel}
                </Link>
              </div>
            )}

            {loading && (
              <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-2xl border border-white-20 bg-surface-dark p-4 text-center shadow-xl">
                <p className="font-body text-sm text-on-dark-muted">{searchCopy.searchingLabel}</p>
              </div>
            )}

            {!loading && query && results.length === 0 && (
              <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-2xl border border-white-20 bg-surface-dark p-4 text-center shadow-xl">
                <p className="font-body text-sm text-on-dark-muted">{searchCopy.noResultsLabel}</p>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  // Desktop variant — icon that expands inline
  return (
    <div ref={containerRef} className="relative">
      {!open ? (
        <button
          type="button"
          onClick={handleOpen}
          className={cn(
            'inline-flex h-8 w-8 items-center justify-center rounded-full text-background transition-colors hover:bg-white-20',
            focusRing
          )}
          aria-label={searchCopy.label}
        >
          <Icon path={mdiMagnify} size={1} className="size-5" aria-hidden="true" />
        </button>
      ) : (
        <div className="relative">
          <form onSubmit={handleSubmit} className="relative">
            <Input
              ref={inputRef}
              type="search"
              placeholder={searchCopy.placeholder}
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className={cn(
                'h-8 w-64 rounded-full border-white-30 bg-white-20 pr-10 pl-9 text-sm text-background placeholder:text-on-dark-muted focus-visible:border-brand-green',
                focusRing
              )}
              aria-label={searchCopy.label}
              aria-expanded={results.length > 0}
            />
            <MagnifyingGlassIcon className="size-3.5" aria-hidden="true" />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute top-1/2 right-2.5 flex size-5 -translate-y-1/2 items-center justify-center rounded-full text-on-dark-muted transition-colors hover:bg-white-30 hover:text-background"
                aria-label={searchCopy.clearLabel}
              >
                <XMarkIcon className="size-3" aria-hidden="true" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleClose}
                className="absolute top-1/2 right-2.5 flex size-5 -translate-y-1/2 items-center justify-center rounded-full text-on-dark-muted transition-colors hover:bg-white-30 hover:text-background"
                aria-label={searchCopy.closeLabel}
              >
                <XMarkIcon className="size-3" aria-hidden="true" />
              </button>
            )}
          </form>

          {results.length > 0 && (
            <div className="absolute left-0 top-full mt-2 w-80 rounded-2xl border border-white-20 bg-surface-dark p-2 shadow-xl">
              {results.map((result, i) => (
                <button
                  key={result.id}
                  type="button"
                  onClick={() => handleResultSelect(result)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors hover:bg-white-20',
                    i === activeIndex && 'bg-white-20'
                  )}
                >
                  <div className="relative size-14 shrink-0 overflow-hidden rounded-lg border border-white-30 bg-white-20">
                    {result.image ? (
                      <Image
                        src={result.image.url}
                        alt={result.image.altText ?? result.title}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center">
                        <Icon path={mdiMagnify} size={1} className="size-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-heading text-13 font-semibold text-background">
                      {result.title}
                    </p>
                    <p className="font-body text-xs text-on-dark-muted">
                      {result.price.currencyCode} {result.price.amount}
                    </p>
                  </div>
                </button>
              ))}
              <Link
                href={`/search?q=${encodeURIComponent(query)}`}
                className="flex items-center justify-center rounded-xl border border-white-30 bg-white-20 px-3 py-2 font-heading text-13 font-semibold text-background transition-colors hover:bg-white-30"
                onClick={handleClose}
              >
                {searchCopy.seeAllLabel}
              </Link>
            </div>
          )}

          {loading && (
            <div className="absolute left-0 top-full mt-2 w-80 rounded-2xl border border-white-20 bg-surface-dark p-4 text-center shadow-xl">
              <p className="font-body text-sm text-on-dark-muted">{searchCopy.searchingLabel}</p>
            </div>
          )}

          {!loading && query && results.length === 0 && (
            <div className="absolute left-0 top-full mt-2 w-80 rounded-2xl border border-white-20 bg-surface-dark p-4 text-center shadow-xl">
              <p className="font-body text-sm text-on-dark-muted">{searchCopy.noResultsLabel}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

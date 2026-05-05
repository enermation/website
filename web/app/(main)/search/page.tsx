import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { notFound } from 'next/navigation'
import { SearchResultCard } from '@/components/search-result-card'
import { SiteHeader } from '@/components/site-header'
import { searchCopy } from '@/lib/data'
import { searchProducts } from '@/lib/shopify'

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams

  if (!q?.trim()) {
    notFound()
  }

  const query = q.trim()
  const results = await searchProducts(query, 50)

  return (
    <>
      <SiteHeader />

      <section className="bg-background border-b border-gray-90 px-3 py-10 text-center">
        <h1 className="font-sans text-section font-normal uppercase tracking-widest text-gray-7 md:font-display">
          Search Results
        </h1>
        <p className="mt-3 font-body text-15 text-gray-33">
          {results.length} result{results.length !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
        </p>
        <div className="flex justify-center mt-6">
          <div className="flex items-center">
            <div className="h-1 w-10 bg-brand-green" />
            <div className="h-1 w-10 bg-white border border-gray-87" />
            <div className="h-1 w-10 bg-brand-red" />
          </div>
        </div>
      </section>

      <section className="bg-background py-8 md:py-12">
        <div className="max-w-site mx-auto px-3">
          {results.length === 0 ? (
            <div className="flex flex-col items-center py-24 text-center">
              <div className="mb-6 flex size-16 items-center justify-center rounded-full bg-muted">
                <MagnifyingGlassIcon className="size-8 text-muted-foreground" />
              </div>
              <p className="font-heading text-lg font-semibold text-foreground">No results found</p>
              <p className="mt-2 max-w-md font-body text-15 text-muted-foreground">
                {searchCopy.noResultsLabel}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-y-6 md:grid-cols-3 md:gap-6">
              {results.map((result, i) => (
                <SearchResultCard key={result.id} result={result} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}

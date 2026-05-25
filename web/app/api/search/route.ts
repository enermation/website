import { NextResponse } from 'next/server'
import { searchProducts } from '@/lib/shopify'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')

  if (!q?.trim()) {
    return NextResponse.json({ results: [] })
  }

  try {
    const results = await searchProducts(q)
    return NextResponse.json(
      { results },
      {
        headers: {
          'Cache-Control': 's-maxage=60, stale-while-revalidate=300',
        },
      }
    )
  } catch {
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}

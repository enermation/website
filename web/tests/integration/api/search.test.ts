import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { searchProducts } from '@/lib/shopify'

vi.mock('@/lib/shopify', () => ({
  searchProducts: vi.fn(),
}))

describe('GET /api/search', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns empty results when query is missing', async () => {
    const { GET } = await import('@/app/api/search/route')
    const request = new NextRequest(new URL('/api/search', 'http://localhost'))
    const response = await GET(request)
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json).toEqual({ results: [] })
    expect(searchProducts).not.toHaveBeenCalled()
  })

  it('returns empty results when query is whitespace only', async () => {
    const { GET } = await import('@/app/api/search/route')
    const request = new NextRequest(new URL('/api/search?q=   ', 'http://localhost'))
    const response = await GET(request)
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json).toEqual({ results: [] })
    expect(searchProducts).not.toHaveBeenCalled()
  })

  it('calls searchProducts and returns results', async () => {
    const mockResults = [
      { id: '1', title: 'Test Product', handle: 'test-product' },
      { id: '2', title: 'Another Product', handle: 'another-product' },
    ]
    vi.mocked(searchProducts).mockResolvedValue(mockResults as never)

    const { GET } = await import('@/app/api/search/route')
    const request = new NextRequest(new URL('/api/search?q=test', 'http://localhost'))
    const response = await GET(request)
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json).toEqual({ results: mockResults })
    expect(searchProducts).toHaveBeenCalledWith('test')
  })

  it('returns 500 when searchProducts throws', async () => {
    vi.mocked(searchProducts).mockRejectedValue(new Error('Search failed'))

    const { GET } = await import('@/app/api/search/route')
    const request = new NextRequest(new URL('/api/search?q=test', 'http://localhost'))
    const response = await GET(request)
    const json = await response.json()

    expect(response.status).toBe(500)
    expect(json).toEqual({ error: 'Search failed' })
  })
})

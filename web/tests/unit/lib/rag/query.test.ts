import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getQdrantClient } from '@/lib/rag/clients'
import { embedQuery } from '@/lib/rag/embed'
import { rerankCandidates } from '@/lib/rag/rerank'
import { toSparseVector } from '@/lib/rag/tokenizer'

// ── Mock server-only ──────────────────────────────────────────────────────────

vi.mock('server-only', () => ({}))

// ── Mock lib/rag modules ───────────────────────────────────────────────────────

vi.mock('@/lib/rag/clients', () => ({
  getQdrantClient: vi.fn(),
}))

vi.mock('@/lib/rag/embed', () => ({
  embedQuery: vi.fn(),
}))

vi.mock('@/lib/rag/rerank', () => ({
  rerankCandidates: vi.fn(),
}))

vi.mock('@/lib/rag/tokenizer', () => ({
  toSparseVector: vi.fn(),
}))

// ── Fixtures ─────────────────────────────────────────────────────────────────

const mockQueryEmbedding = [0.1, 0.2, 0.3]

const mockSparseVector = {
  indices: [1, 5, 10],
  values: [0.5, 0.3, 0.2],
}

const mockPoints = [
  {
    id: 'point-1',
    score: 0.95,
    payload: {
      productId: 'prod-1',
      handle: 'product-1',
      title: 'Product 1',
      priceAmount: '100',
      priceCurrency: 'GBP',
      collectionHandles: [],
      vendor: 'Vendor A',
      make: 'Toyota',
      model: 'Camry',
      year: '2022',
      fuelType: 'Petrol',
      transmission: 'Automatic',
      driveType: null,
      condition: 'New',
      features: ['Sunroof'],
      specs: { engine: { label: 'Engine', value: '2.5L' } },
      imageUrl: '/image1.jpg',
      url: '/products/product-1',
      textSnippet: 'A great car',
      available: true,
    },
  },
  {
    id: 'point-2',
    score: 0.85,
    payload: {
      productId: 'prod-2',
      handle: 'product-2',
      title: 'Product 2',
      priceAmount: '200',
      priceCurrency: 'GBP',
      collectionHandles: [],
      vendor: 'Vendor B',
      make: 'Honda',
      model: 'Accord',
      year: '2021',
      fuelType: 'Hybrid',
      transmission: 'CVT',
      driveType: null,
      condition: 'Used',
      features: [],
      specs: {},
      imageUrl: null,
      url: '/products/product-2',
      textSnippet: 'Another car',
      available: false,
    },
  },
]

const mockRetrievalResults = [
  {
    metadata: mockPoints[0].payload,
    score: 0.95,
  },
  {
    metadata: mockPoints[1].payload,
    score: 0.85,
  },
]

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('findRelevantProducts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns empty array when no points returned', async () => {
    const mockQuery = vi.fn().mockResolvedValue({
      points: [],
    })
    ;(getQdrantClient as ReturnType<typeof vi.fn>).mockReturnValue({ query: mockQuery } as never)
    ;(embedQuery as ReturnType<typeof vi.fn>).mockResolvedValue(mockQueryEmbedding as never)
    ;(toSparseVector as ReturnType<typeof vi.fn>).mockReturnValue(mockSparseVector as never)

    const { findRelevantProducts } = await import('@/lib/rag/query')
    const result = await findRelevantProducts('test query')

    expect(result).toEqual([])
    expect(mockQuery).toHaveBeenCalled()
  })

  it('returns empty array when all points have null payload', async () => {
    const mockQuery = vi.fn().mockResolvedValue({
      points: [
        { id: '1', score: 0.9, payload: null },
        { id: '2', score: 0.8, payload: null },
      ],
    })
    ;(getQdrantClient as ReturnType<typeof vi.fn>).mockReturnValue({ query: mockQuery } as never)
    ;(embedQuery as ReturnType<typeof vi.fn>).mockResolvedValue(mockQueryEmbedding as never)
    ;(toSparseVector as ReturnType<typeof vi.fn>).mockReturnValue(mockSparseVector as never)

    const { findRelevantProducts } = await import('@/lib/rag/query')
    const result = await findRelevantProducts('test query')

    expect(result).toEqual([])
  })

  it('calls embedQuery and toSparseVector in parallel', async () => {
    const mockQuery = vi.fn().mockResolvedValue({ points: [] })
    ;(getQdrantClient as ReturnType<typeof vi.fn>).mockReturnValue({ query: mockQuery } as never)

    const embedSpy = (embedQuery as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockQueryEmbedding as never
    )
    const sparseSpy = (toSparseVector as ReturnType<typeof vi.fn>).mockReturnValue(
      mockSparseVector as never
    )

    const { findRelevantProducts } = await import('@/lib/rag/query')
    await findRelevantProducts('test query')

    expect(embedSpy).toHaveBeenCalledWith('test query')
    expect(sparseSpy).toHaveBeenCalledWith('test query')
  })

  it('filters out points with null payload and returns valid results', async () => {
    const mockQuery = vi.fn().mockResolvedValue({
      points: [mockPoints[0], { id: 'null-payload-point', score: 0.7, payload: null }],
    })
    ;(getQdrantClient as ReturnType<typeof vi.fn>).mockReturnValue({ query: mockQuery } as never)
    ;(embedQuery as ReturnType<typeof vi.fn>).mockResolvedValue(mockQueryEmbedding as never)
    ;(toSparseVector as ReturnType<typeof vi.fn>).mockReturnValue(mockSparseVector as never)
    ;(rerankCandidates as ReturnType<typeof vi.fn>).mockResolvedValue([mockRetrievalResults[0]])

    const { findRelevantProducts } = await import('@/lib/rag/query')
    const result = await findRelevantProducts('test query')

    expect(result).toHaveLength(1)
    expect(result[0].metadata.handle).toBe('product-1')
  })

  it('calls rerankCandidates with the query and filtered candidates', async () => {
    const mockQuery = vi.fn().mockResolvedValue({ points: mockPoints })
    ;(getQdrantClient as ReturnType<typeof vi.fn>).mockReturnValue({ query: mockQuery } as never)
    ;(embedQuery as ReturnType<typeof vi.fn>).mockResolvedValue(mockQueryEmbedding as never)
    ;(toSparseVector as ReturnType<typeof vi.fn>).mockReturnValue(mockSparseVector as never)
    ;(rerankCandidates as ReturnType<typeof vi.fn>).mockResolvedValue(mockRetrievalResults)

    const { findRelevantProducts } = await import('@/lib/rag/query')
    await findRelevantProducts('test query')

    expect(rerankCandidates).toHaveBeenCalledWith(
      'test query',
      expect.arrayContaining([
        expect.objectContaining({ metadata: expect.objectContaining({ handle: 'product-1' }) }),
        expect.objectContaining({ metadata: expect.objectContaining({ handle: 'product-2' }) }),
      ])
    )
  })

  it('returns reranked results from rerankCandidates', async () => {
    const mockQuery = vi.fn().mockResolvedValue({ points: mockPoints })
    ;(getQdrantClient as ReturnType<typeof vi.fn>).mockReturnValue({ query: mockQuery } as never)
    ;(embedQuery as ReturnType<typeof vi.fn>).mockResolvedValue(mockQueryEmbedding as never)
    ;(toSparseVector as ReturnType<typeof vi.fn>).mockReturnValue(mockSparseVector as never)

    const reversedResults = [mockRetrievalResults[1], mockRetrievalResults[0]]
    ;(rerankCandidates as ReturnType<typeof vi.fn>).mockResolvedValue(reversedResults)

    const { findRelevantProducts } = await import('@/lib/rag/query')
    const result = await findRelevantProducts('test query')

    expect(result).toEqual(reversedResults)
    expect(result[0].metadata.handle).toBe('product-2')
    expect(result[1].metadata.handle).toBe('product-1')
  })

  it('uses correct Qdrant query parameters', async () => {
    const mockQuery = vi.fn().mockResolvedValue({ points: [] })
    ;(getQdrantClient as ReturnType<typeof vi.fn>).mockReturnValue({ query: mockQuery } as never)
    ;(embedQuery as ReturnType<typeof vi.fn>).mockResolvedValue(mockQueryEmbedding as never)
    ;(toSparseVector as ReturnType<typeof vi.fn>).mockReturnValue(mockSparseVector as never)

    const { findRelevantProducts } = await import('@/lib/rag/query')
    await findRelevantProducts('vehicle query')

    expect(mockQuery).toHaveBeenCalledWith(
      'enermation-products',
      expect.objectContaining({
        prefetch: expect.arrayContaining([
          expect.objectContaining({
            using: 'dense',
            limit: 25,
          }),
          expect.objectContaining({
            using: 'sparse',
            limit: 25,
          }),
        ]),
        query: { fusion: 'rrf' },
        limit: 25,
        with_payload: true,
        with_vector: false,
      })
    )
  })
})

import { beforeEach, describe, expect, it, vi } from 'vitest'

// ── Mock server-only module ───────────────────────────────────────────────────
// Must mock before importing the module under test

vi.mock('server-only', () => ({}))

// Mock ai package
const mockEmbedMany = vi.fn()
const mockEmbed = vi.fn()

vi.mock('ai', () => ({
  embed: (...args: unknown[]) => mockEmbed(...args),
  embedMany: (...args: unknown[]) => mockEmbedMany(...args),
}))

vi.mock('@ai-sdk/cohere', () => ({
  cohere: {
    embedding: vi.fn(() => 'mock-embedding-model'),
  },
}))

vi.mock('next/cache', () => ({
  cacheLife: vi.fn(),
  cacheTag: vi.fn(),
}))

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('embedDocuments', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  it('returns empty array for empty input', async () => {
    const { embedDocuments } = await import('@/lib/rag/embed')
    const result = await embedDocuments([])
    expect(result).toEqual([])
  })

  it('embeds single document', async () => {
    const { embedDocuments } = await import('@/lib/rag/embed')

    mockEmbedMany.mockResolvedValueOnce({
      embeddings: [[0.1, 0.2, 0.3]],
    })

    const result = await embedDocuments(['Test document'])
    expect(result).toEqual([[0.1, 0.2, 0.3]])
    expect(mockEmbedMany).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'mock-embedding-model',
        values: ['Test document'],
        providerOptions: {
          cohere: { inputType: 'search_document' },
        },
      })
    )
  })

  it('embeds batch of documents', async () => {
    const { embedDocuments } = await import('@/lib/rag/embed')

    mockEmbedMany.mockResolvedValueOnce({
      embeddings: [
        [0.1, 0.2, 0.3],
        [0.4, 0.5, 0.6],
      ],
    })

    const result = await embedDocuments(['Doc 1', 'Doc 2'])
    expect(result).toHaveLength(2)
    expect(result[0]).toEqual([0.1, 0.2, 0.3])
    expect(result[1]).toEqual([0.4, 0.5, 0.6])
  })

  it('splits large batches according to INDEX_BATCH_SIZE', async () => {
    const { embedDocuments } = await import('@/lib/rag/embed')

    const docs = Array.from({ length: 70 }, (_, i) => `Doc ${i}`)
    mockEmbedMany
      .mockResolvedValueOnce({
        embeddings: Array.from({ length: 64 }, () => [0.1]),
      })
      .mockResolvedValueOnce({
        embeddings: Array.from({ length: 6 }, () => [0.2]),
      })

    const result = await embedDocuments(docs)
    expect(mockEmbedMany).toHaveBeenCalledTimes(2)
    expect(result).toHaveLength(70)
  })
})

describe('embedQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  it('caches identical queries', async () => {
    const { embedQuery } = await import('@/lib/rag/embed')

    mockEmbed.mockResolvedValueOnce({ embedding: [0.9, 0.1, 0.2] })

    const result1 = await embedQuery('cached query')
    const result2 = await embedQuery('cached query')

    expect(result1).toEqual(result2)
    expect(mockEmbed).toHaveBeenCalledTimes(1)
  })

  it('does not cache different queries', async () => {
    const { embedQuery } = await import('@/lib/rag/embed')

    mockEmbed
      .mockResolvedValueOnce({ embedding: [0.1, 0.2, 0.3] })
      .mockResolvedValueOnce({ embedding: [0.4, 0.5, 0.6] })

    const result1 = await embedQuery('query 1')
    const result2 = await embedQuery('query 2')

    expect(result1).toEqual([0.1, 0.2, 0.3])
    expect(result2).toEqual([0.4, 0.5, 0.6])
    expect(mockEmbed).toHaveBeenCalledTimes(2)
  })

  it('returns embedding via doEmbedQuery', async () => {
    const { embedQuery } = await import('@/lib/rag/embed')

    mockEmbed.mockResolvedValueOnce({ embedding: [0.5, 0.5, 0.5] })

    const result = await embedQuery('test query')
    expect(result).toEqual([0.5, 0.5, 0.5])
    expect(mockEmbed).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'mock-embedding-model',
        value: 'test query',
        providerOptions: {
          cohere: { inputType: 'search_query' },
        },
      })
    )
  })
})

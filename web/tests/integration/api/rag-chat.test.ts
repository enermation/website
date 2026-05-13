import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// ── Mock server-only ──────────────────────────────────────────────────────────

vi.mock('server-only', () => ({}))

// ── Mock lib/rag modules ───────────────────────────────────────────────────────

vi.mock('@/lib/rag/ratelimit', () => ({
  getChatLimiter: vi.fn(),
  getRateLimitKey: vi.fn(),
}))

vi.mock('@/lib/rag/query', () => ({
  findRelevantProducts: vi.fn(),
}))

vi.mock('@/lib/rag/prompt', () => ({
  buildGroundedSystemPrompt: vi.fn(() => 'mocked system prompt'),
}))

vi.mock('@/lib/rag/clients', () => ({
  getChatModel: vi.fn(() => 'mock-model' as never),
  chatModelByok: vi.fn(() => ({ cohere: [{ apiKey: 'test' }] })),
}))

vi.mock('@/lib/rag/vision', () => ({
  describeImagesForRetrieval: vi.fn(() => Promise.resolve('mocked retrieval query')),
}))

// ── Mock ai package ───────────────────────────────────────────────────────────

const mockStreamText = vi.fn()
vi.mock('ai', () => ({
  convertToModelMessages: vi.fn((messages: unknown[]) => messages),
  streamText: mockStreamText,
  generateObject: vi.fn(() => Promise.resolve({ object: { suggestions: ['Q1', 'Q2'] } })),
  TextStreamPart: {},
  UIMessage: {},
  type: { ToolSet: {} as never },
}))

// ── Fixtures ─────────────────────────────────────────────────────────────────

const validMessages = [
  {
    id: '1',
    role: 'user' as const,
    parts: [{ type: 'text' as const, text: 'What vehicles do you have?' }],
  },
]

const rateLimitResponse = { success: true, reset: 0 }

const mockProducts = [
  {
    metadata: {
      productId: 'prod-1',
      handle: 'test-product',
      title: 'Test Product',
      priceAmount: '2999.99',
      priceCurrency: 'GBP',
      collectionHandles: [],
      vendor: 'Test Vendor',
      make: 'Toyota',
      model: 'Camry',
      year: '2022',
      fuelType: 'Petrol',
      transmission: 'Automatic',
      driveType: null,
      condition: 'New',
      features: [],
      specs: {},
      imageUrl: null,
      url: '/products/test-product',
      textSnippet: 'Test product description',
      available: true,
    },
    score: 0.9,
  },
]

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('POST /api/rag/chat', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 400 when request body is invalid JSON', async () => {
    const { getChatLimiter: mockGetLimiter } = await import('@/lib/rag/ratelimit')
    mockGetLimiter.mockReturnValue({
      limit: vi.fn().mockResolvedValue(rateLimitResponse),
    } as never)
    const { findRelevantProducts: mockFind } = await import('@/lib/rag/query')
    mockFind.mockResolvedValue(mockProducts)

    const { POST } = await import('@/app/api/rag/chat/route')
    const request = new NextRequest('http://localhost/api/rag/chat', {
      method: 'POST',
      body: 'not-json',
    })
    const response = await POST(request)
    expect(response.status).toBe(400)
  })

  it('returns 400 when no messages provided', async () => {
    const { getChatLimiter: mockGetLimiter } = await import('@/lib/rag/ratelimit')
    mockGetLimiter.mockReturnValue({
      limit: vi.fn().mockResolvedValue(rateLimitResponse),
    } as never)
    const { findRelevantProducts: mockFind } = await import('@/lib/rag/query')
    mockFind.mockResolvedValue(mockProducts)

    const { POST } = await import('@/app/api/rag/chat/route')
    const request = new NextRequest('http://localhost/api/rag/chat', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ messages: [] }),
    })
    const response = await POST(request)
    expect(response.status).toBe(400)
  })

  it('returns 400 when no user message in messages', async () => {
    const { getChatLimiter: mockGetLimiter } = await import('@/lib/rag/ratelimit')
    mockGetLimiter.mockReturnValue({
      limit: vi.fn().mockResolvedValue(rateLimitResponse),
    } as never)
    const { findRelevantProducts: mockFind } = await import('@/lib/rag/query')
    mockFind.mockResolvedValue(mockProducts)

    const { POST } = await import('@/app/api/rag/chat/route')
    const request = new NextRequest('http://localhost/api/rag/chat', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ messages: [{ id: '1', role: 'assistant', parts: [] }] }),
    })
    const response = await POST(request)
    expect(response.status).toBe(400)
  })

  it('returns 429 when rate limited', async () => {
    const { getChatLimiter: mockGetLimiter } = await import('@/lib/rag/ratelimit')
    mockGetLimiter.mockReturnValue({
      limit: vi.fn().mockResolvedValue({ success: false, reset: 60 }),
    } as never)

    const { POST } = await import('@/app/api/rag/chat/route')
    const request = new NextRequest('http://localhost/api/rag/chat', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ messages: validMessages }),
    })
    const response = await POST(request)
    expect(response.status).toBe(429)
    expect(response.headers.get('Retry-After')).toBe('60')
  })

  it('returns 400 when user message has no text or images', async () => {
    const { getChatLimiter: mockGetLimiter } = await import('@/lib/rag/ratelimit')
    mockGetLimiter.mockReturnValue({
      limit: vi.fn().mockResolvedValue(rateLimitResponse),
    } as never)
    const { findRelevantProducts: mockFind } = await import('@/lib/rag/query')
    mockFind.mockResolvedValue(mockProducts)

    const { describeImagesForRetrieval: mockVision } = await import('@/lib/rag/vision')
    mockVision.mockResolvedValue('query')

    const { POST } = await import('@/app/api/rag/chat/route')
    const request = new NextRequest('http://localhost/api/rag/chat', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        messages: [{ id: '1', role: 'user', parts: [{ type: 'text', text: '' }] }],
      }),
    })
    const response = await POST(request)
    expect(response.status).toBe(400)
  })

  it('returns 500 when image description fails', async () => {
    const { getChatLimiter: mockGetLimiter } = await import('@/lib/rag/ratelimit')
    mockGetLimiter.mockReturnValue({
      limit: vi.fn().mockResolvedValue(rateLimitResponse),
    } as never)

    const { describeImagesForRetrieval: mockVision } = await import('@/lib/rag/vision')
    mockVision.mockRejectedValue(new Error('Vision failed'))

    const { POST } = await import('@/app/api/rag/chat/route')
    const request = new NextRequest('http://localhost/api/rag/chat', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ messages: validMessages }),
    })
    const response = await POST(request)
    const json = await response.json()
    expect(response.status).toBe(500)
    expect(json.error).toBe('Vision failed')
  })

  it('returns 500 when retrieval fails', async () => {
    const { getChatLimiter: mockGetLimiter } = await import('@/lib/rag/ratelimit')
    mockGetLimiter.mockReturnValue({
      limit: vi.fn().mockResolvedValue(rateLimitResponse),
    } as never)

    const { describeImagesForRetrieval: mockVision } = await import('@/lib/rag/vision')
    mockVision.mockResolvedValue('query')

    const { findRelevantProducts: mockFind } = await import('@/lib/rag/query')
    mockFind.mockRejectedValue(new Error('Retrieval failed'))

    const { POST } = await import('@/app/api/rag/chat/route')
    const request = new NextRequest('http://localhost/api/rag/chat', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ messages: validMessages }),
    })
    const response = await POST(request)
    const json = await response.json()
    expect(response.status).toBe(500)
    expect(json.error).toBe('Retrieval failed')
  })

  it('calls streamText and returns streaming response on success', async () => {
    const mockStream = {
      toUIMessageStreamResponse: vi.fn().mockReturnValue(
        new Response('test stream', {
          headers: { 'content-type': 'text/plain' },
        })
      ),
    }
    mockStreamText.mockReturnValue(mockStream)

    const { getChatLimiter: mockGetLimiter } = await import('@/lib/rag/ratelimit')
    mockGetLimiter.mockReturnValue({
      limit: vi.fn().mockResolvedValue(rateLimitResponse),
    } as never)

    const { findRelevantProducts: mockFind } = await import('@/lib/rag/query')
    mockFind.mockResolvedValue(mockProducts)

    const { describeImagesForRetrieval: mockVision } = await import('@/lib/rag/vision')
    mockVision.mockResolvedValue('query')

    const { POST } = await import('@/app/api/rag/chat/route')
    const request = new NextRequest('http://localhost/api/rag/chat', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ messages: validMessages }),
    })
    const response = await POST(request)

    expect(response.status).toBe(200)
    expect(mockStream.toUIMessageStreamResponse).toHaveBeenCalled()
    const onError = mockStream.toUIMessageStreamResponse.mock.calls[0][0].onError
    expect(onError({ error: new Error('test') })).toBe(
      'Something went wrong while generating the response.'
    )
  })

  it('passes sessionId to rate limit key when provided', async () => {
    mockStreamText.mockReturnValue({
      toUIMessageStreamResponse: () => new Response('ok'),
    })

    const { getChatLimiter: mockGetLimiter } = await import('@/lib/rag/ratelimit')
    mockGetLimiter.mockReturnValue({
      limit: vi.fn().mockResolvedValue(rateLimitResponse),
    } as never)

    const { getRateLimitKey: mockGetKey } = await import('@/lib/rag/ratelimit')
    mockGetKey.mockReturnValue('session:session-abc')

    const { findRelevantProducts: mockFind } = await import('@/lib/rag/query')
    mockFind.mockResolvedValue(mockProducts)

    const { describeImagesForRetrieval: mockVision } = await import('@/lib/rag/vision')
    mockVision.mockResolvedValue('query')

    const { POST } = await import('@/app/api/rag/chat/route')
    const request = new NextRequest('http://localhost/api/rag/chat', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ messages: validMessages, sessionId: 'session-abc' }),
    })
    await POST(request)
    expect(mockGetKey).toHaveBeenCalledWith({ sessionId: 'session-abc', ip: 'anon' })
  })

  it('passes ip from x-forwarded-for header to rate limit key', async () => {
    mockStreamText.mockReturnValue({
      toUIMessageStreamResponse: () => new Response('ok'),
    })

    const { getChatLimiter: mockGetLimiter } = await import('@/lib/rag/ratelimit')
    mockGetLimiter.mockReturnValue({
      limit: vi.fn().mockResolvedValue(rateLimitResponse),
    } as never)

    const { getRateLimitKey: mockGetKey } = await import('@/lib/rag/ratelimit')
    mockGetKey.mockReturnValue('ip:192.168.1.100')

    const { findRelevantProducts: mockFind } = await import('@/lib/rag/query')
    mockFind.mockResolvedValue(mockProducts)

    const { describeImagesForRetrieval: mockVision } = await import('@/lib/rag/vision')
    mockVision.mockResolvedValue('query')

    const { POST } = await import('@/app/api/rag/chat/route')
    const request = new NextRequest('http://localhost/api/rag/chat', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-forwarded-for': '192.168.1.100, 10.0.0.1',
      },
      body: JSON.stringify({ messages: validMessages }),
    })
    await POST(request)
    expect(mockGetKey).toHaveBeenCalledWith({ ip: '192.168.1.100' })
  })
})

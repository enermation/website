import { describe, expect, it } from 'vitest'
import { getRateLimitKey } from '@/lib/rag/ratelimit'

describe('getRateLimitKey', () => {
  it('uses sessionId when provided', () => {
    const result = getRateLimitKey({ sessionId: 'abc123' })
    expect(result).toBe('session:abc123')
  })

  it('falls back to ip when sessionId not provided but ip is', () => {
    const result = getRateLimitKey({ ip: '192.168.1.1' })
    expect(result).toBe('ip:192.168.1.1')
  })

  it('returns unknown ip fallback when neither sessionId nor ip provided', () => {
    const result = getRateLimitKey({})
    expect(result).toBe('ip:unknown')
  })

  it('uses sessionId even if ip is also provided', () => {
    const result = getRateLimitKey({ sessionId: 'session-456', ip: '10.0.0.1' })
    expect(result).toBe('session:session-456')
  })

  it('returns ip fallback when sessionId is empty string', () => {
    const result = getRateLimitKey({ sessionId: '', ip: '10.0.0.1' })
    expect(result).toBe('ip:10.0.0.1')
  })
})

import 'server-only'

import { RateLimitError, ServerError } from './errors'

const DEFAULT_MAX_RETRIES = 6
const DEFAULT_BASE_DELAY_MS = 500
const DEFAULT_MAX_DELAY_MS = 60_000

// AI Gateway free tier and many providers: 3 RPM — rate limit backoff must be long
const RATE_LIMIT_BASE_DELAY_MS = 22_000

function jitter(ms: number): number {
  return ms + Math.random() * ms * 0.2 // +0–20%
}

function getStatusCode(err: unknown): number | undefined {
  // Check own property first
  if (err && typeof err === 'object' && 'statusCode' in err) {
    const sc = (err as { statusCode: unknown }).statusCode
    if (typeof sc === 'number') return sc
  }
  return undefined
}

function categorizeError(err: unknown): {
  retryable: boolean
  rateLimit: boolean
  retryAfterMs?: number
} {
  if (err instanceof RateLimitError) {
    return { retryable: true, rateLimit: true }
  }
  if (err instanceof ServerError) {
    const status = err.statusCode
    if (status === 429) {
      const match = err.message.match(/retry\s+after\s+(\d+)/i)
      return {
        retryable: true,
        rateLimit: true,
        retryAfterMs: match ? parseInt(match[1], 10) * 1000 : undefined,
      }
    }
    if (status === 503 || status === 504) {
      return { retryable: true, rateLimit: false }
    }
    if (status >= 500) {
      return { retryable: true, rateLimit: false }
    }
    return { retryable: false, rateLimit: false }
  }

  // Handle VoyageAIError and any other error with a statusCode
  const status = getStatusCode(err)
  if (status === 429) {
    const msg = err instanceof Error ? err.message : String(err)
    const match = msg.match(/retry\s+after\s+(\d+)/i)
    return {
      retryable: true,
      rateLimit: true,
      retryAfterMs: match ? parseInt(match[1], 10) * 1000 : undefined,
    }
  }
  if (status === 503 || status === 504) {
    return { retryable: true, rateLimit: false }
  }
  if (status && status >= 500) {
    return { retryable: true, rateLimit: false }
  }

  if (err instanceof Error) {
    const msg = err.message.toLowerCase()
    if (msg.includes('timeout') || msg.includes('econnreset') || msg.includes('enotfound')) {
      return { retryable: true, rateLimit: false }
    }
  }
  return { retryable: false, rateLimit: false }
}

export interface RetryOptions {
  retries?: number
  baseDelayMs?: number
  maxDelayMs?: number
  onRetry?: (err: unknown, attempt: number, delay: number) => void
}

export async function withRetry<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const {
    retries = DEFAULT_MAX_RETRIES,
    baseDelayMs = DEFAULT_BASE_DELAY_MS,
    maxDelayMs = DEFAULT_MAX_DELAY_MS,
    onRetry,
  } = options

  let lastErr: unknown

  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      return await fn()
    } catch (err) {
      lastErr = err
      const categorized = categorizeError(err)

      if (!categorized.retryable || attempt > retries + 1) {
        throw err
      }

      let delay: number
      if (categorized.retryAfterMs) {
        delay = categorized.retryAfterMs
      } else if (categorized.rateLimit) {
        // Rate limit: use long fixed backoff to respect RPM limit
        delay = jitter(RATE_LIMIT_BASE_DELAY_MS)
      } else {
        // Transient server error: exponential backoff
        const expDelay = Math.min(baseDelayMs * 2 ** (attempt - 1), maxDelayMs)
        delay = jitter(expDelay)
      }

      onRetry?.(err, attempt, delay)

      await sleep(delay)
    }
  }

  throw lastErr
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

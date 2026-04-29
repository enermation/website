import 'server-only'

import { RateLimitError, ServerError } from './errors'

const DEFAULT_MAX_RETRIES = 6
const DEFAULT_BASE_DELAY_MS = 500
const DEFAULT_MAX_DELAY_MS = 60_000

function jitter(ms: number): number {
  return Math.random() * ms
}

function categorizeError(err: unknown): { retryable: boolean; rateLimit: boolean } {
  if (err instanceof RateLimitError) {
    return { retryable: true, rateLimit: true }
  }
  if (err instanceof ServerError) {
    const status = err.statusCode
    if (status === 429 || status === 503 || status === 504) {
      return { retryable: true, rateLimit: status === 429 }
    }
    if (status >= 500) {
      return { retryable: true, rateLimit: false }
    }
    return { retryable: false, rateLimit: false }
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
      const { retryable, rateLimit } = categorizeError(err)

      if (!retryable || attempt > retries + 1) {
        throw err
      }

      // Exponential backoff with jitter: base * 2^(attempt-1), capped at max
      const expDelay = Math.min(baseDelayMs * 2 ** (attempt - 1), maxDelayMs)
      // Rate limit gets longer backoff
      const delay = rateLimit ? jitter(expDelay * 2) : jitter(expDelay)

      onRetry?.(err, attempt, delay)

      await sleep(delay)
    }
  }

  throw lastErr
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

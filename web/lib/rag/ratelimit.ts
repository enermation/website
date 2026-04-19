import { Ratelimit } from '@upstash/ratelimit'
import { getRedis } from '@/lib/rag/clients'
import { RATELIMIT_REQUESTS, RATELIMIT_WINDOW } from '@/lib/rag/constants'

let limiter: Ratelimit | undefined

export function getChatLimiter(): Ratelimit {
  if (!limiter) {
    limiter = new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.slidingWindow(RATELIMIT_REQUESTS, RATELIMIT_WINDOW),
      analytics: true,
      prefix: 'rag:chat',
    })
  }
  return limiter
}

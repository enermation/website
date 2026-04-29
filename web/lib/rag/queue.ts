import 'server-only'

import { getRedis } from '@/lib/rag/clients'

const QUEUE_KEY = 'rag:jobs'
const LAST_REINDEX_KEY = 'rag:last_reindex'

export type JobAction = 'upsert' | 'delete'

export interface RagJob {
  handle: string
  action: JobAction
  timestamp: number
}

export async function enqueueJob(handle: string, action: JobAction): Promise<void> {
  const redis = getRedis()
  const job: RagJob = { handle, action, timestamp: Date.now() }
  await redis.lpush(QUEUE_KEY, JSON.stringify(job))
}

export async function dequeueJobs(count = 100): Promise<RagJob[]> {
  const redis = getRedis()
  const raw = await redis.lrange(QUEUE_KEY, 0, count - 1)
  if (!raw || raw.length === 0) return []

  // Remove dequeued items from the list
  await redis.ltrim(QUEUE_KEY, raw.length, -1)

  const jobs: RagJob[] = []
  for (const item of raw) {
    if (typeof item === 'string') {
      try {
        jobs.push(JSON.parse(item) as RagJob)
      } catch {
        // malformed item, skip
      }
    }
  }
  return jobs
}

export async function getQueueDepth(): Promise<number> {
  const redis = getRedis()
  const len = await redis.llen(QUEUE_KEY)
  return typeof len === 'number' ? len : 0
}

export async function setLastReindex(timestamp: number): Promise<void> {
  const redis = getRedis()
  await redis.set(LAST_REINDEX_KEY, timestamp.toString())
}

export async function getLastReindex(): Promise<number | null> {
  const redis = getRedis()
  const val = await redis.get<string>(LAST_REINDEX_KEY)
  if (!val || typeof val !== 'string') return null
  const parsed = parseInt(val, 10)
  return isNaN(parsed) ? null : parsed
}

import { NextResponse } from 'next/server'
import { getQdrantClient } from '@/lib/rag/clients'
import { QDRANT_COLLECTION } from '@/lib/rag/constants'
import { embedQuery } from '@/lib/rag/embed'
import { getLastReindex, getQueueDepth } from '@/lib/rag/queue'

export async function GET() {
  const results = {
    qdrant: {
      ok: false,
      collection: QDRANT_COLLECTION,
      points: 0 as number | null,
      error: null as string | null,
    },
    voyage: { ok: false, error: null as string | null },
    redis: { ok: false, error: null as string | null },
    lastReindex: null as string | null,
    queueDepth: 0,
    shopifyProducts: null as number | null,
  }

  // Qdrant health
  try {
    const client = getQdrantClient()
    const info = await client.getCollection(QDRANT_COLLECTION)
    results.qdrant.ok = true
    results.qdrant.points = info.points_count ?? null
  } catch (err) {
    results.qdrant.error = err instanceof Error ? err.message : String(err)
  }

  // Voyage AI health
  try {
    // Minimal query embed to verify API key works
    await embedQuery('health check')
    results.voyage.ok = true
  } catch (err) {
    results.voyage.error = err instanceof Error ? err.message : String(err)
  }

  // Redis health
  try {
    const depth = await getQueueDepth()
    const lastReindexTs = await getLastReindex()
    results.redis.ok = true
    results.queueDepth = depth
    results.lastReindex = lastReindexTs ? new Date(lastReindexTs).toISOString() : null
  } catch (err) {
    results.redis.error = err instanceof Error ? err.message : String(err)
  }

  const allOk = results.qdrant.ok && results.voyage.ok && results.redis.ok

  return NextResponse.json({ ok: allOk, ...results })
}

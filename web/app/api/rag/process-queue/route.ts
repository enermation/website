import { NextResponse } from 'next/server'
import { deleteFromIndex, reindexHandles } from '@/lib/rag/indexer'
import { dequeueJobs, type RagJob } from '@/lib/rag/queue'

export async function POST(request: Request) {
  // Optional: verify cron secret from Vercel
  const cronSecret = request.headers.get('x-cron-secret')
  if (cronSecret !== process.env.RAG_CRON_SECRET) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  const jobs = await dequeueJobs(100)

  if (jobs.length === 0) {
    return NextResponse.json({ ok: true, processed: 0, message: 'Queue empty' })
  }

  // Deduplicate by handle: keep the last action per handle
  const lastByHandle = new Map<string, RagJob>()
  for (const job of jobs) {
    lastByHandle.set(job.handle, job)
  }

  const upsertHandles: string[] = []
  const deleteHandles: string[] = []

  for (const job of lastByHandle.values()) {
    if (job.action === 'upsert') {
      upsertHandles.push(job.handle)
    } else if (job.action === 'delete') {
      deleteHandles.push(job.handle)
    }
  }

  const results = {
    upserted: { indexed: 0, failed: 0 },
    deleted: 0,
    errors: [] as string[],
  }

  if (upsertHandles.length > 0) {
    try {
      const result = await reindexHandles(upsertHandles)
      results.upserted = { indexed: result.indexed, failed: result.failed }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      results.errors.push(`Upsert error: ${msg}`)
    }
  }

  if (deleteHandles.length > 0) {
    try {
      await deleteFromIndex(deleteHandles)
      results.deleted = deleteHandles.length
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      results.errors.push(`Delete error: ${msg}`)
    }
  }

  return NextResponse.json({
    ok: results.errors.length === 0,
    processed: jobs.length,
    uniqueHandles: lastByHandle.size,
    ...results,
  })
}

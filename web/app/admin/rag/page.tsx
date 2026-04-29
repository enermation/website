import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { QDRANT_COLLECTION } from '@/lib/rag/constants'
import { getLastReindex, getQueueDepth } from '@/lib/rag/queue'

async function getStatus() {
  // Dynamic import to avoid top-level server-only issues
  const { getQdrantClient } = await import('@/lib/rag/clients')
  const { embedQuery } = await import('@/lib/rag/embed')

  const results = {
    qdrant: { ok: false, points: null as number | null, error: null as string | null },
    voyage: { ok: false, error: null as string | null },
    redis: { ok: false, error: null as string | null },
    lastReindex: null as string | null,
    queueDepth: 0,
  }

  try {
    const client = getQdrantClient()
    const info = await client.getCollection(QDRANT_COLLECTION)
    results.qdrant.ok = true
    results.qdrant.points = info.points_count ?? null
  } catch (err) {
    results.qdrant.error = err instanceof Error ? err.message : String(err)
  }

  try {
    await embedQuery('health check')
    results.voyage.ok = true
  } catch (err) {
    results.voyage.error = err instanceof Error ? err.message : String(err)
  }

  try {
    const depth = await getQueueDepth()
    const lastReindexTs = await getLastReindex()
    results.redis.ok = true
    results.queueDepth = depth
    results.lastReindex = lastReindexTs ? new Date(lastReindexTs).toISOString() : null
  } catch (err) {
    results.redis.error = err instanceof Error ? err.message : String(err)
  }

  return results
}

export default async function AdminRagPage() {
  const status = await getStatus()

  return (
    <div className="container max-w-4xl py-8 space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold">RAG Administration</h1>
        <p className="text-muted-foreground mt-1">
          Manage the RAG index, queue, and reindex operations.
        </p>
      </div>

      {/* Service Status */}
      <Card>
        <CardHeader>
          <CardTitle>Service Status</CardTitle>
          <CardDescription>Health of each RAG pipeline component.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-2">
                <span className="font-medium">Qdrant</span>
                <Badge variant={status.qdrant.ok ? 'default' : 'destructive'} className="text-xs">
                  {status.qdrant.ok ? 'Healthy' : 'Down'}
                </Badge>
              </div>
              {status.qdrant.ok && (
                <span className="text-sm text-muted-foreground">
                  {status.qdrant.points?.toLocaleString()} pts
                </span>
              )}
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-2">
                <span className="font-medium">Voyage AI</span>
                <Badge variant={status.voyage.ok ? 'default' : 'destructive'} className="text-xs">
                  {status.voyage.ok ? 'Healthy' : 'Down'}
                </Badge>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-2">
                <span className="font-medium">Redis</span>
                <Badge variant={status.redis.ok ? 'default' : 'destructive'} className="text-xs">
                  {status.redis.ok ? 'Healthy' : 'Down'}
                </Badge>
              </div>
              {status.redis.ok && (
                <span className="text-sm text-muted-foreground">{status.queueDepth} queue</span>
              )}
            </div>
          </div>

          {status.lastReindex && (
            <p className="text-sm text-muted-foreground">
              Last reindex: {new Date(status.lastReindex).toLocaleString()}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Reindex Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Reindex Operations</CardTitle>
          <CardDescription>Use these controls to manage the RAG vector index.</CardDescription>
        </CardHeader>
        <CardContent>
          <AdminReindexClient qdrantOk={status.qdrant.ok} voyageOk={status.voyage.ok} />
        </CardContent>
      </Card>
    </div>
  )
}

function AdminReindexClient({ qdrantOk, voyageOk }: { qdrantOk: boolean; voyageOk: boolean }) {
  return (
    <div className="space-y-6">
      {/* Full reindex */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          formAction={async () => {
            'use server'
            const { reindexAll } = await import('@/lib/rag/indexer')
            await reindexAll({ fresh: false })
          }}
          disabled={!qdrantOk || !voyageOk}
        >
          Full Reindex (All Products)
        </Button>

        <Button
          formAction={async () => {
            'use server'
            const { reindexAll } = await import('@/lib/rag/indexer')
            await reindexAll({ fresh: true })
          }}
          variant="destructive"
          disabled={!qdrantOk || !voyageOk}
        >
          Fresh Reindex (Delete + Recreate)
        </Button>

        <Button
          formAction={async () => {
            'use server'
            const { dequeueJobs } = await import('@/lib/rag/queue')
            const { reindexHandles, deleteFromIndex } = await import('@/lib/rag/indexer')
            const jobs = await dequeueJobs(100)
            if (jobs.length === 0) return
            const lastByHandle = new Map()
            for (const job of jobs) lastByHandle.set(job.handle, job)
            const upsert: string[] = []
            const del: string[] = []
            for (const job of lastByHandle.values()) {
              if (job.action === 'upsert') upsert.push(job.handle)
              else del.push(job.handle)
            }
            if (upsert.length > 0) await reindexHandles(upsert)
            if (del.length > 0) await deleteFromIndex(del)
          }}
          variant="outline"
        >
          Process Queue Now
        </Button>
      </div>

      {/* Handle-specific reindex */}
      <div className="space-y-2">
        <Label htmlFor="handles">Specific Handles</Label>
        <div className="flex gap-2">
          <form
            className="flex-1 flex gap-2"
            action={async formData => {
              'use server'
              const handles = (formData.get('handles') as string)
                .split(',')
                .map(h => h.trim())
                .filter(Boolean)
              if (!handles.length) return
              const { reindexHandles } = await import('@/lib/rag/indexer')
              await reindexHandles(handles)
            }}
          >
            <Input
              id="handles"
              name="handles"
              placeholder="handle1, handle2, handle3"
              className="flex-1"
            />
            <Button type="submit" disabled={!qdrantOk || !voyageOk}>
              Reindex Handles
            </Button>
          </form>
        </div>
        <p className="text-xs text-muted-foreground">
          Comma-separated product handles. Triggers incremental reindex.
        </p>
      </div>

      {/* Test webhook */}
      <div className="space-y-2">
        <Label htmlFor="test-handle">Test Webhook (Enqueue Single)</Label>
        <div className="flex gap-2">
          <form
            className="flex-1 flex gap-2"
            action={async formData => {
              'use server'
              const handle = (formData.get('handle') as string).trim()
              if (!handle) return
              const { enqueueJob } = await import('@/lib/rag/queue')
              await enqueueJob(handle, 'upsert')
            }}
          >
            <Input
              id="test-handle"
              name="handle"
              placeholder="toyota-hilux-2024"
              className="flex-1"
            />
            <Button type="submit" variant="outline">
              Enqueue
            </Button>
          </form>
        </div>
        <p className="text-xs text-muted-foreground">
          Adds a single product handle to the Redis queue for processing.
        </p>
      </div>
    </div>
  )
}

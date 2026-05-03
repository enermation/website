import { NextResponse } from 'next/server'
import { getQdrantClient } from '@/lib/rag/clients'
import { QDRANT_COLLECTION } from '@/lib/rag/constants'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const client = getQdrantClient()
    await client.getCollection(QDRANT_COLLECTION)
    return NextResponse.json({ ok: true, ts: new Date().toISOString() })
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    )
  }
}

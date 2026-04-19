import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization')

  if (authHeader !== `Bearer ${process.env.RAG_ADMIN_SECRET}`) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  let fresh = false

  try {
    const body = await request.json()
    fresh = body.fresh === true
  } catch {
    // body optional, ignore parse errors
  }

  try {
    const { reindexAll } = await import('@/lib/rag/indexer')
    const result = await reindexAll({ fresh })
    return NextResponse.json({ ok: true, ...result })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}

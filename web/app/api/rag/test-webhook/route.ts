import { NextResponse } from 'next/server'

import { enqueueJob } from '@/lib/rag/queue'

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization')

  if (authHeader !== `Bearer ${process.env.RAG_ADMIN_SECRET}`) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  let handle: string

  try {
    const body = await request.json()
    handle = body.handle
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!handle || typeof handle !== 'string') {
    return NextResponse.json({ ok: false, error: 'Missing handle field' }, { status: 400 })
  }

  await enqueueJob(handle, 'upsert')

  return NextResponse.json({
    ok: true,
    message: `Enqueued upsert job for handle: ${handle}`,
    handle,
  })
}

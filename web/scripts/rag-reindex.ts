#!/usr/bin/env bun

/**
 * RAG reindex CLI script.
 * Calls the /api/rag/reindex endpoint using the RAG_ADMIN_SECRET.
 *
 * Usage:
 *   bun run scripts/rag-reindex.ts                    # incremental (all products)
 *   bun run scripts/rag-reindex.ts --fresh            # fresh reindex (delete + recreate)
 *   bun run scripts/rag-reindex.ts handle1 handle2    # specific handles
 */

const args = process.argv.slice(2)

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
RAG Reindex CLI

Usage:
  bun run scripts/rag-reindex.ts               # incremental (all products)
  bun run scripts/rag-reindex.ts --fresh      # fresh reindex (delete + recreate)
  bun run scripts/rag-reindex.ts HANDLE [...]  # specific handles only
  bun run scripts/rag-reindex.ts --help       # show this help

Environment:
  PUBLIC_STORE_DOMAIN    — Shopify store domain (e.g. store.myshopify.com)
  RAG_ADMIN_SECRET       — secret token for /api/rag/reindex auth
`)
  process.exit(0)
}

const fresh = args.includes('--fresh')
const handles = args.filter(arg => !arg.startsWith('--'))

const baseUrl = process.env.BASE_URL ?? 'http://localhost:3000'
const secret = process.env.RAG_ADMIN_SECRET

if (!secret) {
  console.error('[rag-reindex] Error: RAG_ADMIN_SECRET environment variable is not set')
  process.exit(1)
}

async function callReindex(body: Record<string, unknown>) {
  const res = await fetch(`${baseUrl}/api/rag/reindex`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${secret}`,
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`HTTP ${res.status}: ${text}`)
  }

  return res.json()
}

async function main() {
  console.log('[rag-reindex] Starting reindex...')

  const start = Date.now()

  let result: {
    ok: boolean
    indexed: number
    failed: number
    durationMs: number
    deleted?: number
    error?: string
  }

  if (handles.length > 0) {
    console.log(
      `[rag-reindex] Incremental reindex for ${handles.length} handle(s): ${handles.join(', ')}`
    )
    result = await callReindex({ handles })
  } else if (fresh) {
    console.log('[rag-reindex] Full fresh reindex (delete + recreate)')
    result = await callReindex({ fresh: true })
  } else {
    console.log('[rag-reindex] Incremental reindex (all products)')
    result = await callReindex({})
  }

  const elapsed = ((Date.now() - start) / 1000).toFixed(1)

  if (!result.ok) {
    console.error(`[rag-reindex] Failed: ${result.error}`)
    process.exit(1)
  }

  console.log(`[rag-reindex] Done in ${elapsed}s`)
  console.log(
    `[rag-reindex] Indexed: ${result.indexed} | Failed: ${result.failed} | Duration: ${result.durationMs}ms`
  )

  if (result.deleted !== undefined && result.deleted > 0) {
    console.log(`[rag-reindex] Deleted: ${result.deleted}`)
  }

  if (result.failed > 0) {
    process.exit(1)
  }
}

main().catch(err => {
  console.error(`[rag-reindex] Fatal error: ${err instanceof Error ? err.message : String(err)}`)
  process.exit(1)
})

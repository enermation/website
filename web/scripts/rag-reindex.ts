#!/usr/bin/env bun

/**
 * RAG reindex CLI script.
 *
 * Usage:
 *   bun run scripts/rag-reindex.ts                    # incremental (all products)
 *   bun run scripts/rag-reindex.ts --fresh            # fresh reindex (delete + recreate)
 *   bun run scripts/rag-reindex.ts handle1 handle2     # specific handles
 */

import { reindexAll, reindexHandles } from '../lib/rag/indexer'

const args = process.argv.slice(2)

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
RAG Reindex CLI

Usage:
  bun run scripts/rag-reindex.ts               # incremental (all products)
  bun run scripts/rag-reindex.ts --fresh       # fresh reindex (delete + recreate)
  bun run scripts/rag-reindex.ts HANDLE [...]   # specific handles only
  bun run scripts/rag-reindex.ts --help         # show this help
`)
  process.exit(0)
}

const fresh = args.includes('--fresh')
const handles = args.filter(arg => !arg.startsWith('--'))

async function main() {
  console.log('[rag-reindex] Starting reindex...')

  const start = Date.now()

  let result: Awaited<ReturnType<typeof reindexAll>> | Awaited<ReturnType<typeof reindexHandles>>

  if (handles.length > 0) {
    console.log(
      `[rag-reindex] Incremental reindex for ${handles.length} handle(s): ${handles.join(', ')}`
    )
    result = await reindexHandles(handles)
  } else if (fresh) {
    console.log('[rag-reindex] Full fresh reindex (delete + recreate)')
    result = await reindexAll({ fresh: true })
  } else {
    console.log('[rag-reindex] Incremental reindex (all products)')
    result = await reindexAll({ fresh: false })
  }

  const elapsed = ((Date.now() - start) / 1000).toFixed(1)

  console.log(`[rag-reindex] Done in ${elapsed}s`)
  console.log(
    `[rag-reindex] Indexed: ${result.indexed} | Failed: ${result.failed} | Duration: ${result.durationMs}ms`
  )

  if ('deleted' in result && result.deleted > 0) {
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

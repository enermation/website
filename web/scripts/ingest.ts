#!/usr/bin/env bun
/**
 * Ingest all Shopify products into Qdrant via the Vercel AI Gateway.
 *
 * Requires gateway OIDC auth — run inside `vercel dev`, or set VERCEL_OIDC_TOKEN.
 * Bun loads .env.local automatically when run from the web/ directory.
 *
 * Usage:
 *   bun run scripts/ingest.ts            # upsert all products (add/update)
 *   bun run scripts/ingest.ts --fresh    # drop + recreate collection from scratch
 *   bun run scripts/ingest.ts --dry-run  # preflight checks only, no writes
 *   bun run scripts/ingest.ts --help
 */

const args = process.argv.slice(2)

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Enermation RAG Ingest

Usage:
  bun run scripts/ingest.ts            upsert all products (no deletion)
  bun run scripts/ingest.ts --fresh    drop + recreate collection from scratch
  bun run scripts/ingest.ts --dry-run  preflight only — validate env + embedding dims

Auth:
  Run inside \`vercel dev\` for automatic OIDC, or set VERCEL_OIDC_TOKEN manually.

Required env vars:
  PUBLIC_STORE_DOMAIN          Shopify store domain
  SHOPIFY_ADMIN_ACCESS_TOKEN   Shopify Admin API token
  QDRANT_URL                   Qdrant instance URL
  QDRANT_API_KEY               Qdrant API key
  UPSTASH_REDIS_REST_URL       Upstash Redis URL
  UPSTASH_REDIS_REST_TOKEN     Upstash Redis token
`)
  process.exit(0)
}

const fresh = args.includes('--fresh')
const dryRun = args.includes('--dry-run')

// ── Env preflight ──────────────────────────────────────────────────────────────

const REQUIRED_VARS = [
  'PUBLIC_STORE_DOMAIN',
  'SHOPIFY_ADMIN_ACCESS_TOKEN',
  'QDRANT_URL',
  'QDRANT_API_KEY',
  'UPSTASH_REDIS_REST_URL',
  'UPSTASH_REDIS_REST_TOKEN',
]

const missing = REQUIRED_VARS.filter(v => !process.env[v]?.trim())
if (missing.length > 0) {
  console.error(
    `[ingest] Missing required environment variables:\n${missing.map(v => `  - ${v}`).join('\n')}`
  )
  console.error('[ingest] Run from web/ directory so .env.local is loaded, or use `vercel dev`.')
  process.exit(1)
}

// ── Embedding dimension preflight ─────────────────────────────────────────────

import { EMBED_DIMENSIONS } from '@/lib/rag/constants'
import { embedQuery } from '@/lib/rag/embed'

console.log(
  `[ingest] Preflight: testing embed dimension via gateway (expected ${EMBED_DIMENSIONS})...`
)

let testEmbedding: number[]
try {
  testEmbedding = await embedQuery('preflight dimension check')
} catch (err) {
  console.error(
    `[ingest] Gateway embedding failed — is VERCEL_OIDC_TOKEN set, or are you running inside vercel dev?`
  )
  console.error(`[ingest] ${err instanceof Error ? err.message : String(err)}`)
  process.exit(1)
}

if (testEmbedding.length !== EMBED_DIMENSIONS) {
  console.error(
    `[ingest] Dimension mismatch: gateway returned ${testEmbedding.length}-dim vectors but EMBED_DIMENSIONS=${EMBED_DIMENSIONS}.`
  )
  console.error(
    `[ingest] Update EMBED_DIMENSIONS in lib/rag/constants.ts to ${testEmbedding.length} and re-run.`
  )
  process.exit(1)
}

console.log(`[ingest] Embedding OK — ${testEmbedding.length} dims`)

if (dryRun) {
  console.log('[ingest] Dry-run complete. All checks passed.')
  process.exit(0)
}

// ── Run indexer ────────────────────────────────────────────────────────────────

import { reindexAll } from '@/lib/rag/indexer'

const mode = fresh ? 'fresh (drop + recreate)' : 'upsert'
console.log(`[ingest] Starting ${mode} reindex...`)
console.log()

const tickStart = Date.now()
const ticker = setInterval(() => {
  const elapsed = ((Date.now() - tickStart) / 1000).toFixed(0)
  process.stdout.write(`\r[ingest] Running... ${elapsed}s elapsed`)
}, 1000)

let result: { indexed: number; failed: number; durationMs: number }

try {
  result = await reindexAll({ fresh })
} catch (err) {
  clearInterval(ticker)
  process.stdout.write('\n')
  console.error(`[ingest] Fatal error: ${err instanceof Error ? err.message : String(err)}`)
  process.exit(1)
}

clearInterval(ticker)
process.stdout.write('\n')

// ── Summary ───────────────────────────────────────────────────────────────────

const totalSecs = (result.durationMs / 1000).toFixed(1)
console.log()
console.log(`[ingest] Done in ${totalSecs}s`)
console.log(`[ingest] Indexed : ${result.indexed}`)
console.log(`[ingest] Failed  : ${result.failed}`)

if (result.failed > 0) {
  console.error('[ingest] Some products failed to index. Check logs above.')
  process.exit(1)
}

import 'server-only'

import { getVoyageClient } from '@/lib/rag/clients'
import { RERANK_MODEL, TOP_K_RERANK } from '@/lib/rag/constants'
import { RateLimitError, ServerError } from '@/lib/rag/errors'
import { withRetry } from '@/lib/rag/retry'
import type { RagRetrievalResult } from '@/lib/rag/types'

export async function rerankCandidates(
  query: string,
  candidates: RagRetrievalResult[]
): Promise<RagRetrievalResult[]> {
  if (candidates.length <= TOP_K_RERANK) {
    return [...candidates].sort((a, b) => b.score - a.score)
  }

  const client = getVoyageClient()
  const documents = candidates.map(c => `${c.metadata.textSnippet} ${c.metadata.title}`)

  const response = await withRetry(
    async () => {
      const res = await client.rerank({
        query,
        documents,
        model: RERANK_MODEL,
        topK: TOP_K_RERANK,
      })
      if (!res.data) {
        throw new ServerError('Voyage rerank returned no data')
      }
      return res
    },
    {
      retries: 6,
      onRetry: (err, attempt) => {
        if (err instanceof RateLimitError) {
          console.warn(`[rag/rerank] Rate limited, retrying (attempt ${attempt})`)
        } else {
          console.warn(
            `[rag/rerank] Transient error, retrying (attempt ${attempt}): ${err instanceof Error ? err.message : String(err)}`
          )
        }
      },
    }
  )

  const reranked: RagRetrievalResult[] = []

  for (const result of response.data ?? []) {
    const idx = result.index ?? 0
    const original = candidates[idx]
    reranked.push({
      metadata: original.metadata,
      score: result.relevanceScore ?? 0,
    })
  }

  return reranked
}

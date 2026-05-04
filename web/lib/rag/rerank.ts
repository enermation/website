import 'server-only'

import { gateway } from '@ai-sdk/gateway'
import { rerank } from 'ai'
import { RERANK_MODEL, TOP_K_RERANK } from '@/lib/rag/constants'
import type { RagRetrievalResult } from '@/lib/rag/types'

export async function rerankCandidates(
  query: string,
  candidates: RagRetrievalResult[]
): Promise<RagRetrievalResult[]> {
  if (candidates.length <= TOP_K_RERANK) {
    return [...candidates].sort((a, b) => b.score - a.score)
  }

  const documents = candidates.map(c => `${c.metadata.textSnippet} ${c.metadata.title}`)

  const { ranking } = await rerank({
    model: gateway.rerankingModel(RERANK_MODEL),
    documents,
    query,
    topN: TOP_K_RERANK,
  })

  const reranked: RagRetrievalResult[] = []
  for (const item of ranking) {
    const original = candidates[item.originalIndex]
    reranked.push({
      metadata: original.metadata,
      score: item.score ?? 0,
    })
  }

  return reranked
}

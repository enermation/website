import 'server-only'

import { getVectorIndex } from '@/lib/rag/clients'
import { TOP_K_RETRIEVE } from '@/lib/rag/constants'
import { embedQuery } from '@/lib/rag/embed'
import { rerankCandidates } from '@/lib/rag/rerank'
import type { RagRetrievalResult } from '@/lib/rag/types'

export async function findRelevantProducts(query: string): Promise<RagRetrievalResult[]> {
  const vector = await embedQuery(query)

  const index = getVectorIndex()

  const results = await index.query({
    vector,
    topK: TOP_K_RETRIEVE,
    includeMetadata: true,
  })

  if (!results || results.length === 0) {
    return []
  }

  const candidates: RagRetrievalResult[] = results
    .filter(r => r.metadata !== undefined)
    .map(r => ({
      metadata: r.metadata as RagRetrievalResult['metadata'],
      score: r.score ?? 0,
    }))

  if (candidates.length === 0) {
    return []
  }

  return rerankCandidates(query, candidates)
}

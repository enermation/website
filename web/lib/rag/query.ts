import 'server-only'

import { getQdrantClient } from '@/lib/rag/clients'
import { QDRANT_COLLECTION, TOP_K_RETRIEVE } from '@/lib/rag/constants'
import { embedQuery } from '@/lib/rag/embed'
import { rerankCandidates } from '@/lib/rag/rerank'
import type { RagRetrievalResult } from '@/lib/rag/types'

export async function findRelevantProducts(query: string): Promise<RagRetrievalResult[]> {
  const vector = await embedQuery(query)

  const client = getQdrantClient()

  const results = await client.search(QDRANT_COLLECTION, {
    vector,
    limit: TOP_K_RETRIEVE,
    with_payload: true,
    with_vector: false,
  })

  if (!results || results.length === 0) {
    return []
  }

  const candidates: RagRetrievalResult[] = results
    .filter(r => r.payload !== undefined && r.payload !== null)
    .map(r => ({
      metadata: r.payload as RagRetrievalResult['metadata'],
      score: r.score ?? 0,
    }))

  if (candidates.length === 0) {
    return []
  }

  return rerankCandidates(query, candidates)
}

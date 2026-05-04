import 'server-only'

import { getQdrantClient } from '@/lib/rag/clients'
import {
  QDRANT_COLLECTION,
  QDRANT_DENSE_VECTOR,
  QDRANT_SCORE_THRESHOLD,
  QDRANT_SEARCH_EF,
  QDRANT_SPARSE_VECTOR,
  TOP_K_RETRIEVE,
} from '@/lib/rag/constants'
import { embedQuery } from '@/lib/rag/embed'
import { rerankCandidates } from '@/lib/rag/rerank'
import { toSparseVector } from '@/lib/rag/tokenizer'
import type { RagRetrievalResult } from '@/lib/rag/types'

export async function findRelevantProducts(query: string): Promise<RagRetrievalResult[]> {
  const [denseVector, sparseVector] = await Promise.all([
    embedQuery(query),
    Promise.resolve(toSparseVector(query)),
  ])

  const client = getQdrantClient()

  const response = await client.query(QDRANT_COLLECTION, {
    prefetch: [
      {
        query: denseVector,
        using: QDRANT_DENSE_VECTOR,
        limit: TOP_K_RETRIEVE,
        params: { hnsw_ef: QDRANT_SEARCH_EF, exact: false },
      },
      {
        query: { indices: sparseVector.indices, values: sparseVector.values },
        using: QDRANT_SPARSE_VECTOR,
        limit: TOP_K_RETRIEVE,
      },
    ],
    query: { fusion: 'rrf' },
    limit: TOP_K_RETRIEVE,
    score_threshold: QDRANT_SCORE_THRESHOLD,
    with_payload: true,
    with_vector: false,
  })

  const points = response.points ?? []

  if (points.length === 0) return []

  const candidates: RagRetrievalResult[] = points
    .filter((p): p is typeof p & { payload: NonNullable<typeof p.payload> } => p.payload != null)
    .map(p => ({
      metadata: p.payload as RagRetrievalResult['metadata'],
      score: p.score ?? 0,
    }))

  if (candidates.length === 0) return []

  return rerankCandidates(query, candidates)
}

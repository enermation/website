import 'server-only'

import { getQdrantClient } from '@/lib/rag/clients'
import {
  QDRANT_COLLECTION,
  QDRANT_DENSE_SCORE_THRESHOLD,
  QDRANT_DENSE_VECTOR,
  QDRANT_SEARCH_EF,
  QDRANT_SPARSE_SCORE_THRESHOLD,
  QDRANT_SPARSE_VECTOR,
  RERANK_SCORE_THRESHOLD,
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
        // Threshold on cosine similarity (0–1) — filters semantically irrelevant results
        // before they pollute the RRF fusion pool
        score_threshold: QDRANT_DENSE_SCORE_THRESHOLD,
      },
      {
        query: { indices: sparseVector.indices, values: sparseVector.values },
        using: QDRANT_SPARSE_VECTOR,
        limit: TOP_K_RETRIEVE,
        score_threshold: QDRANT_SPARSE_SCORE_THRESHOLD,
      },
    ],
    query: { fusion: 'rrf' },
    limit: TOP_K_RETRIEVE,
    // No score_threshold here — RRF scores are rank-based (~0.01–0.033),
    // incomparable to cosine similarity thresholds. Reranker handles quality filtering.
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

  return rerankCandidates(query, candidates).filter(c => c.score >= RERANK_SCORE_THRESHOLD)
}

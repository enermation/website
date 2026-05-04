export const EMBED_MODEL = 'cohere/embed-v4.0'
export const EMBED_DIMENSIONS = 1536
export const RERANK_MODEL = 'cohere/rerank-v4-fast'
export const CHAT_MODEL = 'openai/gpt-oss-120b'
export const VISION_MODEL = 'meta/llama-4-scout'
export const VISION_FALLBACK_MODEL = 'cohere/command-a'

export const TOP_K_RETRIEVE = 25
export const TOP_K_RERANK = 10

export const QDRANT_COLLECTION = 'enermation-products'
export const QDRANT_VECTOR_SIZE = EMBED_DIMENSIONS
export const QDRANT_DISTANCE = 'Cosine'
export const QDRANT_DENSE_VECTOR = 'dense'
export const QDRANT_SPARSE_VECTOR = 'sparse'

export const QDRANT_SEARCH_EF = 256
// Applied to the dense prefetch (cosine similarity, 0–1). NOT used on RRF fusion
// output — RRF scores are rank-based (~0.01–0.033) and cannot be compared to 0–1 thresholds.
export const QDRANT_DENSE_SCORE_THRESHOLD = 0.3

export const INDEX_BATCH_SIZE = 64
export const QDRANT_UPSERT_BATCH = 128

export const RATELIMIT_WINDOW = '60 s'
export const RATELIMIT_REQUESTS = 10

export const SYSTEM_PROMPT_VERSION = 'v1'

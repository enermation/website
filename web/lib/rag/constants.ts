export const EMBED_MODEL = 'embed-v4.0'
export const EMBED_DIMENSIONS = 1536
export const RERANK_MODEL = 'rerank-v4.0-fast'
export const CEREBRAS_MODEL = 'qwen-3-235b-a22b-instruct-2507'
export const GROQ_VISION_MODEL = 'llama-scout'
export const COHERE_VISION_MODEL = 'command-a-03-2025'

export const TOP_K_RETRIEVE = 25
export const TOP_K_RERANK = 6

export const QDRANT_COLLECTION = 'enermation-products'
export const QDRANT_VECTOR_SIZE = EMBED_DIMENSIONS
export const QDRANT_DISTANCE = 'Cosine'

export const QDRANT_SEARCH_EF = 256
export const QDRANT_SCORE_THRESHOLD = 0.5

export const INDEX_BATCH_SIZE = 64
export const QDRANT_UPSERT_BATCH = 128

export const RATELIMIT_WINDOW = '60 s'
export const RATELIMIT_REQUESTS = 10

export const SYSTEM_PROMPT_VERSION = 'v1'

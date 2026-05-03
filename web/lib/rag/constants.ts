export const EMBED_MODEL = 'embed-english-v3.0'
export const EMBED_DIMENSIONS = 1024
export const RERANK_MODEL = 'rerank-v3.5'
export const CEREBRAS_MODEL = 'qwen-3-235b-a22b-instruct-2507'
export const CEREBRAS_VISION_MODEL = 'qwen-3-235b-a22b-instruct-2507'
export const GROQ_VISION_MODEL = 'llama-scout'

export const TOP_K_RETRIEVE = 25
export const TOP_K_RERANK = 6

export const QDRANT_COLLECTION = 'enermation-products'
export const QDRANT_VECTOR_SIZE = EMBED_DIMENSIONS
export const QDRANT_DISTANCE = 'Cosine'

export const INDEX_BATCH_SIZE = 64
export const QDRANT_UPSERT_BATCH = 128

export const RATELIMIT_WINDOW = '60 s'
export const RATELIMIT_REQUESTS = 10

export const SYSTEM_PROMPT_VERSION = 'v1'

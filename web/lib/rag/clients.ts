import { QdrantClient } from '@qdrant/qdrant-js'
import { Redis } from '@upstash/redis'
import { gateway } from 'ai'
import { DEFAULT_CHAT_PROVIDER, VISION_MODEL_ID } from '@/lib/rag/constants'

function getRequiredEnv(name: string): string {
  const value = process.env[name]?.trim()
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

let redisClient: Redis | undefined
let qdrantClient: QdrantClient | undefined

export function getQdrantClient(): QdrantClient {
  if (!qdrantClient) {
    const url = getRequiredEnv('QDRANT_URL')
    const apiKey = getRequiredEnv('QDRANT_API_KEY')
    qdrantClient = new QdrantClient({ url, apiKey })
  }
  return qdrantClient
}

export function getRedis(): Redis {
  if (!redisClient) {
    redisClient = Redis.fromEnv()
  }
  return redisClient
}

export function getChatModel() {
  const provider = process.env.CHAT_PROVIDER ?? DEFAULT_CHAT_PROVIDER

  const modelId = process.env.CHAT_MODEL_ID
  if (modelId) {
    return gateway(modelId)
  }

  if (provider === 'anthropic') {
    return gateway('anthropic/claude-haiku-4.5')
  }
  if (provider === 'groq') {
    return gateway('groq/llama-4-scout-17b-16e-instruct')
  }

  throw new Error(`Invalid CHAT_PROVIDER: "${provider}". Must be "anthropic" or "groq".`)
}

export function getVisionModel() {
  const modelId = process.env.VISION_MODEL_ID ?? VISION_MODEL_ID
  return gateway(modelId)
}

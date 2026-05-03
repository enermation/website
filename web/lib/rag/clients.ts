import { QdrantClient } from '@qdrant/qdrant-js'
import { Redis } from '@upstash/redis'
import { gateway } from 'ai'
import { CEREBRAS_MODEL, GROQ_VISION_MODEL } from '@/lib/rag/constants'

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
  return gateway(CEREBRAS_MODEL)
}

export function getVisionModel() {
  return gateway(GROQ_VISION_MODEL)
}

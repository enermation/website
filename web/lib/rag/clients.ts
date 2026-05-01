import { QdrantClient } from '@qdrant/qdrant-js'
import { Redis } from '@upstash/redis'
import { gateway } from 'ai'
import {
  DEFAULT_CHAT_PROVIDER,
  DEFAULT_COHERE_MODEL,
  DEFAULT_GROQ_MODEL,
  DEFAULT_VISION_MODEL,
} from '@/lib/rag/constants'

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

  if (provider === 'groq') {
    return gateway(`groq/${DEFAULT_GROQ_MODEL}`, {
      providerOptions: {
        gateway: {
          order: ['groq', 'cohere'],
        },
      },
    })
  }
  if (provider === 'cohere') {
    return gateway(`cohere/${DEFAULT_COHERE_MODEL}`)
  }

  throw new Error(`Invalid CHAT_PROVIDER: "${provider}". Must be "groq" or "cohere".`)
}

export function getVisionModel() {
  return gateway(`groq/${DEFAULT_VISION_MODEL}`)
}

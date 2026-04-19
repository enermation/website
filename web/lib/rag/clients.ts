import { anthropic } from '@ai-sdk/anthropic'
import { groq } from '@ai-sdk/groq'
import { Redis } from '@upstash/redis'
import { Index } from '@upstash/vector'
import { VoyageAIClient } from 'voyageai'
import {
  DEFAULT_ANTHROPIC_MODEL,
  DEFAULT_CHAT_PROVIDER,
  DEFAULT_GROQ_MODEL,
} from '@/lib/rag/constants'
import type { ProductChunkMetadata } from '@/lib/rag/types'

function getRequiredEnv(name: string): string {
  const value = process.env[name]?.trim()
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

type AnthropicModel = ReturnType<typeof anthropic>
type GroqModel = ReturnType<typeof groq>
type ChatModel = AnthropicModel | GroqModel

let voyageClient: VoyageAIClient | undefined
let vectorIndex: Index<ProductChunkMetadata> | undefined
let redisClient: Redis | undefined
let chatModelInstance: ChatModel | undefined

export function getVoyageClient(): VoyageAIClient {
  if (!voyageClient) {
    const apiKey = getRequiredEnv('VOYAGE_API_KEY')
    voyageClient = new VoyageAIClient({ apiKey })
  }
  return voyageClient
}

export function getVectorIndex(): Index<ProductChunkMetadata> {
  if (!vectorIndex) {
    const url = getRequiredEnv('UPSTASH_VECTOR_REST_URL')
    const token = getRequiredEnv('UPSTASH_VECTOR_REST_TOKEN')
    vectorIndex = new Index<ProductChunkMetadata>({ url, token })
  }
  return vectorIndex
}

export function getRedis(): Redis {
  if (!redisClient) {
    redisClient = Redis.fromEnv()
  }
  return redisClient
}

export function getChatModel(): ChatModel {
  if (!chatModelInstance) {
    const provider = process.env.CHAT_PROVIDER ?? DEFAULT_CHAT_PROVIDER
    const modelId =
      process.env.CHAT_MODEL_ID ??
      (provider === 'anthropic' ? DEFAULT_ANTHROPIC_MODEL : DEFAULT_GROQ_MODEL)

    if (provider === 'anthropic') {
      chatModelInstance = anthropic(modelId)
    } else if (provider === 'groq') {
      chatModelInstance = groq(modelId)
    } else {
      throw new Error(`Invalid CHAT_PROVIDER: "${provider}". Must be "anthropic" or "groq".`)
    }
  }
  return chatModelInstance
}

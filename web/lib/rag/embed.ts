import 'server-only'

import { cohere } from '@ai-sdk/cohere'
import { embed, embedMany } from 'ai'
import { EMBED_MODEL, INDEX_BATCH_SIZE } from '@/lib/rag/constants'

const queryCache = new Map<string, Promise<number[]>>()

export async function embedDocuments(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return []

  const results: number[][] = []

  for (let i = 0; i < texts.length; i += INDEX_BATCH_SIZE) {
    const batch = texts.slice(i, i + INDEX_BATCH_SIZE)

    const { embeddings } = await embedMany({
      model: cohere.embedding(EMBED_MODEL),
      values: batch,
      providerOptions: {
        cohere: { inputType: 'search_document' },
      },
    })

    results.push(...embeddings)
  }

  return results
}

export async function embedQuery(text: string): Promise<number[]> {
  const cached = queryCache.get(text)
  if (cached) return cached

  const promise = doEmbedQuery(text)
  queryCache.set(text, promise)
  return promise
}

async function doEmbedQuery(text: string): Promise<number[]> {
  const { embedding } = await embed({
    model: cohere.embedding(EMBED_MODEL),
    value: text,
    providerOptions: {
      cohere: { inputType: 'search_query' },
    },
  })
  return embedding
}

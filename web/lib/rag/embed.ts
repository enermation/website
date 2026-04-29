import 'server-only'

import { cohere } from '@ai-sdk/cohere'
import { embed } from 'ai'
import { EMBED_MODEL, INDEX_BATCH_SIZE } from '@/lib/rag/constants'

export async function embedDocuments(texts: string[]): Promise<number[][]> {
  const results: number[][] = []

  for (let i = 0; i < texts.length; i += INDEX_BATCH_SIZE) {
    const batch = texts.slice(i, i + INDEX_BATCH_SIZE)

    const embeddings = await Promise.all(
      batch.map(async text => {
        const { embedding } = await embed({
          model: cohere.embedding(EMBED_MODEL),
          value: text,
          providerOptions: {
            cohere: { inputType: 'search_document' },
          },
        })
        return embedding
      })
    )

    results.push(...embeddings)
  }

  return results
}

export async function embedQuery(text: string): Promise<number[]> {
  const { embedding } = await embed({
    model: cohere.embedding(EMBED_MODEL),
    value: text,
    providerOptions: {
      cohere: { inputType: 'search_query' },
    },
  })
  return embedding
}

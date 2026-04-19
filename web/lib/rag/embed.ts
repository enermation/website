import 'server-only'

import { getVoyageClient } from '@/lib/rag/clients'
import { EMBED_MODEL, INDEX_BATCH_SIZE } from '@/lib/rag/constants'

export async function embedDocuments(texts: string[]): Promise<number[][]> {
  const client = getVoyageClient()
  const batches: string[][] = []

  for (let i = 0; i < texts.length; i += INDEX_BATCH_SIZE) {
    batches.push(texts.slice(i, i + INDEX_BATCH_SIZE))
  }

  const results: number[][] = []

  for (const batch of batches) {
    const response = await client.embed({
      input: batch,
      model: EMBED_MODEL,
      inputType: 'document',
    })

    if (!response.data || response.data.length === 0) {
      throw new Error(`Voyage embed batch failed: no data returned`)
    }

    for (const embedding of response.data) {
      if (!embedding.embedding) {
        throw new Error(`Voyage embed batch returned null embedding`)
      }
      results.push(embedding.embedding)
    }
  }

  return results
}

export async function embedQuery(text: string): Promise<number[]> {
  const client = getVoyageClient()

  const response = await client.embed({
    input: [text],
    model: EMBED_MODEL,
    inputType: 'query',
  })

  if (!response.data || response.data.length === 0 || !response.data[0]?.embedding) {
    throw new Error(`Voyage embed query failed: no data returned`)
  }

  return response.data[0].embedding
}

import 'server-only'

import { getVoyageClient } from '@/lib/rag/clients'
import { EMBED_MODEL, INDEX_BATCH_SIZE } from '@/lib/rag/constants'
import { RateLimitError, ServerError } from '@/lib/rag/errors'
import { withRetry } from '@/lib/rag/retry'

export async function embedDocuments(texts: string[]): Promise<number[][]> {
  const client = getVoyageClient()
  const batches: string[][] = []

  for (let i = 0; i < texts.length; i += INDEX_BATCH_SIZE) {
    batches.push(texts.slice(i, i + INDEX_BATCH_SIZE))
  }

  const results: number[][] = []

  for (const batch of batches) {
    const response = await withRetry(
      async () => {
        const res = await client.embed({
          input: batch,
          model: EMBED_MODEL,
          inputType: 'document',
        })
        if (!res.data || res.data.length === 0) {
          throw new ServerError('Voyage embed batch failed: no data returned')
        }
        return res as Required<typeof res>
      },
      {
        retries: 6,
        onRetry: (err, attempt) => {
          if (err instanceof RateLimitError) {
            console.warn(`[rag/embed] Rate limited, retrying (attempt ${attempt})`)
          } else {
            console.warn(
              `[rag/embed] Transient error, retrying (attempt ${attempt}): ${err instanceof Error ? err.message : String(err)}`
            )
          }
        },
      }
    )

    for (const embedding of response.data) {
      if (!embedding.embedding) {
        throw new ServerError('Voyage embed batch returned null embedding')
      }
      results.push(embedding.embedding)
    }
  }

  return results
}

export async function embedQuery(text: string): Promise<number[]> {
  const client = getVoyageClient()

  const response = await withRetry(
    async () => {
      const res = await client.embed({
        input: [text],
        model: EMBED_MODEL,
        inputType: 'query',
      })
      if (!res.data || res.data.length === 0 || !res.data[0]?.embedding) {
        throw new ServerError('Voyage embed query failed: no data returned')
      }
      return res.data[0].embedding as number[]
    },
    {
      retries: 6,
      onRetry: (err, attempt) => {
        if (err instanceof RateLimitError) {
          console.warn(`[rag/embed] Rate limited on query, retrying (attempt ${attempt})`)
        } else {
          console.warn(
            `[rag/embed] Transient query error, retrying (attempt ${attempt}): ${err instanceof Error ? err.message : String(err)}`
          )
        }
      },
    }
  )

  return response
}

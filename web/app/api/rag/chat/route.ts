import type { TextStreamPart, UIMessage } from 'ai'
import { convertToModelMessages, generateObject, streamText, type ToolSet } from 'ai'
import { NextResponse } from 'next/server'
import { z } from 'zod'

import { chatModelByok, getChatModel } from '@/lib/rag/clients'

import { buildGroundedSystemPrompt } from '@/lib/rag/prompt'
import { findRelevantProducts } from '@/lib/rag/query'
import { getChatLimiter, getRateLimitKey } from '@/lib/rag/ratelimit'
import type { FullRagChatMessageMetadata, ProductCitationData } from '@/lib/rag/types'
import { describeImagesForRetrieval } from '@/lib/rag/vision'

export const maxDuration = 300

type ChatRequestBody = {
  messages: UIMessage[]
  sessionId?: string
}

export async function POST(request: Request) {
  console.error('[rag/chat] request started')

  let body: ChatRequestBody

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { messages, sessionId } = body
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'anon'

  const limiter = getChatLimiter()
  const key = getRateLimitKey({ sessionId, ip })
  const { success, reset } = await limiter.limit(key)

  if (!success) {
    return NextResponse.json(
      { error: 'rate_limited', retryAfter: reset },
      {
        status: 429,
        headers: { 'Retry-After': String(reset) },
      }
    )
  }

  const lastUserMessage = [...messages].reverse().find(m => m.role === 'user')

  if (!lastUserMessage) {
    return NextResponse.json({ error: 'No user message found' }, { status: 400 })
  }

  const textParts: string[] = []
  const imageParts: Array<{ mediaType: string; data: string | URL }> = []

  if (lastUserMessage.parts) {
    for (const part of lastUserMessage.parts) {
      if (part.type === 'text') {
        textParts.push(part.text)
      } else if (part.type === 'file' && part.mediaType.startsWith('image/')) {
        imageParts.push({ mediaType: part.mediaType, data: part.url })
      }
    }
  }

  const userText = textParts.join(' ').trim()

  if (!userText && imageParts.length === 0) {
    return NextResponse.json({ error: 'No text or image content in user message' }, { status: 400 })
  }

  let retrievalQuery: string

  try {
    retrievalQuery = await describeImagesForRetrieval(imageParts, userText)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Image description failed'
    console.error('[rag/chat] vision error:', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }

  let products: Awaited<ReturnType<typeof findRelevantProducts>>

  try {
    products = await findRelevantProducts(retrievalQuery)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Retrieval failed'
    console.error('[rag/chat] retrieval error:', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }

  const system = buildGroundedSystemPrompt(products)

  const modelMessages = await convertToModelMessages(messages)

  const suggestionsPromise =
    products.length === 0
      ? Promise.resolve([])
      : generateObject({
          model: getChatModel(),
          schema: z.object({
            suggestions: z.array(z.string()).min(2).max(3),
          }),
          system:
            'Generate 2-3 short follow-up questions (max 10 words each) a user might ask next about vehicles or parts. Be specific to what was asked. Return only the questions.',
          prompt: `User asked: "${userText}". Top products found: ${products
            .slice(0, 4)
            .map(p => p.metadata.title)
            .join(', ')}.`,
        })
          .then(r => r.object.suggestions)
          .catch(err => {
            console.error('[rag/chat] suggestion generation failed:', err)
            return []
          })

  const citations: ProductCitationData[] = products.map(p => ({
    handle: p.metadata.handle,
    title: p.metadata.title,
    priceAmount: p.metadata.priceAmount,
    priceCurrency: p.metadata.priceCurrency,
    imageUrl: p.metadata.imageUrl,
    available: p.metadata.available,
    url: p.metadata.url,
    make: p.metadata.make,
    model: p.metadata.model,
    year: p.metadata.year,
    fuelType: p.metadata.fuelType,
    transmission: p.metadata.transmission,
    condition: p.metadata.condition,
  }))

  const resolvedSuggestions = await suggestionsPromise

  const result = streamText({
    model: getChatModel(),
    system,
    messages: modelMessages,
    temperature: 0.3,
    providerOptions: {
      gateway: {
        user: sessionId ?? ip,
        tags: ['feature:chat', 'env:production'],
        order: ['groq', 'cohere'],
        models: ['cohere/command-a'],
        byok: chatModelByok(),
      },
    },
    onError({ error }) {
      console.error('[rag/chat] streamText error:', error)
    },
  })

  return result.toUIMessageStreamResponse({
    onError(error) {
      console.error('[rag/chat] stream response error:', error)
      return 'Something went wrong while generating the response.'
    },
    messageMetadata({ part }: { part: TextStreamPart<ToolSet> }) {
      if (part.type === 'finish') {
        return { citations, suggestions: resolvedSuggestions } as FullRagChatMessageMetadata
      }
      return undefined
    },
  })
}

import type { TextStreamPart, UIMessage } from 'ai'
import { convertToModelMessages, streamText, type ToolSet } from 'ai'
import { NextResponse } from 'next/server'

import { getChatModel } from '@/lib/rag/clients'
import { buildGroundedSystemPrompt } from '@/lib/rag/prompt'
import { findRelevantProducts } from '@/lib/rag/query'
import { getChatLimiter } from '@/lib/rag/ratelimit'
import type { FullRagChatMessageMetadata, ProductCitationData } from '@/lib/rag/types'
import { describeImagesForRetrieval } from '@/lib/rag/vision'

export const maxDuration = 30

type ChatRequestBody = {
  messages: UIMessage[]
}

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'anon'

  const limiter = getChatLimiter()
  const { success, reset } = await limiter.limit(ip)

  if (!success) {
    return NextResponse.json(
      { error: 'rate_limited', retryAfter: reset },
      {
        status: 429,
        headers: { 'Retry-After': String(reset) },
      }
    )
  }

  let body: ChatRequestBody

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { messages } = body

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
    return NextResponse.json({ error: message }, { status: 500 })
  }

  let products: Awaited<ReturnType<typeof findRelevantProducts>>

  try {
    products = await findRelevantProducts(retrievalQuery)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Retrieval failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }

  const system = buildGroundedSystemPrompt(products)

  const modelMessages = await convertToModelMessages(messages)

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

  const result = streamText({
    model: getChatModel(),
    system,
    messages: modelMessages,
    temperature: 0.3,
  })

  return result.toUIMessageStreamResponse({
    messageMetadata({ part }: { part: TextStreamPart<ToolSet> }) {
      if (part.type === 'finish') {
        return { citations } as FullRagChatMessageMetadata
      }
      return undefined
    },
  })
}

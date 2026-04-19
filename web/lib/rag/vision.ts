import 'server-only'

import { generateText } from 'ai'
import { getChatModel } from '@/lib/rag/clients'
import { DESCRIBE_PROMPT } from '@/lib/rag/prompt'

export async function describeImagesForRetrieval(
  imageParts: Array<{ mediaType: string; data: string | URL }>,
  accompanyingText: string
): Promise<string> {
  if (imageParts.length === 0) {
    return accompanyingText
  }

  const validTypes = new Set(['image/jpeg', 'image/png', 'image/webp'])
  const validParts: Array<{ mediaType: string; data: string | URL }> = []

  for (const part of imageParts) {
    if (!validTypes.has(part.mediaType)) {
      continue
    }
    if (typeof part.data === 'string' && part.data.length > 4 * 1024 * 1024 * 0.75) {
      continue
    }
    validParts.push(part)
  }

  if (validParts.length > 2) {
    validParts.splice(2)
  }

  if (validParts.length === 0) {
    return accompanyingText
  }

  const imageContent = validParts.map(p => ({
    type: 'image' as const,
    image: p.data,
  }))

  const textPrompt =
    DESCRIBE_PROMPT + (accompanyingText ? `\n\nUser said: ${accompanyingText}` : '')

  const { text: description } = await generateText({
    model: getChatModel(),
    messages: [
      {
        role: 'user',
        content: [...imageContent, { type: 'text' as const, text: textPrompt }],
      },
    ],
    temperature: 0,
  })

  return accompanyingText ? `${accompanyingText}\n\n[image context] ${description}` : description
}

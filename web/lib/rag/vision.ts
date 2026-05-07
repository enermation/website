import 'server-only'

import { generateText } from 'ai'
import { getVisionModel, visionModelByok } from '@/lib/rag/clients'
import { VISION_FALLBACK_MODEL } from '@/lib/rag/constants'
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

    // Block blob:// and data: URLs — providers cannot fetch these
    if (typeof part.data === 'string') {
      const lower = part.data.toLowerCase()
      if (lower.startsWith('blob:') || lower.startsWith('data:')) {
        console.warn('[rag/vision] skipped unsupported URL scheme:', part.data.slice(0, 50))
        continue
      }
      // Size check is only meaningful for base64 data, not URL strings
      if (part.data.length > 4 * 1024 * 1024 * 0.75) {
        console.warn('[rag/vision] skipped oversized URL:', part.data.slice(0, 50))
        continue
      }
    } else if (part.data instanceof URL) {
      const scheme = part.data.protocol.toLowerCase()
      if (scheme === 'blob:' || scheme === 'data:') {
        console.warn('[rag/vision] skipped unsupported URL scheme:', part.data.href.slice(0, 50))
        continue
      }
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
    model: getVisionModel(),
    messages: [
      {
        role: 'user',
        content: [...imageContent, { type: 'text' as const, text: textPrompt }],
      },
    ],
    temperature: 0,
    providerOptions: {
      gateway: {
        models: [VISION_FALLBACK_MODEL],
        byok: visionModelByok(),
      },
    },
  })

  return accompanyingText ? `${accompanyingText}\n\n[image context] ${description}` : description
}

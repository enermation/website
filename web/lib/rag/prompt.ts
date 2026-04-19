import { SYSTEM_PROMPT_VERSION } from '@/lib/rag/constants'
import type { RagRetrievalResult } from '@/lib/rag/types'

export const DESCRIBE_PROMPT = `Identify the object in the image as concisely as possible for product search. Output comma-separated facts only (no prose, no preamble):
part type, material, visible codes or markings, apparent vehicle make/model if inferable, mounting style, approximate dimensions if visible, colour, condition.
If you cannot identify the object, output: unknown object.`

export function buildGroundedSystemPrompt(products: RagRetrievalResult[]): string {
  const productLines = products
    .map(
      p =>
        `[${p.metadata.handle}] ${p.metadata.title} — ${p.metadata.priceAmount} ${p.metadata.priceCurrency}\n` +
        `  make=${p.metadata.make ?? '—'} model=${p.metadata.model ?? '—'} year=${p.metadata.year ?? '—'} mileage=${p.metadata.mileage ?? '—'} fuel=${p.metadata.fuelType ?? '—'} transmission=${p.metadata.transmission ?? '—'}\n` +
        `  collections=${p.metadata.collectionHandles.join(', ') || '—'}\n` +
        `  snippet: ${p.metadata.textSnippet}`
    )
    .join('\n\n')

  return `You are Enermation's dealership assistant. Answer only from the products listed below. If none match, say so and suggest the closest category.

Rules:
- Cite products by handle in square brackets, e.g. [toyota-hilux-2019].
- Never invent prices, mileage, or VIN-like specifics. If a field is "—", say it is not listed.
- Reply in the user's language.

Available products:
${productLines}

// prompt version: ${SYSTEM_PROMPT_VERSION}`
}

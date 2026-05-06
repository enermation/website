import { SYSTEM_PROMPT_VERSION } from '@/lib/rag/constants'
import type { RagRetrievalResult } from '@/lib/rag/types'

export const DESCRIBE_PROMPT = `Identify the object in the image as concisely as possible for product search. Output comma-separated facts only (no prose, no preamble):
part type, material, visible codes or markings, apparent vehicle make/model if inferable, mounting style, approximate dimensions if visible, colour, condition.
If you cannot identify the object, output: unknown object.`

export function buildGroundedSystemPrompt(products: RagRetrievalResult[]): string {
  const SNIPPET_TRUNCATE = 500

  const productLines = products
    .map(p => {
      const m = p.metadata
      const d = (v: string | null | undefined) => v ?? '—'

      const coreLine =
        `  make=${d(m.make)} model=${d(m.model)} year=${d(m.year)}` +
        ` fuel=${d(m.fuelType)} transmission=${d(m.transmission)}` +
        ` drive=${d(m.driveType)} condition=${d(m.condition)}`

      // Dynamic specs — keyed by stable namespace.key, rendered with current display label
      const specsLine =
        Object.keys(m.specs).length > 0
          ? `  ${Object.values(m.specs)
              .map(({ label, value }) => `${label}=${value}`)
              .join(' | ')}\n`
          : ''

      const featuresLine =
        Array.isArray(m.features) && m.features.length > 0
          ? `  features: ${m.features.join(', ')}\n`
          : ''

      return (
        `[${m.handle}] ${m.title} — ${m.priceAmount} ${m.priceCurrency}\n` +
        coreLine +
        '\n' +
        specsLine +
        featuresLine +
        `  collections=${m.collectionHandles.join(', ') || '—'}\n` +
        `  snippet: ${m.textSnippet.replace(/\s+/g, ' ').trim().slice(0, SNIPPET_TRUNCATE)}`
      )
    })
    .join('\n\n')

  return `You are Miles, Enermation's dealership assistant.

<role>
Expert at matching buyer needs to vehicle inventory. Present only what's in the product list below — never invent, speculate, or fill in unspecified fields. If a field is "—", say it is not listed.
</role>

<response-style-rules>
- For browsing, general, or open-ended queries (e.g. "what cars do you have", "show me diesels", "anything under X"), present ALL relevant products — do not pick just one. Give the user a full picture of what is available.
- For specific queries (e.g. "best family SUV under 30,000"), present the top 2–3 matches and end with a "**Verdict:**" section naming your recommendation and why.
- If no products match the query, respond with: "I don't have anything matching that right now. Can you tell me more about what you're looking for?" — then suggest the closest category.
- Respond strictly in English only. Only switch to another language if the user writes in that language first.
</response-style-rules>

<formatting-rules>
- Write one concise paragraph per product.
- Place the product handle in square brackets at the very end of that paragraph, e.g. [toyota-hilux-2019]. Never omit the handle.
- Do not include prices, mileage, or VIN-like specifics unless they appear in the product data.
</formatting-rules>

<examples>
Example 1 — open-ended query:
User: "what SUVs are available"
Assistant: The following SUVs are in stock... [honda-cr-v-2022] ... [suzu-grand-vitara-2021] ... [tata-safari-2023]

Example 2 — specific query:
User: "best automatic diesel SUV under 25000"
Assistant: For an automatic diesel SUV under $25,000, the top matches are... **Verdict:** The [ford-explorer-2022] is the best choice because...
</examples>

Available products:
${productLines}

// prompt version: ${SYSTEM_PROMPT_VERSION}`
}

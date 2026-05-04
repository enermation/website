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
        ` fuel=${d(m.fuelType)} transmission=${d(m.transmission)} drive=${d(m.driveType)}` +
        ` condition=${d(m.condition)}`

      const detailParts = [
        m.mileage ? `mileage=${m.mileage}` : null,
        m.colour ? `colour=${m.colour}` : null,
        m.engine ? `engine=${m.engine}` : null,
        m.displacement ? `displacement=${m.displacement}` : null,
        m.originCountry ? `origin=${m.originCountry}` : null,
      ].filter(Boolean)

      const detailLine = detailParts.length > 0 ? `  ${detailParts.join(' ')}\n` : ''

      const extraSpecsLine =
        Object.keys(m.specs).length > 0
          ? `  specs: ${Object.entries(m.specs)
              .map(([k, v]) => `${k}=${v}`)
              .join(' | ')}\n`
          : ''

      return (
        `[${m.handle}] ${m.title} — ${m.priceAmount} ${m.priceCurrency}\n` +
        coreLine +
        '\n' +
        detailLine +
        extraSpecsLine +
        `  collections=${m.collectionHandles.join(', ') || '—'}\n` +
        `  snippet: ${m.textSnippet.replace(/\s+/g, ' ').trim().slice(0, SNIPPET_TRUNCATE)}`
      )
    })
    .join('\n\n')

  return `You are Miles, Enermation's dealership assistant. Answer only from the products listed below. If none match, say so and suggest the closest category.

Rules:
- Write one paragraph per product you discuss. Place the product handle in square brackets at the very end of that paragraph, e.g. [toyota-hilux-2019]. Never omit the handle when mentioning a product.
- Never invent prices, mileage, or VIN-like specifics. If a field is "—", say it is not listed.
- When recommending multiple products, end your response with a "**Verdict:**" section that clearly names which product you recommend and why.
- Respond strictly in English only. Only switch to another language if the user writes in that language first.

Available products:
${productLines}

// prompt version: ${SYSTEM_PROMPT_VERSION}`
}

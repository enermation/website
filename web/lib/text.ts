/**
 * Pretext utilities for DOM-reflow-free text measurement.
 * @see https://github.com/chenglou/pretext
 *
 * Pretext pre-computes text metrics once via prepare(), then layout()
 * performs pure arithmetic to calculate height/lineCount at any width.
 *
 * Use cases: AI chat streaming messages, virtualized lists, dynamic height containers.
 */

import { layout, prepare } from '@chenglou/pretext'

// Font configurations matching CSS custom properties
const FONT_BODY = '400 15px Inter, sans-serif'
const FONT_DISPLAY = '700 24px "Barlow Semi Condensed", sans-serif'

export const LINE_HEIGHT_BODY = 1.75
export const LINE_HEIGHT_BODY_SM = 1.5
export const LINE_HEIGHT_HEADING = 1.4
export const LINE_HEIGHT_DISPLAY = 1.2

export const MAX_WIDTH_META = 672 // ~60ch for meta descriptions

export type PreparedText = ReturnType<typeof prepare>

export interface TextMeasurement {
  height: number
  lineCount: number
}

// ─── Prepare functions (one-time cost, reuse many times) ───────────────────

export function prepareBody(text: string, options?: { fontSize?: number }): PreparedText {
  const fontSize = options?.fontSize ?? 15
  return prepare(text, `400 ${fontSize}px Inter, sans-serif`)
}

export function prepareHeading(text: string, options?: { fontSize?: number }): PreparedText {
  const fontSize = options?.fontSize ?? 16
  return prepare(text, `600 ${fontSize}px "Barlow Semi Condensed", sans-serif`)
}

export function prepareDisplay(text: string, options?: { fontSize?: number }): PreparedText {
  const fontSize = options?.fontSize ?? 24
  return prepare(text, `700 ${fontSize}px "Barlow Semi Condensed", sans-serif`)
}

// ─── Layout functions (pure arithmetic, no DOM access) ───────────────────

export function measureText(
  prepared: PreparedText,
  maxWidth: number,
  lineHeight: number
): TextMeasurement {
  return layout(prepared, maxWidth, lineHeight)
}

export function truncateToLines(
  text: string,
  maxLines: number,
  font: string,
  lineHeight: number
): { truncated: string; height: number; lineCount: number } {
  // Binary search for the right truncation point
  let low = 0
  let high = text.length
  let result = text

  while (low <= high) {
    const mid = Math.floor((low + high) / 2)
    const candidate = text.slice(0, mid)
    const prepared = prepare(candidate, font)
    const { lineCount } = layout(prepared, MAX_WIDTH_META, lineHeight)

    if (lineCount <= maxLines) {
      result = candidate
      low = mid + 1
    } else {
      high = mid - 1
    }
  }

  const prepared = prepare(result, font)
  const { height, lineCount } = layout(prepared, MAX_WIDTH_META, lineHeight)

  // Add ellipsis if we truncated
  const truncated = result.length < text.length ? `${result.trimEnd()}…` : result

  return { truncated, height, lineCount }
}

// ─── SEO meta description helper ─────────────────────────────────────────

export function prepareMetaDescription(text: string): PreparedText {
  // Meta descriptions are typically ~155-160 chars displayed
  // Use body font at 15px with relaxed line-height
  return prepare(text, FONT_BODY)
}

export function measureMetaDescription(text: string): TextMeasurement {
  const prepared = prepareMetaDescription(text)
  return measureText(prepared, MAX_WIDTH_META, LINE_HEIGHT_BODY)
}

/**
 * Truncate a string to fit within maxChars while keeping words whole.
 * Falls back to naive char truncation for meta descriptions where
 * perfect pixel accuracy is less critical than simplicity.
 */
export function truncateForMeta(text: string, maxChars = 157): string {
  if (text.length <= maxChars) return text

  // Try to break at a word boundary
  const truncated = text.slice(0, maxChars)
  const lastSpace = truncated.lastIndexOf(' ')

  if (lastSpace > maxChars * 0.7) {
    return `${truncated.slice(0, lastSpace).trimEnd()}…`
  }

  return `${truncated.trimEnd()}…`
}

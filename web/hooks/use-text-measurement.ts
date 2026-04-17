'use client'

/**
 * Client-side hook for dynamic text height measurement using Pretext.
 * Use for streaming chat messages, virtualized lists, or any UI
 * that needs to know text dimensions before DOM rendering.
 *
 * @example
 * const { measure } = useTextMeasurement()
 * const { height, lineCount } = measure('Hello world', 'body')
 */

import { useCallback, useRef } from 'react'
import {
  LINE_HEIGHT_BODY,
  LINE_HEIGHT_HEADING,
  measureText,
  type PreparedText,
  prepareBody,
  prepareHeading,
} from '@/lib/text'

type FontStyle = 'body' | 'heading'

interface MeasurementResult {
  height: number
  lineCount: number
}

interface TextMeasurementState {
  cache: Map<string, PreparedText>
}

export function useTextMeasurement() {
  const stateRef = useRef<TextMeasurementState>({ cache: new Map() })

  const getPrepared = useCallback((text: string, style: FontStyle): PreparedText => {
    const cache = stateRef.current.cache
    const key = `${style}:${text}`

    if (cache.has(key)) {
      const cached = cache.get(key)
      if (cached) return cached
    }

    const prepared = style === 'body' ? prepareBody(text) : prepareHeading(text)
    cache.set(key, prepared)
    return prepared
  }, [])

  const measure = useCallback(
    (text: string, style: FontStyle, maxWidth: number): MeasurementResult => {
      const prepared = getPrepared(text, style)
      const lineHeight = style === 'body' ? LINE_HEIGHT_BODY : LINE_HEIGHT_HEADING
      return measureText(prepared, maxWidth, lineHeight)
    },
    [getPrepared]
  )

  const clearCache = useCallback(() => {
    stateRef.current.cache.clear()
  }, [])

  return { measure, getPrepared, clearCache }
}

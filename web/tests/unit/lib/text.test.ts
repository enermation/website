import { describe, expect, it } from 'vitest'
import {
  LINE_HEIGHT_BODY,
  MAX_WIDTH_META,
  measureMetaDescription,
  measureText,
  prepareBody,
  prepareDisplay,
  prepareHeading,
  truncateForMeta,
  truncateToLines,
} from '@/lib/text'

describe('prepareBody', () => {
  it('prepares text for body font', () => {
    const prepared = prepareBody('Test text')
    expect(prepared).toBeDefined()
    expect(typeof prepared).toBe('object')
  })

  it('accepts custom fontSize option', () => {
    const prepared = prepareBody('Test', { fontSize: 14 })
    expect(prepared).toBeDefined()
  })

  it('handles empty string', () => {
    const prepared = prepareBody('')
    expect(prepared).toBeDefined()
  })
})

describe('prepareHeading', () => {
  it('prepares text for heading font', () => {
    const prepared = prepareHeading('Heading text')
    expect(prepared).toBeDefined()
  })

  it('accepts custom fontSize option', () => {
    const prepared = prepareHeading('Heading', { fontSize: 20 })
    expect(prepared).toBeDefined()
  })
})

describe('prepareDisplay', () => {
  it('prepares text for display font', () => {
    const prepared = prepareDisplay('Display text')
    expect(prepared).toBeDefined()
  })
})

describe('measureText', () => {
  it('returns height and lineCount for prepared text', () => {
    const prepared = prepareBody('Short text')
    const result = measureText(prepared, MAX_WIDTH_META, LINE_HEIGHT_BODY)
    expect(result).toHaveProperty('height')
    expect(result).toHaveProperty('lineCount')
    expect(typeof result.height).toBe('number')
    expect(typeof result.lineCount).toBe('number')
    expect(result.height).toBeGreaterThan(0)
  })

  it('returns higher lineCount for longer text', () => {
    const short = prepareBody('Short')
    const long = prepareBody(
      'This is a much longer piece of text that should wrap to multiple lines'
    )
    const shortResult = measureText(short, MAX_WIDTH_META, LINE_HEIGHT_BODY)
    const longResult = measureText(long, MAX_WIDTH_META, LINE_HEIGHT_BODY)
    expect(longResult.lineCount).toBeGreaterThan(shortResult.lineCount)
  })

  it('returns fewer lines for narrower width', () => {
    const prepared = prepareBody(
      'This is some text that should wrap differently at different widths'
    )
    const wideResult = measureText(prepared, MAX_WIDTH_META, LINE_HEIGHT_BODY)
    const narrowResult = measureText(prepared, 200, LINE_HEIGHT_BODY)
    expect(narrowResult.lineCount).toBeGreaterThan(wideResult.lineCount)
  })
})

describe('truncateToLines', () => {
  it('truncates to maxLines', () => {
    const longText =
      'This is a very long piece of text that should be truncated to fit within a limited number of lines. '.repeat(
        20
      )
    const result = truncateToLines(longText, 3, '400 15px Inter, sans-serif', LINE_HEIGHT_BODY)
    expect(result.lineCount).toBeLessThanOrEqual(3)
    expect(result.truncated.length).toBeLessThan(longText.length)
  })

  it('returns full text if already within limit', () => {
    const shortText = 'Short text'
    const result = truncateToLines(shortText, 5, '400 15px Inter, sans-serif', LINE_HEIGHT_BODY)
    expect(result.lineCount).toBeLessThanOrEqual(5)
  })

  it('adds ellipsis when truncation occurs', () => {
    const longText = 'Word '.repeat(50)
    const result = truncateToLines(longText, 2, '400 15px Inter, sans-serif', LINE_HEIGHT_BODY)
    expect(result.truncated.endsWith('…')).toBe(true)
  })

  it('returns text without ellipsis when no truncation needed', () => {
    const shortText = 'Hello'
    const result = truncateToLines(shortText, 5, '400 15px Inter, sans-serif', LINE_HEIGHT_BODY)
    expect(result.truncated).toBe('Hello')
  })
})

describe('truncateForMeta', () => {
  it('returns original if under maxChars', () => {
    const text = 'Short description'
    expect(truncateForMeta(text, 50)).toBe('Short description')
  })

  it('truncates with ellipsis at word boundary', () => {
    const text =
      'This is a longer text that needs truncation because it exceeds the character limit'
    const result = truncateForMeta(text, 30)
    expect(result.length).toBeLessThanOrEqual(31) // 30 + ellipsis
    expect(result.endsWith('…')).toBe(true)
  })

  it('falls back to char truncation if no word boundary near limit', () => {
    const text = 'abcdefghijklmnopqrstuvwxyz' // all continuous chars
    const result = truncateForMeta(text, 10)
    expect(result.length).toBeLessThanOrEqual(11) // 10 + ellipsis
    expect(result.endsWith('…')).toBe(true)
  })

  it('uses default maxChars of 157', () => {
    const text = 'a'.repeat(200)
    const result = truncateForMeta(text)
    expect(result.length).toBeLessThanOrEqual(158) // 157 + ellipsis
  })

  it('handles exactly maxChars length', () => {
    const text = 'a'.repeat(157)
    expect(truncateForMeta(text)).toBe(text)
  })
})

describe('measureMetaDescription', () => {
  it('returns measurement for meta description text', () => {
    const result = measureMetaDescription('Test meta description text')
    expect(result).toHaveProperty('height')
    expect(result).toHaveProperty('lineCount')
    expect(result.height).toBeGreaterThan(0)
  })

  it('handles short text', () => {
    const result = measureMetaDescription('Short')
    expect(result.lineCount).toBe(1)
  })
})

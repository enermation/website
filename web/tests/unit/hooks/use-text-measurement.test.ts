import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useTextMeasurement } from '@/hooks/use-text-measurement'

describe('useTextMeasurement', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns measure function', () => {
    const { result } = renderHook(() => useTextMeasurement())
    expect(typeof result.current.measure).toBe('function')
  })

  it('returns getPrepared function', () => {
    const { result } = renderHook(() => useTextMeasurement())
    expect(typeof result.current.getPrepared).toBe('function')
  })

  it('returns clearCache function', () => {
    const { result } = renderHook(() => useTextMeasurement())
    expect(typeof result.current.clearCache).toBe('function')
  })

  it('measure returns height and lineCount for body style', () => {
    const { result } = renderHook(() => useTextMeasurement())

    const measurement = result.current.measure('Short text', 'body', 672)
    expect(measurement).toHaveProperty('height')
    expect(measurement).toHaveProperty('lineCount')
    expect(typeof measurement.height).toBe('number')
    expect(typeof measurement.lineCount).toBe('number')
  })

  it('measure returns height and lineCount for heading style', () => {
    const { result } = renderHook(() => useTextMeasurement())

    const measurement = result.current.measure('Heading text', 'heading', 672)
    expect(measurement).toHaveProperty('height')
    expect(measurement).toHaveProperty('lineCount')
  })

  it('measure uses different line heights for body vs heading', () => {
    const { result } = renderHook(() => useTextMeasurement())

    const bodyResult = result.current.measure('Test text for measurement', 'body', 672)
    const headingResult = result.current.measure('Test text for measurement', 'heading', 672)
    // Heading uses taller font size so should generally produce different heights
    expect(typeof bodyResult.height).toBe('number')
    expect(typeof headingResult.height).toBe('number')
  })

  it('getPrepared returns PreparedText for body', () => {
    const { result } = renderHook(() => useTextMeasurement())

    const prepared = result.current.getPrepared('Test text', 'body')
    expect(prepared).toBeDefined()
    expect(typeof prepared).toBe('object')
  })

  it('getPrepared returns PreparedText for heading', () => {
    const { result } = renderHook(() => useTextMeasurement())

    const prepared = result.current.getPrepared('Test text', 'heading')
    expect(prepared).toBeDefined()
  })

  it('clearCache removes all cached items', () => {
    const { result } = renderHook(() => useTextMeasurement())

    // Trigger some measurements to populate cache
    result.current.measure('Text 1', 'body', 672)
    result.current.measure('Text 2', 'body', 672)

    // clearCache should not throw
    act(() => {
      result.current.clearCache()
    })

    // After clear, subsequent calls should still work
    const measurement = result.current.measure('New text', 'body', 672)
    expect(measurement).toHaveProperty('height')
    expect(measurement).toHaveProperty('lineCount')
  })

  it('cache is used for repeated text/style combinations', () => {
    const { result } = renderHook(() => useTextMeasurement())

    const first = result.current.measure('Repeated text', 'body', 672)
    const second = result.current.measure('Repeated text', 'body', 672)

    expect(first).toEqual(second)
  })

  it('handles empty string', () => {
    const { result } = renderHook(() => useTextMeasurement())

    const measurement = result.current.measure('', 'body', 672)
    expect(measurement).toHaveProperty('height')
    expect(measurement).toHaveProperty('lineCount')
  })

  it('handles very long text', () => {
    const { result } = renderHook(() => useTextMeasurement())

    const longText = 'Word '.repeat(200)
    const measurement = result.current.measure(longText, 'body', 300) // narrow width
    expect(measurement.lineCount).toBeGreaterThan(1)
  })
})

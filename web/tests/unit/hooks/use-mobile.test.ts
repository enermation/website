import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useIsMobile } from '@/hooks/use-mobile'

// ── Helpers ───────────────────────────────────────────────────────────────────

const setViewportWidth = (width: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  })
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('useIsMobile', () => {
  let matchMediaSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.useFakeTimers()
    matchMediaSpy = vi.fn()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('returns false when viewport >= 768px', () => {
    setViewportWidth(1024)

    const addEventListenerMock = vi.fn()
    const removeEventListenerMock = vi.fn()
    matchMediaSpy.mockReturnValue({
      matches: false,
      media: '(max-width: 767px)',
      addEventListener: addEventListenerMock,
      removeEventListener: removeEventListenerMock,
    })
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: matchMediaSpy,
    })

    const { result } = renderHook(() => useIsMobile())

    act(() => {
      vi.runAllTimers()
    })

    expect(result.current).toBe(false)
  })

  it('returns true when viewport < 768px', () => {
    setViewportWidth(375)

    const addEventListenerMock = vi.fn()
    const removeEventListenerMock = vi.fn()
    matchMediaSpy.mockReturnValue({
      matches: true,
      media: '(max-width: 767px)',
      addEventListener: addEventListenerMock,
      removeEventListener: removeEventListenerMock,
    })
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: matchMediaSpy,
    })

    const { result } = renderHook(() => useIsMobile())

    act(() => {
      vi.runAllTimers()
    })

    expect(result.current).toBe(true)
  })

  it('updates when viewport crosses breakpoint', () => {
    setViewportWidth(1024)

    const addEventListenerMock = vi.fn()
    const removeEventListenerMock = vi.fn()

    matchMediaSpy.mockReturnValue({
      matches: false,
      media: '(max-width: 767px)',
      addEventListener: addEventListenerMock,
      removeEventListener: removeEventListenerMock,
    })
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: matchMediaSpy,
    })

    const { result } = renderHook(() => useIsMobile())

    act(() => {
      vi.runAllTimers()
    })

    expect(result.current).toBe(false)

    // Simulate resize to mobile
    setViewportWidth(375)
    act(() => {
      const listeners = addEventListenerMock.mock.calls.filter(
        ([eventName]) => eventName === 'change'
      )
      const listener = listeners[0]?.[1]
      if (listener) listener({ matches: true } as MediaQueryListEvent)
    })

    expect(result.current).toBe(true)
  })

  it('cleans up listener on unmount', () => {
    setViewportWidth(1024)

    const removeEventListenerMock = vi.fn()
    matchMediaSpy.mockReturnValue({
      matches: false,
      media: '(max-width: 767px)',
      addEventListener: vi.fn(),
      removeEventListener: removeEventListenerMock,
    })
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: matchMediaSpy,
    })

    const { unmount } = renderHook(() => useIsMobile())

    act(() => {
      vi.runAllTimers()
    })

    unmount()
    expect(removeEventListenerMock).toHaveBeenCalled()
  })

  it('registers change listener on matchMedia', () => {
    setViewportWidth(1024)

    const addEventListenerMock = vi.fn()
    matchMediaSpy.mockReturnValue({
      matches: false,
      media: '(max-width: 767px)',
      addEventListener: addEventListenerMock,
      removeEventListener: vi.fn(),
    })
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: matchMediaSpy,
    })

    renderHook(() => useIsMobile())

    act(() => {
      vi.runAllTimers()
    })

    expect(addEventListenerMock).toHaveBeenCalledWith('change', expect.any(Function))
  })
})

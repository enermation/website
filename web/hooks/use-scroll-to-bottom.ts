'use client'

import { useCallback, useEffect, useState } from 'react'

export function useScrollToBottom(containerRef: React.RefObject<HTMLDivElement | null>) {
  const [showButton, setShowButton] = useState(false)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100
      setShowButton(!isNearBottom)
    }

    container.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => container.removeEventListener('scroll', handleScroll)
  }, [containerRef])

  const scrollToBottom = useCallback(() => {
    const container = containerRef.current
    if (!container) return
    container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' })
  }, [containerRef])

  return { showButton, scrollToBottom }
}

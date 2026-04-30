'use client'

import { ChevronDown } from 'lucide-react'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { ChatPanel } from '@/components/rag/chat-panel'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { ASSISTANT_WIDGET_TITLE } from '@/lib/assistant-data'
import { cn } from '@/lib/utils'

export function ChatWidget() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  if (pathname === '/miles') {
    return null
  }

  if (!isOpen) {
    return (
      <button
        aria-label="Open assistant"
        className={cn(
          'fixed bottom-4 right-4 sm:bottom-6 sm:right-6',
          'z-50 flex h-14 w-14 items-center justify-center',
          'rounded-full border border-border bg-background shadow-sm',
          'transition-all duration-200 hover:opacity-80 active:scale-95 focus:outline-none'
        )}
        onClick={() => setIsOpen(true)}
        type="button"
      >
        <Image
          alt="Miles"
          className="h-8 w-8 object-contain"
          height={32}
          loading="eager"
          src="/miles_logo.png"
          width={32}
        />
      </button>
    )
  }

  return (
    <Card
      className={cn(
        'chat-widget-in',
        'fixed z-50 flex flex-col overflow-hidden border-border bg-background p-0 gap-0',
        'inset-x-4 bottom-4 rounded-2xl shadow-2xl',
        'sm:bottom-6 sm:right-6 sm:left-auto sm:w-(--size-widget-w) sm:h-(--size-widget-h) sm:max-h-(--size-widget-h)',
        'h-[100dvh] max-h-[100dvh]'
      )}
      onWheel={e => e.stopPropagation()}
    >
      <CardHeader className="flex flex-shrink-0 flex-row items-center justify-between gap-2 border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Image
            alt="Miles"
            className="h-6 w-6 object-contain"
            height={24}
            src="/miles_logo.png"
            width={24}
          />
          <span className="text-sm font-medium text-foreground">{ASSISTANT_WIDGET_TITLE}</span>
        </div>
        <button
          aria-label="Close assistant"
          className="cursor-pointer p-0 transition-all duration-150 hover:opacity-80 active:scale-95 focus:outline-none"
          onClick={() => setIsOpen(false)}
          type="button"
        >
          <ChevronDown className="h-5 w-5 text-foreground" strokeWidth={2} />
        </button>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col overflow-hidden p-0">
        <ChatPanel api="/api/rag/chat" />
      </CardContent>
    </Card>
  )
}

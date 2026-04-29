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

  if (pathname === '/assistant') {
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
          alt="Enermation Assistant"
          className="h-8 w-8 object-contain"
          height={32}
          loading="eager"
          src="/chat-logo-32.webp"
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
        'inset-0 rounded-none shadow-none',
        'sm:inset-4 sm:rounded-2xl sm:shadow-2xl',
        'md:inset-auto md:bottom-6 md:right-6 md:size-widget md:h-(--size-widget-h)'
      )}
      onWheel={e => e.stopPropagation()}
    >
      <CardHeader className="flex flex-shrink-0 flex-row items-center justify-between gap-2 border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Image
            alt="Enermation"
            className="h-6 w-6 object-contain"
            height={24}
            src="/chat-logo-32.webp"
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

'use client'

import { mdiClose, mdiRobotHappyOutline } from '@mdi/js'
import { Icon } from '@mdi/react'
import { useCallback, useState } from 'react'
import { ChatPanel } from '@/components/rag/chat-panel'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { ASSISTANT_WIDGET_TITLE } from '@/lib/assistant-data'
import { cn } from '@/lib/utils'

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)

  const handleOpen = useCallback(() => setIsOpen(true), [])
  const handleClose = useCallback(() => {
    setIsOpen(false)
  }, [])

  if (!isOpen) {
    return (
      <Button
        className="fixed bottom-6 right-6 z-50 size-12 rounded-full shadow-xl bg-brand-green"
        onClick={handleOpen}
        size="icon"
        variant="default"
      >
        <Icon path={mdiRobotHappyOutline} size={1} />
      </Button>
    )
  }

  return (
    <Card
      className={cn(
        'fixed bottom-6 right-6 z-50 flex size-widget flex-col shadow-xl border-border bg-background',
        'h-(--size-widget-h)'
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between gap-2 border-b border-border px-4 py-3">
        <span className="text-13 font-heading">{ASSISTANT_WIDGET_TITLE}</span>
        <Button
          className="size-8 rounded-full p-0"
          onClick={handleClose}
          size="icon"
          type="button"
          variant="ghost"
        >
          <Icon path={mdiClose} size={1} />
        </Button>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col overflow-hidden p-0">
        <ChatPanel api="/api/rag/chat" />
      </CardContent>
    </Card>
  )
}

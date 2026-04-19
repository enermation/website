'use client'

import { useChat } from '@ai-sdk/react'
import { mdiAttachmentPlus, mdiChat, mdiClose } from '@mdi/js'
import { Icon } from '@mdi/react'
import type { FileUIPart } from 'ai'
import { DefaultChatTransport } from 'ai'
import Image from 'next/image'
import { useCallback, useRef, useState } from 'react'
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation'
import { InlineCitation, InlineCitationText } from '@/components/ai-elements/inline-citation'
import { Message, MessageContent, MessageResponse } from '@/components/ai-elements/message'
import {
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from '@/components/ai-elements/prompt-input'
import { Suggestion, Suggestions } from '@/components/ai-elements/suggestion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { SUGGESTED_QUESTIONS } from '@/lib/rag/suggested-questions'
import type { RagChatMessageMetadata } from '@/lib/rag/types'
import { cn } from '@/lib/utils'

const MAX_FILES = 2
const MAX_FILE_SIZE = 4 * 1024 * 1024

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pendingFiles, setPendingFiles] = useState<Array<{ file: File; preview: string }>>([])
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const { messages, sendMessage, status, regenerate, stop } = useChat({
    transport: new DefaultChatTransport({ api: '/api/rag/chat' }),
  })

  const handleOpen = useCallback(() => setIsOpen(true), [])
  const handleClose = useCallback(() => {
    setIsOpen(false)
    setError(null)
    setPendingFiles([])
  }, [])

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setError(null)
      const incoming = Array.from(e.currentTarget.files ?? [])
      if (!incoming.length) return

      const currentCount = pendingFiles.length
      if (currentCount >= MAX_FILES) {
        setError(`Maximum ${MAX_FILES} images per message.`)
        return
      }

      const remaining = MAX_FILES - currentCount
      const toAdd = incoming.slice(0, remaining)

      for (const f of toAdd) {
        if (!f.type.startsWith('image/')) {
          setError('Only image files are accepted.')
          return
        }
        if (f.size > MAX_FILE_SIZE) {
          setError('Images must be under 4 MB.')
          return
        }
      }

      const previews = toAdd.map(f => ({
        file: f,
        preview: URL.createObjectURL(f),
      }))
      setPendingFiles(prev => [...prev, ...previews])
      e.currentTarget.value = ''
    },
    [pendingFiles.length]
  )

  const removeFile = useCallback((index: number) => {
    setPendingFiles(prev => {
      URL.revokeObjectURL(prev[index].preview)
      return prev.filter((_, i) => i !== index)
    })
  }, [])

  const handleSubmit = useCallback(
    async (message: { text: string; files: FileUIPart[] }) => {
      setError(null)
      setPendingFiles([])
      await sendMessage({
        text: message.text,
        files: message.files.map(f => ({
          type: 'file' as const,
          mediaType: f.mediaType,
          url: f.url,
          filename: f.filename,
        })),
      })
    },
    [sendMessage]
  )

  const handleSuggestion = useCallback(
    (q: string) => {
      setError(null)
      setPendingFiles([])
      sendMessage({ text: q, files: [] })
    },
    [sendMessage]
  )

  const lastMsg = messages[messages.length - 1]
  const citations =
    lastMsg?.role === 'assistant' && lastMsg.metadata != null
      ? (lastMsg.metadata as RagChatMessageMetadata).citations
      : null

  const hasCitations = !!(citations && citations.length > 0)

  if (!isOpen) {
    return (
      <Button
        className="fixed bottom-4 right-4 z-50 size-12 rounded-full shadow-xl"
        onClick={handleOpen}
        size="icon"
        variant="default"
      >
        <Icon path={mdiChat} size={1} />
      </Button>
    )
  }

  return (
    <Card
      className={cn(
        'fixed bottom-4 right-4 z-50 flex size-widget flex-col shadow-xl border-border bg-background'
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between gap-2 border-b border-border px-4 py-3">
        <span className="text-13 font-heading">Enermation Assistant</span>
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
        <Conversation className="flex-1">
          <ConversationContent>
            {messages.length === 0 ? (
              <ConversationEmptyState
                description="Ask about vehicles, parts, or anything in our inventory"
                title="How can I help you?"
              />
            ) : (
              messages.map(msg => {
                const imageParts = msg.parts.filter(
                  (p): p is { type: 'file'; url: string; mediaType: string; filename?: string } =>
                    p.type === 'file' && !!p.url && p.mediaType.startsWith('image/')
                )

                return (
                  <Message key={msg.id} from={msg.role}>
                    <MessageContent>
                      {imageParts.length > 0 && (
                        <div className="mb-2 flex flex-wrap gap-2">
                          {imageParts.map((p, imageIdx) => {
                            const imageId = `img-${msg.id}-${imageIdx}`
                            return (
                              <Image
                                alt={p.filename ?? 'Image'}
                                className="size-16 rounded-md object-cover"
                                height={64}
                                key={imageId}
                                src={p.url}
                                width={64}
                              />
                            )
                          })}
                        </div>
                      )}
                      <MessageResponse>
                        {msg.parts
                          .filter(p => p.type === 'text')
                          .map((p, textIdx) => {
                            const text = p.text
                            const textKey = `text-${msg.id}-${textIdx}`
                            if (
                              msg.role === 'assistant' &&
                              textIdx === msg.parts.filter(q => q.type === 'text').length - 1
                            ) {
                              return (
                                <span key={textKey}>
                                  {hasCitations
                                    ? text.split(/\[([^\]]+)\]/).map((segment, segIdx) => {
                                        if (segIdx % 2 === 1) {
                                          const citeKey = `cite-${msg.id}-${textIdx}-${segIdx}`
                                          return (
                                            <InlineCitation key={citeKey}>
                                              <InlineCitationText className="text-brand-green underline-offset-2 hover:underline">
                                                {segment}
                                              </InlineCitationText>
                                            </InlineCitation>
                                          )
                                        }
                                        const plainKey = `plain-${msg.id}-${textIdx}-${segIdx}`
                                        return <span key={plainKey}>{segment}</span>
                                      })
                                    : text}
                                </span>
                              )
                            }
                            return <span key={textKey}>{text}</span>
                          })}
                      </MessageResponse>
                    </MessageContent>
                  </Message>
                )
              })
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        {status === 'error' && (
          <div className="flex items-center justify-between gap-2 border-t border-border px-4 py-2">
            <span className="text-13 text-muted-foreground">Something went wrong. Try again.</span>
            <Button
              className="text-13"
              onClick={() => regenerate()}
              size="sm"
              type="button"
              variant="ghost"
            >
              Retry
            </Button>
          </div>
        )}

        {messages.length === 0 && (
          <div className="border-t border-border px-4 py-3">
            <Suggestions>
              {SUGGESTED_QUESTIONS.map(q => (
                <Suggestion key={q} suggestion={q} onClick={handleSuggestion} />
              ))}
            </Suggestions>
          </div>
        )}

        {pendingFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 border-t border-border px-4 py-2">
            {pendingFiles.map(({ preview, file }, fileIdx) => {
              const fileKey = `file-${fileIdx}`
              return (
                <div className="relative size-16" key={fileKey}>
                  <Image
                    alt={file.name}
                    className="size-full rounded-md object-cover"
                    height={64}
                    src={preview}
                    width={64}
                    unoptimized
                  />
                  <button
                    className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-background text-muted-foreground"
                    onClick={() => removeFile(fileIdx)}
                    type="button"
                  >
                    <Icon path={mdiClose} size={0.75} />
                  </button>
                </div>
              )
            })}
          </div>
        )}

        <form
          className="border-t border-border"
          onSubmit={e => {
            e.preventDefault()
            const fd = new FormData(e.currentTarget)
            const text = (fd.get('message') as string) ?? ''
            const files: FileUIPart[] = pendingFiles.map(pf => ({
              type: 'file' as const,
              mediaType: pf.file.type,
              url: pf.preview,
              filename: pf.file.name,
            }))
            handleSubmit({ text, files })
          }}
        >
          <PromptInputBody>
            <PromptInputFooter className="px-4 py-2">
              <PromptInputTextarea name="message" placeholder="Ask about vehicles or parts..." />
              <input
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                multiple
                onChange={handleFileChange}
                ref={fileInputRef}
                type="file"
              />
              <div className="flex shrink-0 items-center gap-1">
                <PromptInputSubmit
                  status={status}
                  onStop={status === 'streaming' ? stop : undefined}
                />
                <PromptInputSubmit
                  className="[&>svg]:size-4"
                  onClick={() => fileInputRef.current?.click()}
                  type="button"
                  variant="ghost"
                >
                  <Icon path={mdiAttachmentPlus} size={1} />
                </PromptInputSubmit>
              </div>
            </PromptInputFooter>
          </PromptInputBody>
        </form>

        {error && (
          <div className="border-t border-border px-4 py-2">
            <span className="text-13 text-muted-foreground">{error}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

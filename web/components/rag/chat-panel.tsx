'use client'

import { useChat } from '@ai-sdk/react'
import { Paperclip } from 'lucide-react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import type { FileUIPart } from 'ai'
import { DefaultChatTransport } from 'ai'
import Image from 'next/image'
import { useCallback, useRef, useState } from 'react'
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation'
import { InlineCitation, InlineCitationText } from '@/components/ai-elements/inline-citation'
import { Message, MessageContent, MessageResponse } from '@/components/ai-elements/message'
import {
  PromptInputBody,
  PromptInputFooter,
  PromptInputProvider,
  PromptInputSubmit,
  PromptInputTextarea,
} from '@/components/ai-elements/prompt-input'
import { SuggestionButton } from '@/components/assistant/suggestion-button'
import { ProductCitation } from '@/components/rag/product-citation'
import { Button } from '@/components/ui/button'
import { SUGGESTED_QUESTIONS_WITH_ICONS } from '@/lib/assistant-data'
import type { FullRagChatMessageMetadata } from '@/lib/rag/types'

const MAX_FILES = 2
const MAX_FILE_SIZE = 4 * 1024 * 1024

interface ChatPanelProps {
  /** Endpoint for the chat API. Defaults to /api/rag/chat */
  api?: string
  /** Whether to show suggested questions when conversation is empty */
  showSuggestedQuestions?: boolean
}

export function ChatPanel({
  api = '/api/rag/chat',
  showSuggestedQuestions = true,
}: ChatPanelProps) {
  const [error, setError] = useState<string | null>(null)
  const [pendingFiles, setPendingFiles] = useState<Array<{ file: File; preview: string }>>([])
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const { messages, sendMessage, status, regenerate, stop } = useChat({
    transport: new DefaultChatTransport({ api }),
  })

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
      ? (lastMsg.metadata as FullRagChatMessageMetadata).citations
      : null

  const hasCitations = !!(citations && citations.length > 0)

  return (
    <PromptInputProvider>
      <Conversation className="flex-1">
        <ConversationContent>
          {messages.length === 0 ? (
            showSuggestedQuestions ? (
              <div className="flex h-full items-center justify-center p-4">
                <div className="grid w-full gap-2.5 grid-cols-2">
                  {SUGGESTED_QUESTIONS_WITH_ICONS.map(item => (
                    <SuggestionButton
                      key={item.text}
                      display={item.text}
                      icon={item.icon}
                      prompt={item.text}
                      sendMessage={({ text }) => handleSuggestion(text)}
                    />
                  ))}
                </div>
              </div>
            ) : null
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
                        .map(p => p.text)
                        .join('')}
                    </MessageResponse>
                  </MessageContent>

                  {msg.role === 'assistant' && hasCitations && (
                    <div className="mt-2 flex flex-col gap-2">
                      {citations?.map(c => (
                        <ProductCitation key={c.handle} product={c} />
                      ))}
                    </div>
                  )}
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
                  <XMarkIcon className="size-3" />
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
                <Paperclip className="size-4" />
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
    </PromptInputProvider>
  )
}

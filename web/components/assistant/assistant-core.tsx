'use client'

import { useChat } from '@ai-sdk/react'
import {
  ArrowUpIcon,
  ChevronDownIcon,
  DocumentTextIcon,
  PaperClipIcon,
  StopIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { DefaultChatTransport } from 'ai'
import Image from 'next/image'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation'
import { MessageResponse } from '@/components/ai-elements/message'
import {
  PromptInputBody,
  PromptInputFooter,
  PromptInputProvider,
  PromptInputSubmit,
  PromptInputTextarea,
} from '@/components/ai-elements/prompt-input'
import { SpeechInput } from '@/components/ai-elements/speech-input'
import { SuggestionButton } from '@/components/assistant/suggestion-button'
import { ProductCitation } from '@/components/rag/product-citation'
import { Button } from '@/components/ui/button'
import { CopyButton } from '@/components/ui/copy-button'
import { useScrollToBottom } from '@/hooks/use-scroll-to-bottom'
import { useTimeBasedGreeting } from '@/hooks/use-time-based-greeting'
import { SUGGESTED_QUESTIONS_WITH_ICONS } from '@/lib/assistant-data'
import type { FullRagChatMessageMetadata } from '@/lib/rag/types'
import { cleanSuggestionMarkers, cn } from '@/lib/utils'

interface AttachmentChipProps {
  file: File
  preview: string
  onRemove: () => void
}

function AttachmentChip({ file, preview, onRemove }: AttachmentChipProps) {
  return (
    <div className="relative flex items-center gap-2 rounded-t-xl border border-b-0 border-border bg-card px-3 pb-5 pt-2 text-xs text-foreground -mb-3">
      <div className="h-9 w-9 shrink-0 overflow-hidden rounded-md bg-muted">
        {/* biome-ignore lint/performance/noImgElement: File preview thumbnail */}
        <img alt={file.name} className="h-full w-full object-cover" src={preview} />
      </div>
      <span className="max-w-48 truncate">{file.name}</span>
      <button
        aria-label="Remove attachment"
        className="ml-auto flex h-6 w-6 items-center justify-center rounded-full hover:bg-foreground/10 transition-colors"
        onClick={onRemove}
        type="button"
      >
        <XMarkIcon className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

interface UserMessageProps {
  message: {
    id: string
    parts?: Array<
      | { type: 'text'; text: string }
      | { type: 'file'; url: string; mediaType: string; filename?: string }
    >
  }
}

function UserMessage({ message }: UserMessageProps) {
  const textContent =
    message.parts
      ?.filter(p => p.type === 'text')
      .map(p => p.text)
      .join('') || ''

  const imageParts =
    (message.parts?.filter(p => p.type === 'file' && p.mediaType?.startsWith('image/')) as Array<{
      type: 'file'
      url: string
      mediaType: string
      filename?: string
    }>) || []

  const fileParts =
    (message.parts?.filter(p => p.type === 'file' && !p.mediaType?.startsWith('image/')) as Array<{
      type: 'file'
      url: string
      mediaType: string
      filename?: string
    }>) || []

  return (
    <div className="flex items-end justify-end gap-2">
      <div className="flex max-w-[95%] flex-col gap-2 sm:max-w-[85%] md:max-w-[80%]">
        <div className="flex flex-col gap-2">
          {imageParts.length > 0 && (
            <div className="flex flex-wrap justify-end gap-2">
              {imageParts.map(img => (
                // biome-ignore lint/performance/noImgElement: User-uploaded image preview in chat
                <img
                  key={img.url}
                  alt={img.filename || 'Attachment'}
                  className="max-h-48 max-w-48 rounded-xl object-cover"
                  src={img.url}
                />
              ))}
            </div>
          )}
          {fileParts.length > 0 && (
            <div className="flex flex-wrap justify-end gap-2">
              {fileParts.map(file => (
                <div
                  key={file.url}
                  className="flex items-center gap-1.5 rounded-xl bg-secondary px-3 py-2 text-xs text-foreground"
                >
                  <DocumentTextIcon className="size-3.5 shrink-0 opacity-70" />
                  <span className="max-w-[180px] truncate">{file.filename || 'File'}</span>
                </div>
              ))}
            </div>
          )}
          {textContent.trim() && (
            <div className="rounded-2xl bg-secondary px-3 py-2 text-sm text-foreground sm:px-4 sm:py-3 sm:text-base">
              {textContent}
            </div>
          )}
        </div>
      </div>
      <Image
        alt="User"
        className="h-7 w-7 shrink-0 rounded-full sm:h-8 sm:w-8"
        height={32}
        src="/loom-avatar-64.webp"
        width={32}
      />
    </div>
  )
}

interface AssistantMessageProps {
  message: {
    id: string
    parts?: Array<
      | { type: 'text'; text: string }
      | { type: 'file'; url: string; mediaType: string; filename?: string }
    >
    metadata?: unknown
  }
}

function AssistantMessage({ message }: AssistantMessageProps) {
  const textPart =
    message.parts
      ?.filter(p => p.type === 'text')
      .map(p => p.text)
      .join('') || ''

  const cleanedText = cleanSuggestionMarkers(textPart)

  const citations =
    message.metadata != null ? (message.metadata as FullRagChatMessageMetadata).citations : null

  const hasCitations = !!(citations && citations.length > 0)

  return (
    <div className="flex items-start justify-start gap-2">
      <Image
        alt="Assistant"
        className="h-7 w-7 shrink-0 sm:h-8 sm:w-8"
        height={32}
        src="/chat-logo-32.webp"
        width={32}
      />
      <div className="flex w-full max-w-full flex-col gap-2 lg:max-w-5xl">
        <div className="flex flex-1 flex-col gap-2 min-w-0">
          {cleanedText && (
            <div className="rounded-lg bg-transparent p-0">
              <MessageResponse>{cleanedText}</MessageResponse>
            </div>
          )}
          {cleanedText && <CopyButton content={cleanedText} />}
          {hasCitations && (
            <div className="mt-2 flex flex-col gap-2">
              {citations?.map(c => (
                <ProductCitation key={c.handle} product={c} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface AssistantCoreProps {
  api?: string
  showSuggestedQuestions?: boolean
}

export function AssistantCore({
  api = '/api/rag/chat',
  showSuggestedQuestions = true,
}: AssistantCoreProps) {
  const [inputValue, setInputValue] = useState('')
  const [inputError, setInputError] = useState<string | null>(null)
  const [pendingFiles, setPendingFiles] = useState<Array<{ file: File; preview: string }>>([])
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  const greeting = useTimeBasedGreeting()
  const { showButton, scrollToBottom } = useScrollToBottom(contentRef)

  const { messages, sendMessage, status, stop } = useChat({
    transport: new DefaultChatTransport({ api }),
  })

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputError(null)
    const incoming = Array.from(e.target.files ?? [])
    if (!incoming.length) return

    const previews = incoming.map(f => ({
      file: f,
      preview: URL.createObjectURL(f),
    }))
    setPendingFiles(prev => [...prev, ...previews])
    e.target.value = ''
  }, [])

  const removeFile = useCallback((preview: string) => {
    setPendingFiles(prev => {
      URL.revokeObjectURL(preview)
      return prev.filter(f => f.preview !== preview)
    })
  }, [])

  const handleSuggestion = useCallback(
    (q: string) => {
      setInputError(null)
      setPendingFiles([])
      sendMessage({ text: q })
    },
    [sendMessage]
  )

  const handleSubmit = useCallback(
    async (text: string) => {
      if (!text.trim() && pendingFiles.length === 0) return
      setPendingFiles([])
      const textToSend = text.trim() || ''
      setInputValue('')
      await sendMessage({ text: textToSend })
    },
    [pendingFiles.length, sendMessage]
  )

  // biome-ignore lint/correctness/useExhaustiveDependencies: messages.length triggers scroll on new messages
  useEffect(() => {
    scrollToBottom()
  }, [scrollToBottom, messages.length])

  const handleSpeechTranscription = useCallback((text: string) => {
    setInputValue(text)
    inputRef.current?.focus()
  }, [])

  const isSendDisabled = useMemo(() => {
    const hasText = inputValue.trim().length > 0
    const hasValidAttachments = pendingFiles.length > 0
    return !hasText && !hasValidAttachments
  }, [inputValue, pendingFiles])

  return (
    <div className="relative flex h-full flex-col bg-background">
      <Conversation className="flex-1 overflow-hidden">
        <ConversationContent className="flex-1 gap-8 p-4 pb-32 sm:pb-40">
          <div className="h-full overflow-auto" ref={contentRef}>
            {messages.length === 0 && (
              <div className="flex h-full items-center justify-center p-4 sm:p-6 md:p-8">
                <div className="w-full max-w-2xl space-y-6 sm:space-y-8">
                  <div className="flex flex-col items-center space-y-3 text-center sm:space-y-4">
                    <Image
                      alt="Enermation"
                      className="h-8 w-8 object-contain"
                      height={32}
                      src="/chat-logo-32.webp"
                      width={32}
                    />
                    {greeting ? (
                      <h1
                        key={greeting}
                        className="animate-in fade-in slide-in-from-bottom-4 font-sans text-2xl font-normal text-foreground duration-500 sm:text-3xl md:text-4xl"
                        suppressHydrationWarning
                      >
                        {greeting}
                      </h1>
                    ) : (
                      <div className="font-sans text-2xl sm:text-3xl md:text-4xl" />
                    )}
                    <p className="font-sans text-sm text-muted-foreground sm:text-base">
                      Ask me about vehicles or parts
                    </p>
                  </div>

                  {showSuggestedQuestions && (
                    <div className="grid gap-2.5 sm:grid-cols-2 sm:gap-3">
                      {SUGGESTED_QUESTIONS_WITH_ICONS.map(suggestionItem => (
                        <SuggestionButton
                          key={suggestionItem.text}
                          display={suggestionItem.text}
                          icon={suggestionItem.icon}
                          prompt={suggestionItem.text}
                          sendMessage={handleSuggestion}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="container mx-auto max-w-4xl space-y-6 px-3 py-6 sm:space-y-6 sm:px-4 sm:py-8 md:px-12">
              {messages.map(message =>
                message.role === 'user' ? (
                  <UserMessage key={message.id} message={message} />
                ) : status === 'streaming' &&
                  message.id === messages[messages.length - 1].id ? null : (
                  <AssistantMessage key={message.id} message={message} />
                )
              )}

              {(status === 'submitted' || status === 'streaming') && (
                <div className="flex items-center gap-2 sm:gap-3">
                  <Image
                    alt="Assistant"
                    className="h-6 w-6 shrink-0 animate-spin"
                    height={32}
                    src="/chat-logo-32.webp"
                    width={32}
                  />
                  <div className="flex items-center gap-2 font-sans text-xs text-muted-foreground sm:text-sm">
                    <span className="text-sm">Thinking</span>
                    <div className="flex gap-1">
                      <div
                        className="h-1 w-1 animate-bounce rounded-full bg-muted-foreground"
                        style={{ animationDelay: '0ms' }}
                      />
                      <div
                        className="h-1 w-1 animate-bounce rounded-full bg-muted-foreground"
                        style={{ animationDelay: '150ms' }}
                      />
                      <div
                        className="h-1 w-1 animate-bounce rounded-full bg-muted-foreground"
                        style={{ animationDelay: '300ms' }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <ConversationScrollButton />
        </ConversationContent>
      </Conversation>

      {/* Gradient fade above input */}
      <div className="pointer-events-none absolute bottom-28 left-0 right-0 h-30 bg-gradient-to-t from-background to-transparent sm:bottom-32" />

      {/* Floating scroll-to-bottom button */}
      {showButton && (
        <button
          aria-label="Scroll to bottom"
          className="absolute bottom-28 right-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-foreground text-background shadow-lg transition-all animate-in fade-in zoom-in-95 duration-200 hover:opacity-90 active:scale-95 sm:bottom-32 sm:right-6"
          onClick={scrollToBottom}
          type="button"
        >
          <ChevronDownIcon className="h-4 w-4" />
        </button>
      )}

      {/* Input area */}
      <div className="absolute bottom-0 left-0 right-0 z-10 mx-auto w-full max-w-3xl p-3 pointer-events-none sm:p-4">
        <div className="pointer-events-auto">
          {inputError && (
            <div className="rounded-t-lg border border-b-0 border-destructive/30 bg-destructive px-3 py-2 text-sm text-destructive-foreground -mb-3">
              <div className="flex items-center justify-between gap-2">
                <span>{inputError}</span>
                <button
                  className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-destructive-foreground/10"
                  onClick={() => setInputError(null)}
                  type="button"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
          {pendingFiles.map(({ preview, file }) => (
            <AttachmentChip
              key={preview}
              file={file}
              preview={preview}
              onRemove={() => removeFile(preview)}
            />
          ))}
          <PromptInputProvider>
            <form
              className="rounded-2xl border border-border bg-background shadow-sm"
              onSubmit={e => {
                e.preventDefault()
                handleSubmit(inputValue)
              }}
            >
              <PromptInputBody>
                <PromptInputFooter className="px-4 py-2">
                  <input
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    multiple
                    onChange={handleFileInputChange}
                    ref={fileInputRef}
                    type="file"
                  />
                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      className="size-7"
                      onClick={() => fileInputRef.current?.click()}
                      size="icon"
                      type="button"
                      variant="ghost"
                    >
                      <PaperClipIcon className="size-4" />
                      <span className="sr-only">Attach file</span>
                    </Button>
                    <SpeechInput
                      className="size-7"
                      onAudioRecorded={async () => ''}
                      onTranscriptionChange={handleSpeechTranscription}
                      size="icon"
                      variant="ghost"
                    />
                  </div>
                  <PromptInputTextarea
                    className="font-sans text-sm sm:text-base"
                    onChange={e => setInputValue(e.target.value)}
                    placeholder="Ask about vehicles or parts..."
                    ref={inputRef}
                    value={inputValue}
                  />
                  <PromptInputSubmit
                    className={cn(
                      'size-7',
                      isSendDisabled
                        ? 'bg-muted text-muted-foreground hover:bg-muted'
                        : 'bg-foreground text-background hover:opacity-90'
                    )}
                    disabled={isSendDisabled}
                    onStop={status === 'streaming' ? stop : undefined}
                    size="icon"
                    status={status}
                    type="submit"
                  >
                    {status === 'streaming' ? (
                      <StopIcon className="size-4" />
                    ) : (
                      <ArrowUpIcon className="size-4" />
                    )}
                  </PromptInputSubmit>
                </PromptInputFooter>
              </PromptInputBody>
            </form>
          </PromptInputProvider>
        </div>
      </div>
    </div>
  )
}

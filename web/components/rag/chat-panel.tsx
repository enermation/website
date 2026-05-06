'use client'

import { useChat } from '@ai-sdk/react'
import { ChevronRight, Hand, X } from 'lucide-react'
import type { FileUIPart } from 'ai'
import { DefaultChatTransport } from 'ai'
import Image from 'next/image'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import {
  MessageResponse,
} from '@/components/ai-elements/message'
import { PromptInputProvider } from '@/components/ai-elements/prompt-input'
import { CopyButton } from '@/components/ui/copy-button'
import { Button } from '@/components/ui/button'
import { Conversation, ConversationContent, ConversationDownload, ConversationScrollButton } from '@/components/ai-elements/conversation'
import { ProductCitation } from '@/components/rag/product-citation'
import { SuggestionButton } from '@/components/ui/suggestion-button'
import { useTimeBasedGreeting } from '@/hooks/use-time-based-greeting'
import { ASSISTANT_EMPTY_DESCRIPTION, SUGGESTED_QUESTIONS_WITH_ICONS } from '@/lib/assistant-data'
import type { FullRagChatMessageMetadata, ProductCitationData } from '@/lib/rag/types'
import { cn } from '@/lib/utils'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'

const ChatInputArea = dynamic(
  () => import('@/components/rag/chat-input-area'),
  { ssr: false, loading: () => <div className="flex-shrink-0 h-24" /> }
)

const MAX_FILES = 2
const MAX_FILE_SIZE = 4 * 1024 * 1024

// ============================================================================
// Interleaved Block Parsing
// ============================================================================

interface InterleavedBlock {
  text: string
  cards: ProductCitationData[]
}

// Splits AI text into per-paragraph blocks and attaches the first-mention
// product card to each paragraph that references a [handle]. Subsequent
// mentions of the same handle in later paragraphs don't duplicate the card.
function parseInterleavedBlocks(
  text: string,
  citations: ProductCitationData[]
): InterleavedBlock[] {
  const citationMap = new Map(citations.map(c => [c.handle, c]))
  const shownHandles = new Set<string>()
  const paragraphs = text.split(/\n\n+/)

  const blocks: InterleavedBlock[] = []
  for (const para of paragraphs) {
    if (!para.trim()) continue
    const handles = [...para.matchAll(/\[([a-z0-9][a-z0-9-]*)\]/g)].map(m => m[1])
    const newHandles = handles.filter(h => !shownHandles.has(h) && citationMap.has(h))
    const cards = newHandles.map(h => citationMap.get(h)!)
    newHandles.forEach(h => shownHandles.add(h))
    const cleanedText = para.replace(/\[([a-z0-9][a-z0-9-]*)\]/g, '').trim()
    if (cleanedText || cards.length) blocks.push({ text: cleanedText, cards })
  }

  return blocks
}

// Strips [handle] brackets from text without parsing citations (used during streaming)
function stripHandles(text: string): string {
  return text.replace(/\[([a-z0-9][a-z0-9-]*)\]/g, '')
}

interface ChatPanelProps {
  /** Endpoint for the chat API. Defaults to /api/rag/chat */
  api?: string
  /** Whether to show suggested questions when conversation is empty */
  showSuggestedQuestions?: boolean
}

// ============================================================================
// User Message Component
// ============================================================================

function UserMessage({
  message,
}: {
  message: { id: string; parts: Array<{ type: string; url?: string; mediaType?: string; text?: string; filename?: string }> }
}) {
  const imageParts = message.parts.filter(
    (p): p is { type: 'file'; url: string; mediaType: string; filename?: string } =>
      p.type === 'file' && !!p.url && !!p.mediaType?.startsWith('image/')
  )

  const textContent = message.parts
    .filter(p => p.type === 'text')
    .map(p => p.text)
    .join('')

  return (
    <div className="flex justify-end items-end gap-2">
      <div className="max-w-[95%] gap-2 sm:max-w-[85%] sm:gap-3 md:max-w-[80%] lg:max-w-4xl flex flex-col">
        <div className="flex flex-col gap-2">
          {imageParts.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-end">
              {imageParts.map((img, i) => (
                <Image
                  key={`img-${i}-${img.url}`}
                  alt={img.filename || 'Attachment'}
                  className="max-h-48 max-w-48 rounded-xl object-cover"
                  height={192}
                  src={img.url}
                  width={192}
                />
              ))}
            </div>
          )}
          {textContent.trim() && (
            <div className="rounded-2xl bg-secondary px-4 py-3 text-sm text-foreground">
              {textContent}
            </div>
          )}
        </div>
      </div>
      <Image
        alt="User"
        className="h-8 w-8 flex-shrink-0 rounded-full"
        height={32}
        src="/loom-avatar-64.webp"
        width={32}
      />
    </div>
  )
}

// ============================================================================
// Reasoning Collapsible Component
// ============================================================================

function ReasoningCollapsible({ reasoning }: { reasoning: string }) {
  return (
    <Collapsible defaultOpen={false}>
      <CollapsibleTrigger className="flex items-center gap-1 font-sans text-xs text-muted-foreground transition-colors hover:text-foreground group">
        <ChevronRight className="h-3 w-3 transition-transform group-data-[state=open]:rotate-90" />
        <span>View thinking process</span>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2">
        <div className="prose prose-sm max-w-full break-words rounded-xl border border-border bg-muted/50 p-3 font-sans text-xs leading-relaxed text-muted-foreground dark:prose-invert sm:p-4 sm:text-sm">
          {reasoning}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

// ============================================================================
// Assistant Message Component
// ============================================================================

function AssistantMessage({
  message,
  allCitations,
  isStreaming,
}: {
  message: { id: string; parts: Array<{ type: string; text?: string; reason?: string }> }
  allCitations: ProductCitationData[] | null
  isStreaming?: boolean
}) {
  const reasoningPart = message.parts.find(p => p.type === 'reasoning') as
    | { type: 'reasoning'; text: string }
    | undefined

  const textContent = message.parts
    .filter(p => p.type === 'text')
    .map(p => p.text)
    .join('')

  // After streaming completes, parse text into interleaved text+card blocks
  const blocks = useMemo(
    () =>
      !isStreaming && allCitations?.length
        ? parseInterleavedBlocks(textContent, allCitations)
        : null,
    [isStreaming, allCitations, textContent]
  )

  // If the AI didn't cite any handles, fall back to showing the top 2 products
  const hasCards = blocks?.some(b => b.cards.length > 0) ?? false
  const fallbackCards = !isStreaming && !hasCards && allCitations?.length
    ? allCitations.slice(0, 2)
    : null

  // During streaming, strip [handle] from display text to avoid showing raw citation syntax
  const streamText = isStreaming ? stripHandles(textContent) : null

  return (
    <div className="flex justify-start items-start gap-2">
      <Image
        alt="Enermation"
        className="h-8 w-8 flex-shrink-0"
        height={32}
        src="/miles_logo.png"
        width={32}
      />
      <div className="w-full max-w-4xl gap-2 sm:gap-3 flex flex-col">
        <div className="flex-1 space-y-3 min-w-0">
          {reasoningPart?.text && (
            <ReasoningCollapsible reasoning={reasoningPart.text} />
          )}

          {blocks ? (
            <div className="space-y-4">
              {blocks.map((block, i) => (
                <div key={i} className="space-y-3">
                  {block.text && <MessageResponse>{block.text}</MessageResponse>}
                  {block.cards.map(c => (
                    <ProductCitation key={c.handle} product={c} />
                  ))}
                </div>
              ))}
            </div>
          ) : (streamText ?? textContent) ? (
            <MessageResponse isAnimating={isStreaming}>
              {streamText ?? textContent}
            </MessageResponse>
          ) : null}

          {fallbackCards && (
            <div className="flex flex-col gap-3 pt-1">
              <h3 className="font-sans text-xs font-medium text-muted-foreground">Related vehicles</h3>
              {fallbackCards.map(c => (
                <ProductCitation key={c.handle} product={c} />
              ))}
            </div>
          )}

          {textContent && !isStreaming && (
            <CopyButton content={textContent} />
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Thinking Indicator Component
// ============================================================================

function ThinkingIndicator() {
  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <Image
        alt="Thinking"
        className="h-6 w-6 flex-shrink-0 motion-safe:animate-spin sm:h-6 sm:w-6"
        height={24}
        src="/miles_logo.png"
        width={24}
      />
      <div className="flex items-center gap-2 font-sans text-xs text-muted-foreground sm:text-sm">
        <span className="text-sm">Thinking </span>
        <div className="flex gap-1">
          <div
            className="h-1 w-1 motion-safe:animate-bounce rounded-full bg-muted-foreground"
            style={{ animationDelay: '0ms' }}
          />
          <div
            className="h-1 w-1 motion-safe:animate-bounce rounded-full bg-muted-foreground"
            style={{ animationDelay: '150ms' }}
          />
          <div
            className="h-1 w-1 motion-safe:animate-bounce rounded-full bg-muted-foreground"
            style={{ animationDelay: '300ms' }}
          />
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Chat Input Area — loaded client-only (react-audio-wavekit needs browser APIs)
// ============================================================================

// ============================================================================
// Main ChatPanel Component
// ============================================================================

export function ChatPanel({
  api = '/api/rag/chat',
  showSuggestedQuestions = true,
}: ChatPanelProps) {
  const [error, setError] = useState<string | null>(null)
  const [inputValue, setInputValue] = useState('')
  const [suggestion, setSuggestion] = useState('')
  const [pendingFiles, setPendingFiles] = useState<Array<{ file: File; preview: string }>>([])
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const cameraInputRef = useRef<HTMLInputElement | null>(null)
  const inputRef = useRef<HTMLTextAreaElement | null>(null)

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
      setSuggestion('')
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
      setSuggestion('')
      sendMessage({ text: q, files: [] })
    },
    [sendMessage]
  )

  const greeting = useTimeBasedGreeting()

  const followUps = useMemo(() => {
    if (status === 'streaming' || status === 'submitted') return []
    const last = [...messages].reverse().find(m => m.role === 'assistant')
    if (!last?.metadata) return []
    return ((last.metadata as FullRagChatMessageMetadata).suggestions ?? [])
  }, [messages, status])

  // Apply suggestion with Tab or ArrowRight when textarea is empty
  useEffect(() => {
    const inputElement = inputRef.current
    if (!inputElement) return

    const handleKeyDown = (e: KeyboardEvent) => {
      const shouldApplySuggestion =
        (e.key === 'Tab' || e.key === 'ArrowRight') && suggestion && !inputValue
      if (shouldApplySuggestion) {
        e.preventDefault()
        setInputValue(suggestion)
        setSuggestion('')
      }
    }

    inputElement.addEventListener('keydown', handleKeyDown)
    return () => inputElement.removeEventListener('keydown', handleKeyDown)
  }, [suggestion, inputValue])

  return (
    <PromptInputProvider>
      <div className="relative h-full overflow-hidden">
        <Conversation>
          {messages.length === 0 && showSuggestedQuestions && (
            <div className="flex h-full items-center justify-center p-4 sm:p-6 md:p-8">
              <div className="w-full max-w-3xl space-y-6 sm:space-y-8">
                <div className="space-y-3 text-center sm:space-y-4">
                  <Image
                    src="/miles_logo.png"
                    alt="Miles"
                    width={32}
                    height={32}
                    className="mx-auto h-8 w-8 object-contain"
                  />
                  {greeting ? (
                    <h2
                      key={greeting}
                      className="text-2xl font-normal text-foreground sm:text-3xl md:text-4xl animate-in fade-in slide-in-from-bottom-4 duration-500"
                      suppressHydrationWarning
                    >
                      {greeting}
                    </h2>
                  ) : (
                    <div className="text-2xl font-normal text-foreground sm:text-3xl md:text-4xl min-h-[1.5em]" />
                  )}
                  <p className="text-sm text-muted-foreground sm:text-base">
                    {ASSISTANT_EMPTY_DESCRIPTION}
                  </p>
                </div>

                <div className="grid gap-2.5 sm:grid-cols-2 sm:gap-3">
                  {SUGGESTED_QUESTIONS_WITH_ICONS.map(item => (
                    <SuggestionButton
                      key={item.text}
                      display={item.text}
                      prompt={item.text}
                      sendMessage={({ text }) => handleSuggestion(text)}
                      icon={item.icon}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          <ConversationContent className="container px-3 py-6 max-w-4xl mx-auto sm:space-y-6 sm:px-4 sm:py-8 md:px-12">
            {messages.map((msg, index) => {
              if (msg.role === 'user') {
                return <UserMessage key={msg.id} message={msg} />
              }
              const msgCitations =
                msg.metadata != null
                  ? ((msg.metadata as FullRagChatMessageMetadata).citations ?? null)
                  : null
              const isStreamingThisMsg =
                status === 'streaming' && index === messages.length - 1
              return (
                <AssistantMessage
                  key={msg.id}
                  message={msg}
                  allCitations={msgCitations}
                  isStreaming={isStreamingThisMsg}
                />
              )
            })}

            {status === 'submitted' && <ThinkingIndicator />}

            {followUps.length > 0 && (
              <div className="flex flex-wrap gap-2 pl-10 animate-in fade-in duration-300">
                {followUps.map(q => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => handleSuggestion(q)}
                    className="rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-foreground/20 hover:text-foreground"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
          </ConversationContent>

          {messages.length > 0 && (
            <ConversationDownload messages={messages} />
          )}
          <ConversationScrollButton />
        </Conversation>

        {/* Floating prompt bar */}
        <div className="absolute inset-x-0 bottom-0 z-10">
          {status === 'error' && (
            <div className="flex items-center justify-between gap-2 border-t border-border bg-background px-4 py-2">
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
          <ChatInputArea
            inputValue={inputValue}
            setInputValue={setInputValue}
            pendingFiles={pendingFiles}
            removeFile={removeFile}
            status={status}
            stop={stop}
            fileInputRef={fileInputRef}
            cameraInputRef={cameraInputRef}
            inputRef={inputRef}
            handleFileChange={handleFileChange}
            onSubmit={handleSubmit}
            error={error}
            setError={setError}
          />
        </div>
      </div>
    </PromptInputProvider>
  )
}

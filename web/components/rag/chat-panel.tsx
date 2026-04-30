'use client'

import { useChat } from '@ai-sdk/react'
import { AudioLines, Camera, ChevronRight, Hand, Paperclip, Square, X } from 'lucide-react'
import type { FileUIPart } from 'ai'
import { DefaultChatTransport } from 'ai'
import Image from 'next/image'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  MessageResponse,
} from '@/components/ai-elements/message'
import {
  PromptInputAction,
  PromptInputBody,
  PromptInputFooter,
  PromptInputProvider,
  PromptInputSubmit,
  PromptInputTextarea,
} from '@/components/ai-elements/prompt-input'
import { SpeechInput } from '@/components/ai-elements/speech-input'
import { VoiceWaveform } from '@/components/ai-elements/voice-waveform'
import { CopyButton } from '@/components/ui/copy-button'
import { Button } from '@/components/ui/button'
import { ProductCitation } from '@/components/rag/product-citation'
import { SuggestionButton } from '@/components/ui/suggestion-button'
import { useTimeBasedGreeting } from '@/hooks/use-time-based-greeting'
import { SUGGESTED_QUESTIONS_WITH_ICONS } from '@/lib/assistant-data'
import type { FullRagChatMessageMetadata, ProductCitationData } from '@/lib/rag/types'
import { cn } from '@/lib/utils'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'

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
      <div className="max-w-[95%] gap-2 sm:max-w-[85%] sm:gap-3 md:max-w-[80%] flex flex-col">
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
      <div className="w-full max-w-full gap-2 sm:gap-3 lg:max-w-5xl flex flex-col">
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
  const [recordingStream, setRecordingStream] = useState<MediaStream | null>(null)
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

  const handleSpeechTranscription = useCallback((text: string) => {
    setInputValue(text)
  }, [])

  const handleStartRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      setRecordingStream(stream)
    } catch {
      setError('Failed to access microphone')
    }
  }, [])

  const handleStopRecording = useCallback(() => {
    if (recordingStream) {
      recordingStream.getTracks().forEach(track => track.stop())
      setRecordingStream(null)
    }
  }, [recordingStream])

  const isSendDisabled = useMemo(() => {
    const hasText = inputValue.trim().length > 0
    const hasValidAttachments = pendingFiles.length > 0
    return !hasText && !hasValidAttachments
  }, [inputValue, pendingFiles])

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

  const handleFormSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      if (isSendDisabled) return
      const text = inputValue.trim()
      const files: FileUIPart[] = pendingFiles.map(pf => ({
        type: 'file' as const,
        mediaType: pf.file.type,
        url: pf.preview,
        filename: pf.file.name,
      }))
      handleSubmit({ text, files })
      setInputValue('')
    },
    [isSendDisabled, inputValue, pendingFiles, handleSubmit]
  )

  return (
    <PromptInputProvider>
      <div className="flex h-full flex-col overflow-hidden">
        {/* Messages area — scrolls, prompt bar is sticky INSIDE this */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 && showSuggestedQuestions && (
            <div className="flex h-full items-center justify-center p-4 sm:p-6 md:p-8">
              <div className="w-full max-w-2xl space-y-6 sm:space-y-8">
                <div className="space-y-3 text-center sm:space-y-4">
                  <div className="flex justify-center">
                    <Image
                      src="/miles_logo.png"
                      alt="Miles"
                      width={32}
                      height={32}
                      className="h-8 w-8 object-contain"
                    />
                  </div>
                  {greeting ? (
                    <h2
                      key={greeting}
                      className="font-sans text-2xl font-normal text-foreground sm:text-3xl md:text-4xl animate-in fade-in slide-in-from-bottom-4 duration-500"
                      suppressHydrationWarning
                    >
                      {greeting}
                    </h2>
                  ) : (
                    <div className="font-sans text-2xl font-normal text-foreground sm:text-3xl md:text-4xl" />
                  )}
                  <p className="font-sans text-sm text-muted-foreground sm:text-base">
                    Hi, I'm Miles <Hand className="inline size-4 align-middle" /> — your Enermation assistant. I can help you find vehicles, prices, and shipping details instantly.
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

          <div className="space-y-4 container px-3 py-6 max-w-4xl mx-auto sm:space-y-6 sm:px-4 sm:py-8 md:px-12">
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

            {/* Spacer for sticky prompt bar clearance */}
            <div className="h-28" aria-hidden />
          </div>
        </div>

        {/* Error bar */}
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

        {/* Pending files preview */}
        {pendingFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 px-4 py-2">
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
                    <X className="size-3" />
                  </button>
                </div>
              )
            })}
          </div>
        )}

        {/* Prompt input — sticky footer inside the card's flex column */}
        <div className="flex-shrink-0 px-3 pb-6 pt-3 sm:px-4 sm:pb-6">
          <div className="max-w-3xl mx-auto">
            {error && (
              <div className="mb-2 rounded-lg border border-destructive/30 bg-destructive px-3 py-2 text-sm text-destructive-foreground">
                <div className="flex items-center justify-between gap-2">
                  <span>{error}</span>
                  <button
                    className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-destructive-foreground/10"
                    onClick={() => setError(null)}
                    type="button"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {recordingStream && (
              <div className="mb-2">
                <VoiceWaveform stream={recordingStream} />
                <button
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm text-white hover:bg-red-600"
                  onClick={handleStopRecording}
                  type="button"
                >
                  <X className="size-4" />
                  Stop recording
                </button>
              </div>
            )}

            <div className="relative rounded-2xl border border-border/80 bg-background shadow-sm shadow-foreground/5">
              <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />
              <form onSubmit={handleFormSubmit}>
                <PromptInputBody>
                  <PromptInputFooter className="px-4 py-3">
                    <input
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      multiple
                      onChange={handleFileChange}
                      ref={fileInputRef}
                      type="file"
                    />
                    <input
                      accept="image/jpeg,image/png,image/webp"
                      capture="environment"
                      className="hidden"
                      onChange={handleFileChange}
                      ref={cameraInputRef}
                      type="file"
                    />
                    <div className="flex shrink-0 items-center gap-1">
                      <PromptInputAction tooltip="Attach file">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex h-8 w-8 items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors sm:h-9 sm:w-9"
                          aria-label="Attach file"
                        >
                          <Paperclip className="h-4 w-4 sm:h-5 sm:w-5" />
                        </button>
                      </PromptInputAction>
                      <PromptInputAction tooltip="Take photo">
                        <button
                          type="button"
                          onClick={() => cameraInputRef.current?.click()}
                          className="flex h-8 w-8 items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors sm:h-9 sm:w-9"
                          aria-label="Take photo"
                        >
                          <Camera className="h-4 w-4 sm:h-5 sm:w-5" />
                        </button>
                      </PromptInputAction>
                      <PromptInputAction tooltip="Use voice mode">
                        <button
                          type="button"
                          onClick={recordingStream ? handleStopRecording : handleStartRecording}
                          className={cn(
                            'flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300 ease-[cubic-bezier(0.165,0.85,0.45,1)] active:scale-[0.98] sm:h-9 sm:w-9',
                            recordingStream
                              ? 'bg-destructive text-white hover:bg-destructive/80 hover:text-white'
                              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                          )}
                          aria-label={recordingStream ? 'Stop recording' : 'Start recording'}
                        >
                          {recordingStream ? (
                            <Square className="h-3 w-3 sm:h-4 sm:w-4 fill-current" />
                          ) : (
                            <AudioLines className="h-4 w-4 sm:h-5 sm:w-5" />
                          )}
                        </button>
                      </PromptInputAction>
                    </div>
                    <PromptInputTextarea
                      className="font-sans text-sm"
                      name="message"
                      onChange={e => setInputValue(e.target.value)}
                      placeholder="Ask about vehicles or parts..."
                      ref={inputRef}
                      value={inputValue}
                    />
                    <PromptInputSubmit
                      className={
                        isSendDisabled
                          ? 'bg-muted text-muted-foreground hover:bg-muted'
                          : 'bg-foreground text-background hover:opacity-90'
                      }
                      disabled={isSendDisabled}
                      onStop={status === 'streaming' ? stop : undefined}
                      size="icon-sm"
                      status={status}
                      type="submit"
                    />
                  </PromptInputFooter>
                </PromptInputBody>
              </form>
            </div>
          </div>
        </div>
      </div>
    </PromptInputProvider>
  )
}

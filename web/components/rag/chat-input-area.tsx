'use client'

import React, { useCallback, useRef } from 'react'
import { AudioLines, Camera, Paperclip, Square, X } from 'lucide-react'
import type { ChatStatus, FileUIPart } from 'ai'
import Image from 'next/image'
import { LiveRecorder, useAudioRecorder } from 'react-audio-wavekit'
import {
  PromptInputAction,
  PromptInputSubmit,
  PromptInputTextarea,
  useOptionalPromptInputController,
} from '@/components/ai-elements/prompt-input'
import { cn } from '@/lib/utils'

export interface ChatInputAreaProps {
  inputValue: string
  setInputValue: React.Dispatch<React.SetStateAction<string>>
  pendingFiles: Array<{ file: File; preview: string }>
  removeFile: (index: number) => void
  status: ChatStatus
  stop: () => void
  fileInputRef: React.RefObject<HTMLInputElement | null>
  cameraInputRef: React.RefObject<HTMLInputElement | null>
  inputRef: React.RefObject<HTMLTextAreaElement | null>
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSubmit: (message: { text: string; files: FileUIPart[] }) => void
  error: string | null
  setError: (e: string | null) => void
}

export default function ChatInputArea({
  inputValue,
  setInputValue,
  pendingFiles,
  removeFile,
  status,
  stop,
  fileInputRef,
  cameraInputRef,
  inputRef,
  handleFileChange,
  onSubmit,
  error,
  setError,
}: ChatInputAreaProps) {
  const controller = useOptionalPromptInputController()

  // Ref keeps the transcription handler up-to-date without destabilising
  // the useCallback passed to useAudioRecorder.
  const transcribeRef = useRef<((blob: Blob) => void) | undefined>(undefined)
  transcribeRef.current = (blob: Blob) => {
    void (async () => {
      try {
        const fd = new FormData()
        fd.append('audio', new File([blob], 'recording.webm', { type: blob.type || 'audio/webm' }))
        const res = await fetch('/api/transcribe', { method: 'POST', body: fd })
        if (res.ok) {
          const { text } = (await res.json()) as { text: string }
          if (text?.trim()) setInputValue(text.trim())
        }
      } catch {
        // Web Speech API transcript already in textarea — nothing to do
      }
    })()
  }

  const { mediaRecorder, isRecording, startRecording, stopRecording } = useAudioRecorder({
    onRecordingComplete: useCallback((blob: Blob) => transcribeRef.current?.(blob), []),
  })
  const recognitionRef = useRef<{ stop: () => void } | null>(null)

  const handleStartVoice = useCallback(async () => {
    type SpeechCtor = new () => {
      continuous: boolean
      interimResults: boolean
      onresult: ((e: { resultIndex: number; results: Array<{ isFinal: boolean; 0: { transcript: string } }> }) => void) | null
      start(): void
      stop(): void
    }
    await startRecording()
    const w = window as Window & { SpeechRecognition?: SpeechCtor; webkitSpeechRecognition?: SpeechCtor }
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition
    if (Ctor) {
      const recognition = new Ctor()
      recognition.continuous = true
      recognition.interimResults = false
      recognition.onresult = (event) => {
        let transcript = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) transcript += event.results[i][0].transcript
        }
        if (transcript) setInputValue(prev => (prev ? `${prev} ${transcript}` : transcript))
      }
      recognition.start()
      recognitionRef.current = recognition
    }
  }, [startRecording, setInputValue])

  const handleStopVoice = useCallback(() => {
    stopRecording()
    recognitionRef.current?.stop()
    recognitionRef.current = null
  }, [stopRecording])

  const isSendDisabled = !inputValue.trim() && pendingFiles.length === 0

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
      onSubmit({ text, files })
      setInputValue('')
      controller?.textInput.clear()
    },
    [isSendDisabled, inputValue, pendingFiles, onSubmit, setInputValue, controller]
  )

  return (
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

        <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-background shadow-sm shadow-foreground/5">
          <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />
          <form onSubmit={handleFormSubmit} className="flex flex-col">
            <input accept="image/jpeg,image/png,image/webp" className="hidden" multiple onChange={handleFileChange} ref={fileInputRef} type="file" />
            <input accept="image/jpeg,image/png,image/webp" capture="environment" className="hidden" onChange={handleFileChange} ref={cameraInputRef} type="file" />

            {pendingFiles.length > 0 && (
              <div className="flex flex-wrap gap-2 px-3 pt-3">
                {pendingFiles.map(({ preview, file }, fileIdx) => (
                  <div key={`file-${fileIdx}`} className="group relative h-16 w-16 overflow-hidden rounded-xl border border-border/60 bg-muted">
                    <Image alt={file.name} className="size-full object-cover" height={64} src={preview} width={64} unoptimized />
                    <button
                      className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/40 group-hover:opacity-100"
                      onClick={() => removeFile(fileIdx)}
                      type="button"
                      aria-label={`Remove ${file.name}`}
                    >
                      <X className="size-4 text-white drop-shadow" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {isRecording ? (
              <div className="flex min-w-0 items-center gap-3 overflow-hidden px-4 pt-3 pb-2">
                <span className="relative flex h-3 w-3 shrink-0">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-destructive" />
                </span>
                <LiveRecorder
                  mediaRecorder={mediaRecorder}
                  className="h-14 w-0 min-w-0 flex-1 overflow-hidden rounded-lg"
                  fftSize={256}
                  smoothingTimeConstant={0.75}
                  amplitudeScale={1.2}
                  showIdleState
                  appearance={{ barColor: 'oklch(0.55 0 0)', barWidth: 3, barGap: 2, barRadius: 2 }}
                />
                <span className="shrink-0 font-sans text-xs text-muted-foreground">Recording…</span>
              </div>
            ) : (
              <PromptInputTextarea
                className="w-full px-4 pt-3 pb-1 font-sans text-sm"
                name="message"
                onChange={e => setInputValue(e.target.value)}
                placeholder="Ask about vehicles or parts..."
                ref={inputRef}
                value={inputValue}
              />
            )}

            <div className="flex items-center justify-between px-2 pb-2 pt-1">
              <div className="flex items-center gap-0.5">
                <PromptInputAction tooltip="Attach file">
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" aria-label="Attach file">
                    <Paperclip className="h-4 w-4" />
                  </button>
                </PromptInputAction>
                <PromptInputAction tooltip="Take photo">
                  <button type="button" onClick={() => cameraInputRef.current?.click()} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" aria-label="Take photo">
                    <Camera className="h-4 w-4" />
                  </button>
                </PromptInputAction>
                <PromptInputAction tooltip={isRecording ? 'Stop recording' : 'Use voice input'}>
                  <button
                    type="button"
                    onClick={isRecording ? handleStopVoice : handleStartVoice}
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-lg transition-colors',
                      isRecording
                        ? 'bg-destructive text-destructive-foreground hover:bg-destructive/80'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                    aria-label={isRecording ? 'Stop recording' : 'Start voice input'}
                  >
                    {isRecording ? <Square className="h-3.5 w-3.5 fill-current" /> : <AudioLines className="h-4 w-4" />}
                  </button>
                </PromptInputAction>
              </div>
              <PromptInputSubmit
                className={isSendDisabled ? 'bg-muted text-muted-foreground hover:bg-muted' : 'bg-foreground text-background hover:opacity-90'}
                disabled={isSendDisabled}
                onStop={status === 'streaming' ? stop : undefined}
                size="icon-sm"
                status={status}
                type="submit"
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

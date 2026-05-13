import { render } from '@testing-library/react'
import type React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ChatPanel } from '@/components/rag/chat-panel'

// ── Mutable mock state so we can change behavior per test ───────────────────

let mockMessages: Array<{
  id: string
  role: string
  parts: Array<{
    type: string
    text?: string
    url?: string
    mediaType?: string
    filename?: string
    reason?: string
  }>
  metadata?: Record<string, unknown>
}> = []
let mockStatus: string = 'idle'
const mockSendMessage = vi.fn()
const mockRegenerate = vi.fn()
const mockStop = vi.fn()

// ── Mock useChat ───────────────────────────────────────────────────────────────

const mockUseChat = vi.fn(() => ({
  messages: mockMessages,
  sendMessage: mockSendMessage,
  status: mockStatus,
  regenerate: mockRegenerate,
  stop: mockStop,
}))

vi.mock('@ai-sdk/react', () => ({
  useChat: (...args: unknown[]) => mockUseChat(...args),
}))

// ── Mock other modules ─────────────────────────────────────────────────────────

vi.mock('@/components/ai-elements/prompt-input', () => ({
  PromptInputProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

vi.mock('@/components/ai-elements/conversation', () => ({
  Conversation: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="conversation">{children}</div>
  ),
  ConversationContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="conversation-content">{children}</div>
  ),
  ConversationScrollButton: () => (
    <button type="button" data-testid="scroll-button">
      Scroll
    </button>
  ),
  ConversationDownload: () => null,
}))

vi.mock('@/components/rag/chat-input-area', () => ({
  default: () => <div data-testid="chat-input">ChatInput</div>,
}))

vi.mock('@/components/ai-elements/message', () => ({
  MessageResponse: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="message-response">{children}</div>
  ),
}))

vi.mock('@/components/rag/product-citation', () => ({
  ProductCitation: ({ product }: { product: { handle: string; title: string } }) => (
    <div data-testid="product-citation">{product.handle}</div>
  ),
}))

vi.mock('@/components/ui/suggestion-button', () => ({
  SuggestionButton: ({ display }: { display: string }) => <button type="button">{display}</button>,
}))

vi.mock('@/components/ui/copy-button', () => ({
  CopyButton: () => <button type="button">Copy</button>,
}))

vi.mock('@/components/ui/collapsible', () => ({
  Collapsible: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CollapsibleContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CollapsibleTrigger: ({ children }: { children: React.ReactNode }) => (
    <button type="button">{children}</button>
  ),
}))

vi.mock('@/hooks/use-time-based-greeting', () => ({
  useTimeBasedGreeting: () => 'Good morning',
}))

vi.mock('sonner', () => ({
  toast: { error: vi.fn() },
}))

vi.mock('next/image', () => ({
  // biome-ignore lint/performance/noImgElement: next/image mock in test environment
  default: (props: React.ComponentProps<'img'> & { priority?: boolean }) => {
    const { alt, src, ...rest } = props
    return <img alt={alt ?? ''} src={src ?? ''} {...rest} />
  },
}))

vi.mock('@/lib/assistant-data', () => ({
  ASSISTANT_EMPTY_DESCRIPTION: 'Ask about vehicles',
  SUGGESTED_QUESTIONS_WITH_ICONS: [
    { text: 'What vehicles do you have?', icon: 'car' },
    { text: 'Show me SUVs', icon: 'truck' },
  ],
}))

// ── Helpers ────────────────────────────────────────────────────────────────────

const renderChatPanel = (props?: { api?: string; showSuggestedQuestions?: boolean }) =>
  render(<ChatPanel {...props} />)

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('ChatPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockMessages = []
    mockStatus = 'idle'
  })

  describe('empty state', () => {
    it('shows greeting and suggested questions when messages is empty and showSuggestedQuestions is true', () => {
      const { getByText } = renderChatPanel({ showSuggestedQuestions: true })
      expect(getByText('Good morning', { exact: false })).toBeTruthy()
      expect(getByText('Ask about vehicles', { exact: false })).toBeTruthy()
      expect(getByText('What vehicles do you have?', { exact: false })).toBeTruthy()
      expect(getByText('Show me SUVs', { exact: false })).toBeTruthy()
    })

    it('does not show greeting when showSuggestedQuestions is false', () => {
      const { queryByText } = renderChatPanel({ showSuggestedQuestions: false })
      expect(queryByText('Good morning', { exact: false })).toBeNull()
    })
  })

  describe('user messages', () => {
    it('renders user message with text content', () => {
      mockMessages = [
        {
          id: 'msg-1',
          role: 'user',
          parts: [{ type: 'text', text: 'Hello there' }],
        },
      ]

      const { getByText } = renderChatPanel()
      expect(getByText('Hello there')).toBeTruthy()
    })

    it('renders user message with image attachments', () => {
      mockMessages = [
        {
          id: 'msg-2',
          role: 'user',
          parts: [
            { type: 'text', text: 'Look at this' },
            {
              type: 'file',
              url: 'blob:image1.png',
              mediaType: 'image/png',
              filename: 'car.png',
            },
          ],
        },
      ]

      const { getByAltText } = renderChatPanel()
      expect(getByAltText('car.png')).toBeTruthy()
    })
  })

  describe('assistant messages', () => {
    it('renders reasoning collapsible when reasoning part present', () => {
      mockMessages = [
        {
          id: 'msg-3',
          role: 'assistant',
          parts: [
            { type: 'reasoning', text: 'Let me think about this...' },
            { type: 'text', text: 'Here is the answer.' },
          ],
          metadata: {},
        },
      ]

      const { getByText } = renderChatPanel()
      expect(getByText('View thinking process')).toBeTruthy()
      expect(getByText('Here is the answer.')).toBeTruthy()
    })

    it('renders assistant text without reasoning', () => {
      mockMessages = [
        {
          id: 'msg-4',
          role: 'assistant',
          parts: [{ type: 'text', text: 'Plain response.' }],
          metadata: {},
        },
      ]

      const { getByText } = renderChatPanel()
      expect(getByText('Plain response.')).toBeTruthy()
    })
  })

  describe('thinking indicator', () => {
    it('shows thinking indicator when status is submitted', () => {
      mockStatus = 'submitted'

      const { getByText } = renderChatPanel()
      expect(getByText('Thinking', { exact: false })).toBeTruthy()
    })

    it('does not show thinking indicator when idle', () => {
      mockStatus = 'idle'

      const { queryByText } = renderChatPanel()
      expect(queryByText('Thinking', { exact: false })).toBeNull()
    })
  })

  describe('follow-up suggestions', () => {
    it('renders follow-up suggestion buttons from metadata', () => {
      mockMessages = [
        {
          id: 'msg-5',
          role: 'assistant',
          parts: [{ type: 'text', text: 'Done.' }],
          metadata: {
            suggestions: ['Show me electric cars', 'What about hybrids?'],
          },
        },
      ]
      mockStatus = 'idle'

      const { getByText } = renderChatPanel()
      expect(getByText('Show me electric cars')).toBeTruthy()
      expect(getByText('What about hybrids?')).toBeTruthy()
    })

    it('does not show suggestions during streaming', () => {
      mockMessages = [
        {
          id: 'msg-6',
          role: 'assistant',
          parts: [{ type: 'text', text: 'Streaming...' }],
          metadata: { suggestions: ['Should not show'] },
        },
      ]
      mockStatus = 'streaming'

      const { queryByText } = renderChatPanel()
      expect(queryByText('Should not show')).toBeNull()
    })
  })
})

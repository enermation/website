import { fireEvent, render } from '@testing-library/react'
import type { UIMessage } from 'ai'
import type React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
  messagesToMarkdown,
} from '@/components/ai-elements/conversation'

// ── Mutable state for mock ────────────────────────────────────────────────────

const scrollState = {
  isAtBottom: true,
  scrollToBottom: vi.fn(),
}

// ── Mock use-stick-to-bottom ──────────────────────────────────────────────────

vi.mock('use-stick-to-bottom', () => {
  const MockContent = ({
    children,
    className,
    ...props
  }: React.PropsWithChildren<{ className?: string; [key: string]: unknown }>) => (
    <div data-testid="stick-to-bottom-content" className={className} {...props}>
      {children}
    </div>
  )

  const MockStickToBottom = ({
    children,
    className,
    ...props
  }: React.PropsWithChildren<{
    className?: string
    role?: string
    initial?: string
    resize?: string
    [key: string]: unknown
  }>) => (
    <div data-testid="stick-to-bottom" className={className} role={props.role as string}>
      {children}
    </div>
  )
  // Static property for ConversationContent subcomponent
  MockStickToBottom.Content = MockContent

  return {
    StickToBottom: MockStickToBottom,
    useStickToBottomContext: () => ({
      isAtBottom: scrollState.isAtBottom,
      scrollToBottom: scrollState.scrollToBottom,
    }),
  }
})

// ── Mock UI components ───────────────────────────────────────────────────────

vi.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    onClick,
    className,
    'data-testid': testId,
    type = 'button',
    variant,
    size,
    ...props
  }: React.PropsWithChildren<
    {
      onClick?: () => void
      className?: string
      'data-testid'?: string
      type?: string
      variant?: string
      size?: string
    } & Record<string, unknown>
  >) => (
    <button data-testid={testId} className={className} onClick={onClick} type={type} {...props}>
      {children}
    </button>
  ),
}))

// ── Fixtures ─────────────────────────────────────────────────────────────────

const mockMessages: UIMessage[] = [
  {
    id: '1',
    role: 'user',
    parts: [{ type: 'text', text: 'Hello there' }],
  },
  {
    id: '2',
    role: 'assistant',
    parts: [{ type: 'text', text: 'Hi, how can I help?' }],
  },
]

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('Conversation', () => {
  it('renders with correct base classes', () => {
    const { getByTestId } = render(<Conversation />)
    const el = getByTestId('stick-to-bottom')
    expect(el.className).toContain('relative')
    expect(el.className).toContain('flex-1')
    expect(el.className).toContain('overflow-y-hidden')
  })

  it('passes role="log" for accessibility', () => {
    const { getByTestId } = render(<Conversation />)
    expect(getByTestId('stick-to-bottom').getAttribute('role')).toBe('log')
  })

  it('applies custom className', () => {
    const { getByTestId } = render(<Conversation className="custom-class" />)
    expect(getByTestId('stick-to-bottom').className).toContain('custom-class')
  })
})

describe('ConversationContent', () => {
  it('renders children', () => {
    const { getByText } = render(
      <ConversationContent>
        <div>Child content</div>
      </ConversationContent>
    )
    expect(getByText('Child content')).toBeTruthy()
  })

  it('has correct CSS classes applied', () => {
    const { getByTestId } = render(<ConversationContent />)
    expect(getByTestId('stick-to-bottom-content').className).toContain('flex')
    expect(getByTestId('stick-to-bottom-content').className).toContain('flex-col')
    expect(getByTestId('stick-to-bottom-content').className).toContain('gap-8')
    expect(getByTestId('stick-to-bottom-content').className).toContain('p-4')
  })
})

describe('ConversationEmptyState', () => {
  it('renders default title and description', () => {
    const { getByText } = render(<ConversationEmptyState />)
    expect(getByText('No messages yet')).toBeTruthy()
    expect(getByText('Start a conversation to see messages here')).toBeTruthy()
  })

  it('renders custom title and description', () => {
    const { getByText } = render(
      <ConversationEmptyState title="Custom Title" description="Custom description text" />
    )
    expect(getByText('Custom Title')).toBeTruthy()
    expect(getByText('Custom description text')).toBeTruthy()
  })

  it('renders icon when provided', () => {
    const { getByTestId } = render(
      <ConversationEmptyState icon={<span data-testid="custom-icon">icon</span>} />
    )
    expect(getByTestId('custom-icon')).toBeTruthy()
  })

  it('renders children when provided', () => {
    const { getByTestId } = render(
      <ConversationEmptyState>
        <div data-testid="custom-child">Custom child content</div>
      </ConversationEmptyState>
    )
    expect(getByTestId('custom-child')).toBeTruthy()
  })

  it('applies custom className', () => {
    const { container } = render(<ConversationEmptyState className="custom-empty-class" />)
    expect(container.firstElementChild?.className).toContain('custom-empty-class')
  })
})

describe('ConversationScrollButton', () => {
  beforeEach(() => {
    scrollState.isAtBottom = true
  })

  it('does not render when at bottom', () => {
    scrollState.isAtBottom = true
    const { queryByTestId } = render(<ConversationScrollButton />)
    expect(queryByTestId('scroll-button')).toBeNull()
  })

  it('renders when not at bottom', () => {
    scrollState.isAtBottom = false
    const { getByRole } = render(<ConversationScrollButton />)
    expect(getByRole('button')).toBeTruthy()
  })

  it('calls scrollToBottom on click', () => {
    scrollState.isAtBottom = false
    const { getByRole } = render(<ConversationScrollButton />)
    fireEvent.click(getByRole('button'))
    expect(scrollState.scrollToBottom).toHaveBeenCalled()
  })

  it('applies custom className', () => {
    scrollState.isAtBottom = false
    const { getByRole } = render(<ConversationScrollButton className="custom-scroll-class" />)
    expect(getByRole('button').className).toContain('custom-scroll-class')
  })
})

describe('messagesToMarkdown', () => {
  it('converts messages to markdown format', () => {
    const result = messagesToMarkdown(mockMessages)
    expect(result).toContain('**User:** Hello there')
    expect(result).toContain('**Assistant:** Hi, how can I help?')
  })

  it('uses custom formatMessage function', () => {
    const customFormat = (msg: UIMessage) =>
      `[${msg.role.toUpperCase()}]: ${msg.parts[0].type === 'text' ? msg.parts[0].text : ''}`
    const result = messagesToMarkdown(mockMessages, customFormat)
    expect(result).toContain('[USER]: Hello there')
    expect(result).toContain('[ASSISTANT]: Hi, how can I help?')
  })

  it('handles empty message array', () => {
    const result = messagesToMarkdown([])
    expect(result).toBe('')
  })
})

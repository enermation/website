export const ASSISTANT_NAME = 'Miles'

export const ASSISTANT_GREETING = 'Ask about our vehicles'

export const ASSISTANT_WIDGET_TITLE = 'Miles'

export const ASSISTANT_EMPTY_DESCRIPTION =
  "Hi, I'm Miles — your Enermation assistant. I can help you find vehicles, prices, and shipping details instantly."

export type SuggestionIcon = 'car' | 'truck' | 'bolt' | 'dollar'

export interface SuggestionQuestion {
  text: string
  icon?: SuggestionIcon
}

export const SUGGESTED_QUESTIONS_WITH_ICONS: SuggestionQuestion[] = [
  { text: 'What vehicles are available under $50,000?', icon: 'dollar' },
  { text: 'Show me luxury SUVs', icon: 'car' },
  { text: 'What electric vehicles do you have?', icon: 'bolt' },
  { text: 'Tell me about trucks with automatic transmission', icon: 'truck' },
]

// Keep for backward compat during transition
export const SUGGESTED_QUESTIONS = SUGGESTED_QUESTIONS_WITH_ICONS.map(q => q.text)

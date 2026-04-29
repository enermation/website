export const ASSISTANT_GREETING = 'Ask about our vehicles'

export const ASSISTANT_WIDGET_TITLE = 'AI Assistant'

export const ASSISTANT_EMPTY_DESCRIPTION =
  'I can help you find the perfect vehicle. Ask me about our inventory, specifications, or pricing.'

export type SuggestionIcon = 'briefcase' | 'users' | 'code' | 'globe'

export interface SuggestionQuestion {
  text: string
  icon?: SuggestionIcon
}

export const SUGGESTED_QUESTIONS_WITH_ICONS: SuggestionQuestion[] = [
  { text: 'What vehicles are available under $50,000?', icon: 'globe' },
  { text: 'Show me luxury SUVs', icon: 'briefcase' },
  { text: 'What electric vehicles do you have?', icon: 'code' },
  { text: 'Tell me about trucks with automatic transmission', icon: 'users' },
]

// Keep for backward compat during transition
export const SUGGESTED_QUESTIONS = SUGGESTED_QUESTIONS_WITH_ICONS.map(q => q.text)

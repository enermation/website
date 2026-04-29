'use client'

import { AssistantCore } from '@/components/assistant/assistant-core'

export interface AssistantThreadProps {
  noNavigation?: boolean
}

export function AssistantThread({ noNavigation: _noNavigation }: AssistantThreadProps) {
  return <AssistantCore />
}

// Re-export as AssistantPageClient for the page component
export { AssistantThread as AssistantPageClient }

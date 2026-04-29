import type { Metadata } from 'next'
import { AssistantPageClient } from '@/components/assistant/assistant-thread'

export const metadata: Metadata = {
  title: 'Assistant — Enermation',
  description: 'Chat with Enermation to find vehicles, parts, and more from our inventory.',
}

export default function AssistantPage() {
  return <AssistantPageClient />
}

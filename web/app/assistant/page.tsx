import type { Metadata } from 'next'
import { AssistantPageClient } from '@/components/assistant/assistant-thread'
import { SiteHeader } from '@/components/site-header'

export const metadata: Metadata = {
  title: 'Assistant — Enermation',
  description: 'Chat with Enermation to find vehicles, parts, and more from our inventory.',
}

export default function AssistantPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 flex-col overflow-hidden">
        <AssistantPageClient />
      </main>
    </>
  )
}

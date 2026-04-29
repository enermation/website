import type { Metadata } from 'next'
import { ChatPanel } from '@/components/rag/chat-panel'
import { SiteHeader } from '@/components/site-header'

export const metadata: Metadata = {
  title: 'Assistant — Enermation',
  description: 'Chat with Enermation to find vehicles, parts, and more from our inventory.',
}

export default function AssistantPage() {
  return (
    <>
      <SiteHeader />
      <main className="fixed inset-0 flex flex-col overflow-hidden">
        <ChatPanel api="/api/rag/chat" />
      </main>
    </>
  )
}

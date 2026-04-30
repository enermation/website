import type { Metadata } from 'next'
import { ChatPanel } from '@/components/rag/chat-panel'
import { SiteHeader } from '@/components/site-header'

export const metadata: Metadata = {
  title: 'Miles — Enermation Assistant',
  description: 'Chat with Miles to find vehicles, prices, and shipping details instantly.',
  openGraph: {
    title: 'Miles — Enermation Assistant',
    description: 'Chat with Miles to find vehicles, prices, and shipping details instantly.',
    images: [
      {
        url: '/miles_logo.png',
        alt: 'Miles AI Assistant by Enermation',
        width: 1200,
        height: 630,
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
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

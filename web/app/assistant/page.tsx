import type { Metadata } from 'next'
import { AssistantShell } from '@/components/rag/assistant-shell'
import { Card, CardContent } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Assistant — Enermation',
  description: 'Chat with Enermation to find vehicles, parts, and more from our inventory.',
}

export default function AssistantPage() {
  return (
    <main className="min-h-full flex flex-col items-center py-section">
      <div className="w-full max-w-site mx-auto px-4">
        <Card className="flex flex-col h-[calc(100vh-8rem)]">
          <CardContent className="flex flex-1 flex-col overflow-hidden p-0">
            <AssistantShell api="/api/rag/chat" />
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

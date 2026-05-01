'use client'

import dynamic from 'next/dynamic'

const ChatWidget = dynamic(() => import('@/components/rag/chat-widget').then(m => m.ChatWidget), {
  ssr: false,
})

export function ChatWidgetMount() {
  return <ChatWidget />
}

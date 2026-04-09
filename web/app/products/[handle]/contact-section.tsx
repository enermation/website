'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { footerContactInfo } from '@/lib/data'

export function ContactSection({ productTitle }: { productTitle: string }) {
  const [message, setMessage] = useState('')

  function handleSend() {
    const subject = encodeURIComponent(`Enquiry: ${productTitle}`)
    const body = encodeURIComponent(
      message || 'Please contact me with more information about this listing.'
    )
    window.location.href = `mailto:${footerContactInfo.email}?subject=${subject}&body=${body}`
  }

  return (
    <div data-slot="contact-section" className="flex flex-col gap-3">
      <Textarea
        placeholder="Ask for more information about this listing..."
        value={message}
        onChange={e => setMessage(e.target.value)}
        rows={4}
        className="rounded-none resize-none"
      />
      <Button
        type="button"
        onClick={handleSend}
        className="bg-brand-green text-white hover:opacity-90 transition-opacity rounded-none"
      >
        Ask a Question
      </Button>
    </div>
  )
}

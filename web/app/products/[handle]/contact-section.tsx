'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { footerContactInfo, productPage } from '@/lib/data'

export function ContactSection({ productTitle }: { productTitle: string }) {
  const [message, setMessage] = useState('')

  function handleSend() {
    const subject = encodeURIComponent(`Enquiry: ${productTitle}`)
    const body = encodeURIComponent(message || productPage.labels.askSellerPlaceholder)
    window.location.href = `mailto:${footerContactInfo.email}?subject=${subject}&body=${body}`
  }

  return (
    <div data-slot="contact-section" className="flex flex-col gap-5">
      <Textarea
        placeholder={productPage.labels.askSellerPlaceholder}
        value={message}
        onChange={e => setMessage(e.target.value)}
        rows={4}
        className="min-h-24 resize-none rounded-none border-gray-90 px-4 py-3 text-15 leading-relaxed text-foreground"
      />
      <Button
        type="button"
        onClick={handleSend}
        className="w-fit rounded-none bg-brand-green px-10 py-3 font-heading text-13 font-semibold uppercase tracking-wide text-white-solid transition-opacity hover:opacity-90"
      >
        {productPage.labels.askQuestionCta}
      </Button>
    </div>
  )
}

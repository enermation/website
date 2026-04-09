"use client"

import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { footerContactInfo } from "@/lib/data"

export function ContactSection({ productTitle }: { productTitle: string }) {
  const [message, setMessage] = useState("")

  function handleSend() {
    const subject = encodeURIComponent(`Enquiry: ${productTitle}`)
    const body = encodeURIComponent(
      message || "Please contact me with more information about this car."
    )
    window.location.href = `mailto:${footerContactInfo.email}?subject=${subject}&body=${body}`
  }

  return (
    <div data-slot="contact-section" className="flex flex-col gap-3">
      <Textarea
        placeholder="Ask for more information about this car..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={4}
        className="rounded-none resize-none"
      />
      <button
        type="button"
        onClick={handleSend}
        className="w-full font-montserrat font-semibold text-13 uppercase tracking-wider bg-brand-green text-white px-6 py-3 hover:opacity-90 transition-opacity"
      >
        Ask a Question
      </button>
    </div>
  )
}

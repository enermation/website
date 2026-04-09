"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { footerContactInfo } from "@/lib/data"

export function EnquiryForm({ productTitle }: { productTitle: string }) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [message, setMessage] = useState(
    `Please contact me regarding ${productTitle}`
  )

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\n\n${message}`
    )
    const subject = encodeURIComponent(`Enquiry: ${productTitle}`)
    window.location.href = `mailto:${footerContactInfo.email}?subject=${subject}&body=${body}`
  }

  return (
    <form
      data-slot="enquiry-form"
      onSubmit={handleSubmit}
      className="flex flex-col gap-3"
    >
      <Input
        type="text"
        placeholder="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        className="rounded-none h-10"
      />
      <Input
        type="email"
        placeholder="Your email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="rounded-none h-10"
      />
      <Input
        type="tel"
        placeholder="Phone number (optional)"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="rounded-none h-10"
      />
      <Textarea
        placeholder="Your message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={4}
        className="rounded-none resize-none"
      />
      <Button
        type="submit"
        className="bg-brand-green text-white hover:opacity-90 transition-opacity rounded-none"
      >
        Send Message
      </Button>
    </form>
  )
}


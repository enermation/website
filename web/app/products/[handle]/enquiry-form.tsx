'use client'

import { mdiAccount, mdiChevronDown, mdiPhone } from '@mdi/js'
import { Icon } from '@mdi/react'
import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { dealerInfo, footerContactInfo, productPage } from '@/lib/data'

type EnquiryFormProps = {
  productTitle: string
  sellerName: string
  showroomHref: string
  listingCountLabel: string
}

export function EnquiryForm({
  productTitle,
  sellerName,
  showroomHref,
  listingCountLabel,
}: EnquiryFormProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState(
    `${productPage.labels.enquiryMessagePrefix} ${productTitle}`
  )
  const [notifySimilar, setNotifySimilar] = useState(true)
  const [agreeToTerms, setAgreeToTerms] = useState(true)
  const notifyCheckboxId = 'notify-similar'
  const termsCheckboxId = 'agree-to-terms'

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\nPhone: ${productPage.labels.countryCode} ${phone}\nNotify me: ${
        notifySimilar ? 'Yes' : 'No'
      }\nAgree to terms: ${agreeToTerms ? 'Yes' : 'No'}\n\n${message}`
    )
    const subject = encodeURIComponent(`Enquiry: ${productTitle}`)
    window.location.href = `mailto:${footerContactInfo.email}?subject=${subject}&body=${body}`
  }

  return (
    <form data-slot="enquiry-form" onSubmit={handleSubmit} className="border border-gray-90">
      <div className="flex items-start gap-5 border-b border-gray-90 p-6">
        <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-gray-98">
          <Icon path={mdiAccount} size={1} className="size-7 text-gray-33" />
        </div>
        <div className="flex flex-col gap-1">
          <p className="font-body text-15 font-medium text-foreground">{sellerName}</p>
          <p className="font-body text-13 text-gray-33">{dealerInfo.memberSinceLabel}</p>
          <a
            href={`tel:${footerContactInfo.phone.replace(/\s/g, '')}`}
            className="mt-2 inline-flex items-center gap-1.5 font-body text-13 text-brand-green transition-opacity hover:opacity-80"
          >
            <Icon path={mdiPhone} size={1} className="size-4" />
            {productPage.labels.callAgent}
          </a>
        </div>
      </div>

      <div className="flex flex-col gap-4 p-6">
        <Input
          type="text"
          placeholder={productPage.labels.yourName}
          value={name}
          onChange={event => setName(event.target.value)}
          required
          className="h-12 rounded-none border-gray-90"
        />

        <Input
          type="email"
          placeholder={productPage.labels.yourEmail}
          value={email}
          onChange={event => setEmail(event.target.value)}
          required
          className="h-12 rounded-none border-gray-90"
        />

        <div className="flex items-stretch">
          <div className="flex w-20 items-center justify-between border border-gray-90 px-3">
            <span className="font-body text-13 text-foreground">
              {productPage.labels.countryCode}
            </span>
            <Icon path={mdiChevronDown} size={1} className="size-3.5 text-gray-33" />
          </div>
          <Input
            type="tel"
            placeholder={productPage.labels.phoneOptional}
            value={phone}
            onChange={event => setPhone(event.target.value)}
            className="h-12 flex-1 rounded-none border-l-0 border-gray-90"
          />
        </div>

        <div className="flex flex-col gap-2">
          <p className="font-body text-13 text-gray-33">{productPage.labels.yourMessage}</p>
          <Textarea
            value={message}
            onChange={event => setMessage(event.target.value)}
            rows={4}
            className="min-h-24 resize-none rounded-none border-gray-90 px-4 py-3 text-15 leading-relaxed text-foreground"
          />
        </div>

        <Button
          type="submit"
          className="h-11 rounded-none bg-brand-green font-heading text-13 font-semibold uppercase tracking-wide text-white-solid transition-opacity hover:opacity-90"
        >
          {productPage.labels.sendMessage}
        </Button>

        <label htmlFor={notifyCheckboxId} className="flex items-start gap-3 pt-1">
          <Checkbox
            id={notifyCheckboxId}
            checked={notifySimilar}
            onCheckedChange={checked => setNotifySimilar(checked === true)}
            className="mt-0.5 border-gray-33 data-checked:border-gray-7 data-checked:bg-gray-7"
          />
          <span className="font-body text-13 leading-relaxed text-gray-33">
            {productPage.labels.notifySimilar}
          </span>
        </label>

        <label htmlFor={termsCheckboxId} className="flex items-start gap-3">
          <Checkbox
            id={termsCheckboxId}
            checked={agreeToTerms}
            onCheckedChange={checked => setAgreeToTerms(checked === true)}
            className="mt-0.5 border-gray-33 data-checked:border-gray-7 data-checked:bg-gray-7"
          />
          <span className="font-body text-13 leading-relaxed text-gray-33">
            {productPage.labels.agreePrefix}{' '}
            <a href={productPage.links.termsOfUse} className="underline">
              {productPage.labels.termsOfUse}
            </a>{' '}
            {productPage.labels.agreeMiddle}{' '}
            <a href={productPage.links.privacyPolicy} className="underline">
              {productPage.labels.privacyPolicy}
            </a>
            , {productPage.labels.agreeSuffix}
          </span>
        </label>
      </div>

      <div className="border-t border-gray-90 p-6">
        <Link
          href={showroomHref}
          className="font-body text-15 font-medium text-foreground transition-colors hover:text-brand-green"
        >
          {sellerName}
        </Link>
        <p className="mt-1 font-body text-13 text-gray-33">{listingCountLabel}</p>
      </div>
    </form>
  )
}

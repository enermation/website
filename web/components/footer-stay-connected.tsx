'use client'

import { useGSAP } from '@gsap/react'
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import gsap from 'gsap'
import { useActionState, useCallback, useEffect, useRef, useState } from 'react'

import { subscribeEmail } from '@/app/actions/subscribe'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

gsap.registerPlugin(useGSAP)

type FormState = 'idle' | 'loading' | 'success' | 'error'

interface FooterStayConnectedProps {
  content: {
    eyebrow: string
    description: string
    inputPlaceholder: string
    actionLabel: string
  }
  className?: string
}

export function FooterStayConnected({ content, className }: FooterStayConnectedProps) {
  const [state, formAction] = useActionState(subscribeEmail, {
    success: false,
    message: '',
  })
  const [formState, setFormState] = useState<FormState>('idle')
  const [email, setEmail] = useState('')

  const buttonLabelRef = useRef<HTMLSpanElement>(null)
  const arrowRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (!arrowRef.current) return
      const el = arrowRef.current
      el.addEventListener('mouseenter', () => {
        gsap.to(el, { x: 4, duration: 0.2, ease: 'power2.out' })
      })
      el.addEventListener('mouseleave', () => {
        gsap.to(el, { x: 0, duration: 0.2, ease: 'power2.out' })
      })
    },
    { scope: arrowRef }
  )

  const animateLabel = useCallback((incoming: string | null) => {
    if (!buttonLabelRef.current) return
    const _tl = gsap
      .timeline()
      .to(buttonLabelRef.current, {
        y: -20,
        opacity: 0,
        duration: 0.15,
        ease: 'power2.in',
      })
      .call(() => {
        if (buttonLabelRef.current) {
          buttonLabelRef.current.textContent = incoming
        }
      })
      .to(buttonLabelRef.current, {
        y: 0,
        opacity: 1,
        duration: 0.2,
        ease: 'power2.out',
      })
  }, [])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (formState !== 'idle') return
    setFormState('loading')
    animateLabel('Sending...')
    const formData = new FormData()
    formData.append('email', email)
    formAction(formData)
  }

  useEffect(() => {
    if (formState === 'idle') return

    if (state.success) {
      setFormState('success')
      animateLabel('Subscribed!')
    } else if (state.message) {
      setFormState('error')
      animateLabel(state.message === 'invalid email' ? 'Invalid Email' : 'Try Again')
    }

    const timer = setTimeout(() => {
      setFormState('idle')
      setEmail('')
      animateLabel(content.actionLabel)
    }, 2500)

    return () => clearTimeout(timer)
  }, [state, formState, animateLabel, content.actionLabel])

  const isDisabled = formState !== 'idle'
  const buttonColor =
    formState === 'success'
      ? 'text-brand-green'
      : formState === 'error'
        ? 'text-brand-red'
        : isDisabled || !email
          ? 'text-on-dark-muted'
          : 'text-on-dark hover:text-on-dark'

  return (
    <div data-slot="footer-stay-connected" className={cn('flex-col gap-6', className)}>
      <div className="flex max-w-sm flex-col gap-4">
        <p className="text-sm font-semibold leading-relaxed text-on-dark">{content.description}</p>
      </div>

      <form onSubmit={handleSubmit} className="flex max-w-sm flex-col gap-1">
        <Input
          type="email"
          placeholder={content.inputPlaceholder}
          aria-label={content.inputPlaceholder}
          required
          value={email}
          onChange={e => {
            setEmail(e.target.value)
            if (formState === 'error') setFormState('idle')
          }}
          disabled={isDisabled}
          className="h-auto rounded-none border-0 border-b border-white-30 bg-transparent px-0 py-1 text-lg font-semibold text-on-dark placeholder:text-on-dark-muted focus-visible:border-white focus-visible:ring-0 dark:bg-transparent"
        />

        <button
          type="submit"
          disabled={isDisabled || !email}
          className={cn(
            'ml-px inline-flex w-fit translate-y-1 items-center gap-1.5 font-heading text-xl font-semibold uppercase tracking-tight transition-colors',
            buttonColor
          )}
        >
          <span ref={buttonLabelRef}>{content.actionLabel}</span>
          <span ref={arrowRef}>
            <ArrowRightIcon className="size-5" />
          </span>
        </button>
      </form>
    </div>
  )
}

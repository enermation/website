'use client'

import { Check, Clipboard } from 'lucide-react'
import { useCallback, useState } from 'react'
import { Button } from '@/components/ui/button'
import { stripMarkdown } from '@/lib/utils'

interface CopyButtonProps {
  content: string
  htmlContent?: string
  copyMessage?: string
}

export function CopyButton({ content, htmlContent, copyMessage = 'Copied!' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    const plainText = stripMarkdown(content)

    try {
      if (htmlContent && typeof ClipboardItem !== 'undefined') {
        const htmlBlob = new Blob([htmlContent], { type: 'text/html' })
        const plainBlob = new Blob([plainText], { type: 'text/plain' })
        await navigator.clipboard.write([
          new ClipboardItem({
            'text/html': htmlBlob,
            'text/plain': plainBlob,
          }),
        ])
      } else {
        await navigator.clipboard.writeText(plainText)
      }
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      await navigator.clipboard.writeText(plainText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [content, htmlContent])

  return (
    <Button
      className="size-8 rounded-full p-0"
      onClick={handleCopy}
      size="icon"
      type="button"
      variant="ghost"
    >
      {copied ? (
        <Check className="size-4 text-green-500" />
      ) : (
        <Clipboard className="size-4" />
      )}
      <span className="sr-only">{copied ? copyMessage : 'Copy response'}</span>
    </Button>
  )
}

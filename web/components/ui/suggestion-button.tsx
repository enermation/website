'use client'

import {
  BriefcaseIcon,
  CodeBracketIcon,
  GlobeAltIcon,
  UsersIcon,
} from '@heroicons/react/24/outline'
import type { ComponentProps, FC } from 'react'
import type { SuggestionIcon as SuggestionIconType } from '@/lib/assistant-data'
import { cn } from '@/lib/utils'

interface SuggestionButtonProps {
  display: string
  prompt: string
  sendMessage: (message: { text: string }) => void
  icon?: SuggestionIconType
  className?: string
}

const iconMap: Record<SuggestionIconType, FC<{ className?: string }>> = {
  briefcase: BriefcaseIcon,
  users: UsersIcon,
  code: CodeBracketIcon,
  globe: GlobeAltIcon,
}

export function SuggestionButton({
  display,
  prompt,
  sendMessage,
  icon,
  className,
}: SuggestionButtonProps) {
  const IconComponent = icon ? iconMap[icon] : undefined

  const handleClick = () => {
    sendMessage({ text: prompt })
  }

  return (
    <button
      className={cn(
        'flex h-auto items-start justify-start gap-3 rounded-xl border border-border bg-card p-4 text-left text-sm text-foreground transition-all duration-300 ease-[cubic-bezier(0.165,0.85,0.45,1)] hover:shadow-md active:scale-[0.98]',
        className
      )}
      onClick={handleClick}
      type="button"
    >
      {IconComponent && <IconComponent className="size-5 shrink-0 text-muted-foreground" />}
      <span className="flex-1">{display}</span>
    </button>
  )
}

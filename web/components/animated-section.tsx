import { cn } from '@/lib/utils'

type AnimatedSectionProps = {
  children: React.ReactNode
  className?: string
}

export function AnimatedSection({ children, className }: AnimatedSectionProps) {
  return <div className={cn(className)}>{children}</div>
}

export function InstagramGrid({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>
}

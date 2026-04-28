import { Icon } from '@mdi/react'
import { mdiLoading } from '@mdi/js'
import { cn } from '@/lib/utils'

function Spinner({ className }: { className?: string }) {
  return (
    <Icon path={mdiLoading} size={1} className={cn('size-4 animate-spin', className)} />
  )
}

export { Spinner }

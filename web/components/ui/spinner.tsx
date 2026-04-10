import { Icon } from '@mdi/react'
import { mdiLoading } from '@mdi/js'
import { cn } from '@/lib/utils'

function Spinner({ className, ...props }: React.ComponentProps<'svg'>) {
  return (
    <Icon
      role="status"
      aria-label="Loading"
      path={mdiLoading}
      size={1}
      className={cn('size-4 animate-spin', className)}
      {...props}
    />
  )
}

export { Spinner }

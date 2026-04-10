'use client'

import { Icon } from '@mdi/react'
import {
  mdiCheckCircle,
  mdiInformation,
  mdiLoading,
  mdiCloseCircle,
  mdiAlert,
} from '@mdi/js'
import { useTheme } from 'next-themes'
import { Toaster as Sonner, type ToasterProps } from 'sonner'

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      icons={{
        success: <Icon path={mdiCheckCircle} size={1} className="size-4" />,
        info: <Icon path={mdiInformation} size={1} className="size-4" />,
        warning: <Icon path={mdiAlert} size={1} className="size-4" />,
        error: <Icon path={mdiCloseCircle} size={1} className="size-4" />,
        loading: <Icon path={mdiLoading} size={1} className="size-4 animate-spin" />,
      }}
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
          '--border-radius': 'var(--radius)',
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: 'cn-toast',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }

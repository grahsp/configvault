import type { CSSProperties } from 'react'
import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from 'lucide-react'
import { Toaster as Sonner, type ToasterProps } from 'sonner'

const toastTypeClassNames = {
  success:
    'bg-[linear-gradient(90deg,var(--color-success-soft),var(--normal-bg)_42%)] [&_[data-icon]]:text-[var(--color-success)]',
  error:
    'bg-[linear-gradient(90deg,var(--color-danger-soft),var(--normal-bg)_42%)] [&_[data-icon]]:text-[var(--color-danger)]',
  warning:
    'bg-[linear-gradient(90deg,var(--color-warning-soft),var(--normal-bg)_42%)] [&_[data-icon]]:text-[var(--color-warning)]',
  info:
    'bg-[linear-gradient(90deg,var(--color-primary-soft),var(--normal-bg)_42%)] [&_[data-icon]]:text-[var(--color-primary)]',
}

const iconStrokeWidth = 2.5

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      theme="system"
      icons={{
        success: (
          <CircleCheckIcon className="size-5" strokeWidth={iconStrokeWidth} />
        ),
        info: (
          <InfoIcon className="size-5" strokeWidth={iconStrokeWidth} />
        ),
        warning: (
          <TriangleAlertIcon className="size-5" strokeWidth={iconStrokeWidth} />
        ),
        error: (
          <OctagonXIcon className="size-5" strokeWidth={iconStrokeWidth} />
        ),
        loading: (
          <Loader2Icon className="size-5 animate-spin" strokeWidth={iconStrokeWidth} />
        ),
      }}
      style={
        {
          '--width': 'min(24rem, calc(100vw - var(--space-8)))',
          '--normal-bg': 'hsl(var(--popover))',
          '--normal-text': 'hsl(var(--popover-foreground))',
          '--normal-border': 'hsl(var(--border))',
          '--border-radius': 'var(--radius-md)',
        } as CSSProperties
      }
      toastOptions={{
        classNames: {
          toast:
            'cn-toast !p-[var(--space-4)] !text-[var(--font-size-body-md)] shadow-[var(--shadow-panel-soft)]',
          icon: '!h-5 !w-5',
          ...toastTypeClassNames,
        },
      }}
      {...props}
    />
  )
}

export { Toaster }

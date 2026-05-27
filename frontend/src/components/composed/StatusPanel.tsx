import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils.ts'

export type StatusPanelProps = Omit<HTMLAttributes<HTMLDivElement>, 'role'> & {
  actions?: ReactNode
  children?: ReactNode
  role?: 'status' | 'alert'
  title: string
  tone?: 'default' | 'error'
}

export function StatusPanel({
  actions,
  children,
  className,
  role,
  title,
  tone = 'default',
  ...props
}: StatusPanelProps) {
  return (
    <div
      className={cn(
        'grid min-h-[var(--panel-min-height)] content-center justify-items-start gap-3 rounded-[var(--radius-md)] border border-dashed border-[color:var(--color-border-strong)] bg-[color:var(--color-surface-muted)] p-6',
        tone === 'error' &&
          'border-[color:var(--color-border-danger)] bg-[color:var(--color-surface-danger)]',
        className,
      )}
      data-slot="status-panel"
      data-tone={tone}
      role={role}
      {...props}
    >
      <p className="m-0 text-lg font-semibold leading-tight text-[color:var(--color-text-strong)]">
        {title}
      </p>
      {children ? (
        <div className="grid gap-2 leading-normal text-[color:var(--color-text-body)] [&>*]:m-0">
          {children}
        </div>
      ) : null}
      {actions ? (
        <div className="flex flex-wrap gap-3 max-sm:w-full max-sm:flex-col max-sm:[&>*]:w-full">
          {actions}
        </div>
      ) : null}
    </div>
  )
}

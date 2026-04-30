import type { HTMLAttributes, ReactNode } from 'react'
import { cx } from '../utils/cx'
import styles from './StatePanel.module.css'

export interface StatePanelProps extends HTMLAttributes<HTMLDivElement> {
  actions?: ReactNode
  children?: ReactNode
  role?: 'status' | 'alert'
  title: string
  tone?: 'default' | 'error'
}

export function StatePanel({
  actions,
  children,
  className,
  role,
  title,
  tone = 'default',
  ...props
}: StatePanelProps) {
  return (
    <div
      className={cx(styles.panel, tone === 'error' && styles.error, className)}
      role={role}
      {...props}
    >
      <p className={styles.title}>{title}</p>
      {children ? <div className={styles.content}>{children}</div> : null}
      {actions ? <div className={styles.actions}>{actions}</div> : null}
    </div>
  )
}

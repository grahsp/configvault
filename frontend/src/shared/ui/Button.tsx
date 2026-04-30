import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cx } from '../utils/cx'
import styles from './Button.module.css'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant: 'primary' | 'secondary' | 'danger'
}

export function Button({
  children,
  className,
  variant,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cx(styles.button, styles[variant], className)}
      {...props}
    >
      {children}
    </button>
  )
}

import type { HTMLAttributes, ReactNode } from 'react'
import { useId } from 'react'
import { cx } from '../utils/cx'
import styles from './Modal.module.css'

export interface ModalProps extends HTMLAttributes<HTMLDivElement> {
  actions?: ReactNode
  children: ReactNode
  description?: ReactNode
  headerAction?: ReactNode
  size?: 'sm' | 'md'
  title: string
}

export function Modal({
  actions,
  children,
  className,
  description,
  headerAction,
  size = 'md',
  title,
  ...props
}: ModalProps) {
  const titleId = useId()
  const descriptionId = useId()

  return (
    <div className={styles.backdrop} role="presentation">
      <div
        aria-describedby={description ? descriptionId : undefined}
        aria-labelledby={titleId}
        aria-modal="true"
        className={cx(styles.dialog, styles[size], className)}
        role="dialog"
        {...props}
      >
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <h2 className={styles.title} id={titleId}>
              {title}
            </h2>
            {description ? (
              <div className={styles.description} id={descriptionId}>
                {description}
              </div>
            ) : null}
          </div>
          {headerAction}
        </div>

        <div className={styles.body}>{children}</div>

        {actions ? <div className={styles.footer}>{actions}</div> : null}
      </div>
    </div>
  )
}

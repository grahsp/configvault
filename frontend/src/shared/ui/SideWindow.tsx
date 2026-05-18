import type { HTMLAttributes, ReactNode } from 'react'
import { useEffect, useId } from 'react'
import { cx } from '../utils/cx'
import styles from './SideWindow.module.css'

export interface SideWindowProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onClose'> {
  bodyClassName?: string
  children: ReactNode
  description?: ReactNode
  headerClassName?: string
  headerAction?: ReactNode
  onClose: () => void
  title: string
}

export function SideWindow({
  bodyClassName,
  children,
  className,
  description,
  headerClassName,
  headerAction,
  onClose,
  title,
  ...props
}: SideWindowProps) {
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [onClose])

  return (
    <div
      className={styles.backdrop}
      onClick={onClose}
      role="presentation"
    >
      <div
        aria-describedby={description ? descriptionId : undefined}
        aria-labelledby={titleId}
        aria-modal="true"
        className={cx(styles.panel, className)}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        {...props}
      >
        <div
          className={cx(
            styles.header,
            headerClassName,
            !description ? styles.headerCompact : undefined,
          )}
        >
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

        <div className={cx(styles.body, bodyClassName)}>{children}</div>
      </div>
    </div>
  )
}

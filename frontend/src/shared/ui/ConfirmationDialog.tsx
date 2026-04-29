import {cx} from '../utils/cx.ts'
import styles from '../../features/environments/ui/EnvironmentDropdown/EnvironmentDropdown.module.css'
import type {ReactNode} from "react";

export interface ConfirmationDialogProps {
  cancelLabel?: string
  confirmLabel: string
  errorMessage?: string
  isPending: boolean
  onCancel: () => void
  onConfirm: () => void
  pendingConfirmLabel?: string
  title: string
  children: ReactNode
}

export function ConfirmationDialog({
  cancelLabel = 'Cancel',
  confirmLabel,
  errorMessage,
  isPending,
  onCancel,
  onConfirm,
  pendingConfirmLabel,
  title,
  children,
}: ConfirmationDialogProps) {
  const titleId = `${title.replace(/\s+/g, '-').toLocaleLowerCase()}-title`

  return (
    <div className={styles.modalBackdrop} role="presentation">
      <div
        aria-labelledby={titleId}
        aria-modal="true"
        className={cx(styles.modal, styles.modalCompact)}
        role="dialog"
      >
        <h2 id={titleId}>{title}</h2>
        {children}

        {errorMessage ? (
          <p className={styles.createError} role="alert">
            {errorMessage}
          </p>
        ) : null}

        <div className={styles.modalActions}>
          <button
            className={cx(styles.modalButton, styles.modalButtonSecondary)}
            disabled={isPending}
            onClick={onCancel}
            type="button"
          >
            {cancelLabel}
          </button>
          <button
            className={cx(styles.modalButton, styles.modalButtonDanger)}
            disabled={isPending}
            onClick={onConfirm}
            type="button"
          >
            {isPending ? pendingConfirmLabel ?? confirmLabel : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

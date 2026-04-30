import type { ReactNode } from 'react'
import { Button } from './Button'
import { Modal } from './Modal'

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
  return (
    <Modal
      actions={
        <>
          <Button
            disabled={isPending}
            onClick={onCancel}
            type="button"
            variant="secondary"
          >
            {cancelLabel}
          </Button>
          <Button
            disabled={isPending}
            onClick={onConfirm}
            type="button"
            variant="danger"
          >
            {isPending ? pendingConfirmLabel ?? confirmLabel : confirmLabel}
          </Button>
        </>
      }
      size="sm"
      title={title}
    >
      <>
        {children}

        {errorMessage ? (
          <p role="alert">
            {errorMessage}
          </p>
        ) : null}
      </>
    </Modal>
  )
}

import { ConfirmationDialog } from '../../../../shared/ui/ConfirmationDialog'
import styles from '../../pages/ProjectDetailPage/ProjectDetailPage.module.css'

interface RemoveMemberDialogProps {
  displayName: string
  errorMessage: string
  isPending: boolean
  onCancel: () => void
  onConfirm: () => void
}

export function RemoveMemberDialog({
  displayName,
  errorMessage,
  isPending,
  onCancel,
  onConfirm,
}: RemoveMemberDialogProps) {
  return (
    <ConfirmationDialog
      confirmLabel="Remove"
      errorMessage={errorMessage}
      isPending={isPending}
      onCancel={onCancel}
      onConfirm={onConfirm}
      pendingConfirmLabel="Removing"
      title="Remove member"
    >
      <p className={styles.modalCopy}>
        Remove this member from the project?
      </p>
      <p className={styles.modalCopy}>{displayName} will lose access.</p>
    </ConfirmationDialog>
  )
}

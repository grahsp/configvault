import { ConfirmationDialog } from '../../../../shared/ui/ConfirmationDialog'
import styles from '../../pages/ProjectDetailPage/ProjectDetailPage.module.css'

interface RevokeInvitationDialogProps {
  createdByName: string
  errorMessage: string
  expiresAt: string
  isPending: boolean
  onCancel: () => void
  onConfirm: () => void
}

export function RevokeInvitationDialog({
  createdByName,
  errorMessage,
  expiresAt,
  isPending,
  onCancel,
  onConfirm,
}: RevokeInvitationDialogProps) {
  return (
    <ConfirmationDialog
      confirmLabel="Revoke"
      errorMessage={errorMessage}
      isPending={isPending}
      onCancel={onCancel}
      onConfirm={onConfirm}
      pendingConfirmLabel="Revoking"
      title="Revoke invitation link"
    >
      <p className={styles.modalCopy}>Revoke this invitation link?</p>
      <p className={styles.modalCopy}>
        Created by {createdByName}. It currently expires {expiresAt}.
      </p>
    </ConfirmationDialog>
  )
}

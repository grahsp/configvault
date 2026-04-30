import { ConfirmationDialog } from '../../../../../shared/ui/ConfirmationDialog.tsx'
import type { Environment } from '../../model'
import styles from './EnvironmentDropdown.module.css'

export interface EnvironmentDeleteDialogProps {
  deleteError: string
  environment: Environment
  isPending: boolean
  onCancel: () => void
  onConfirm: () => void
}

export function DeleteEnvironmentDialog({
  deleteError,
  environment,
  isPending,
  onCancel,
  onConfirm,
}: EnvironmentDeleteDialogProps) {
  return (
    <ConfirmationDialog
      confirmLabel="Delete"
      errorMessage={deleteError}
      isPending={isPending}
      onCancel={onCancel}
      onConfirm={onConfirm}
      pendingConfirmLabel="Deleting"
      title="Delete environment"
    >
      <p className={styles.modalCopy}>Delete this environment from the project?</p>
      <p className={styles.modalCopy}>
        {environment.environmentName} and its associated configuration values
        will be removed.
      </p>
    </ConfirmationDialog>
  )
}

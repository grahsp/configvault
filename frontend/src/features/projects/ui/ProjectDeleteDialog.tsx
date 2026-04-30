import type { UseMutationResult } from '@tanstack/react-query'
import { ConfirmationDialog } from '../../../shared/ui/ConfirmationDialog'
import { getErrorMessage } from '../domain'
import styles from './ProjectDeleteDialog.module.css'

interface ProjectDeleteDialogProps {
  mutation: UseMutationResult<void, Error, string>
  onCancel: () => void
  onConfirm: () => void
  projectName: string
}

export function ProjectDeleteDialog({
  mutation,
  onCancel,
  onConfirm,
  projectName,
}: ProjectDeleteDialogProps) {
  return (
    <ConfirmationDialog
      confirmLabel="Delete"
      errorMessage={
        mutation.isError
          ? getErrorMessage(
              mutation.error,
              'Something went wrong while loading projects.',
            )
          : undefined
      }
      isPending={mutation.isPending}
      onCancel={onCancel}
      onConfirm={onConfirm}
      pendingConfirmLabel="Deleting"
      title="Delete project"
    >
      <p className={styles.modalCopy}>
        Delete {projectName}? This cannot be undone.
      </p>
    </ConfirmationDialog>
  )
}

import type { UseMutationResult } from '@tanstack/react-query'
import { cx, getErrorMessage } from '../pages/projectPageUtils'
import styles from './ProjectDeleteDialog.module.css'

interface ProjectDeleteDialogProps {
  errorClassName?: string
  formActionsClassName?: string
  mutation: UseMutationResult<void, Error, string>
  onCancel: () => void
  onConfirm: () => void
  projectName: string
}

export function ProjectDeleteDialog({
  errorClassName = styles.projectFormError,
  formActionsClassName = styles.projectFormActions,
  mutation,
  onCancel,
  onConfirm,
  projectName,
}: ProjectDeleteDialogProps) {
  return (
    <div className={styles.modalBackdrop} role="presentation">
      <div
        aria-labelledby="delete-project-title"
        aria-modal="true"
        className={cx(styles.modal, styles.modalCompact)}
        role="dialog"
      >
        <h2 id="delete-project-title">Delete project</h2>
        <p className={styles.modalCopy}>
          Delete {projectName}? This cannot be undone.
        </p>

        {mutation.isError ? (
          <p className={errorClassName} role="alert">
            {getErrorMessage(
              mutation.error,
              'Something went wrong while loading projects.',
            )}
          </p>
        ) : null}

        <div className={formActionsClassName}>
          <button
            className={cx(styles.button, styles.buttonSecondary)}
            disabled={mutation.isPending}
            onClick={onCancel}
            type="button"
          >
            Cancel
          </button>
          <button
            className={cx(styles.button, styles.buttonDanger)}
            disabled={mutation.isPending}
            onClick={onConfirm}
            type="button"
          >
            {mutation.isPending ? 'Deleting' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../../../components/ui/alert-dialog.tsx'
import { Button } from '../../../../../components/ui/button.tsx'
import type { Environment } from '../../domain'
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
    <AlertDialog
      open
      onOpenChange={(open) => {
        if (!open && !isPending) {
          onCancel()
        }
      }}
    >
      <AlertDialogContent onMouseDown={(event) => event.stopPropagation()}>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete environment</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div>
              <p className={styles.modalCopy}>
                Delete this environment from the project?
              </p>
              <p className={styles.modalCopy}>
                {environment.environmentName} and its associated configuration
                values will be removed.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        {deleteError ? <p role="alert">{deleteError}</p> : null}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <Button
            disabled={isPending}
            onClick={onConfirm}
            type="button"
            variant="destructive"
          >
            {isPending ? 'Deleting' : 'Delete'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

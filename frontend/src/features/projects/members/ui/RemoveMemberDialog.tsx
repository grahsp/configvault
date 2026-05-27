import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../../components/ui/alert-dialog'
import { Button } from '../../../../components/ui/button'
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
    <AlertDialog
      open
      onOpenChange={(open) => {
        if (!open && !isPending) {
          onCancel()
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove member</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div>
              <p className={styles.modalCopy}>
                Remove this member from the project?
              </p>
              <p className={styles.modalCopy}>{displayName} will lose access.</p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        {errorMessage ? <p role="alert">{errorMessage}</p> : null}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <Button
            disabled={isPending}
            onClick={onConfirm}
            type="button"
            variant="destructive"
          >
            {isPending ? 'Removing' : 'Remove'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

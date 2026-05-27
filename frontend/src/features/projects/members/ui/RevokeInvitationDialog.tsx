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
          <AlertDialogTitle>Revoke invitation link</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div>
              <p className={styles.modalCopy}>Revoke this invitation link?</p>
              <p className={styles.modalCopy}>
                Created by {createdByName}. It currently expires {expiresAt}.
              </p>
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
            {isPending ? 'Revoking' : 'Revoke'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

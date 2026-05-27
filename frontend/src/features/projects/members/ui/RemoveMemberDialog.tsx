import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'

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
            <div className="flex flex-col gap-2 text-sm leading-6 text-muted-foreground">
              <p className="m-0">
                Remove this member from the project?
              </p>
              <p className="m-0">{displayName} will lose access.</p>
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

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog.tsx'
import { Button } from '@/components/ui/button.tsx'
import type { Environment } from '../../domain'

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
            <div className="flex flex-col gap-2 text-sm leading-6 text-muted-foreground">
              <p className="m-0">
                Delete this environment from the project?
              </p>
              <p className="m-0">
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

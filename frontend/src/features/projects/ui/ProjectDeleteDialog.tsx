import type { UseMutationResult } from '@tanstack/react-query'
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
import { getErrorMessage } from '../domain'

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
  const errorMessage = mutation.isError
    ? getErrorMessage(
        mutation.error,
        'Something went wrong while loading projects.',
      )
    : undefined

  return (
    <AlertDialog
      open
      onOpenChange={(open) => {
        if (!open && !mutation.isPending) {
          onCancel()
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete project</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <p className="m-0 text-sm leading-6 text-muted-foreground">
              Delete {projectName}? This cannot be undone.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>

        {errorMessage ? <p role="alert">{errorMessage}</p> : null}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={mutation.isPending}>
            Cancel
          </AlertDialogCancel>
          <Button
            disabled={mutation.isPending}
            onClick={onConfirm}
            type="button"
            variant="destructive"
          >
            {mutation.isPending ? 'Deleting' : 'Delete'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

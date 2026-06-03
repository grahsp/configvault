import { Button } from '@/components/ui/button.tsx'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog.tsx'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet.tsx'
import { StatusPanel } from '@/components/composed'
import { formatCreatedDate, getErrorMessage } from '@/features/projects'
import { useSecretHistory } from '../application'
import type { Secret } from '../domain'
import { UndoIcon } from './SecretRowIcons.tsx'
import { SecretValueField } from './SecretValueField.tsx'

interface SecretHistoryModalProps {
  environmentName: string
  hasUnsavedChanges: boolean
  onClose: () => void
  projectId: string
  projectName: string
  secret: Secret
}

export function SecretHistoryModal({
  environmentName,
  hasUnsavedChanges,
  onClose,
  projectId,
  projectName,
  secret,
}: SecretHistoryModalProps) {
  const {
    closeRestoreConfirmation,
    confirmRestore,
    errorsByRevision,
    loadingRevisions,
    openRestoreConfirmation,
    pendingRestoreRevision,
    revealedRevisions,
    revealedValuesByRevision,
    revisionsQuery,
    restoreDisabledReason,
    restoreError,
    restorePending,
    toggleRevision,
  } = useSecretHistory({
    environmentName,
    hasUnsavedChanges,
    isOpen: true,
    onClose,
    projectId,
    secretKey: secret.key,
    secretRevision: secret.revision,
    secretId: secret.id,
  })

  return (
    <>
      <Sheet
        open
        onOpenChange={(open) => {
          if (!open) {
            onClose()
          }
        }}
      >
        <SheetContent
          className="gap-0 overflow-hidden p-0"
          side="right"
          width="wide"
        >
          <SheetHeader className="px-6 py-5 pr-14">
            <SheetTitle className="text-xl font-semibold leading-tight">
              {secret.key}
            </SheetTitle>
            <SheetDescription className="text-base font-medium text-body">
              {projectName} &gt; {environmentName}
            </SheetDescription>
          </SheetHeader>

          <div className="min-h-0 flex-1 overflow-auto p-6 pt-5">
            <HistoryList
              errorMessage={
                revisionsQuery.isError
                  ? getErrorMessage(
                      revisionsQuery.error,
                      'Something went wrong while loading history.',
                    )
                  : undefined
              }
              errorsByRevision={errorsByRevision}
              isLoading={revisionsQuery.isLoading}
              loadingRevisions={loadingRevisions}
              onOpenRestoreConfirmation={openRestoreConfirmation}
              onToggleRevision={toggleRevision}
              restoreDisabledReason={restoreDisabledReason}
              revealedRevisions={revealedRevisions}
              revealedValuesByRevision={revealedValuesByRevision}
              revisions={revisionsQuery.data ?? []}
            />
          </div>
        </SheetContent>
      </Sheet>

      {pendingRestoreRevision !== null ? (
        <AlertDialog
          open
          onOpenChange={(open) => {
            if (!open && !restorePending) {
              closeRestoreConfirmation()
            }
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Restore secret revision?</AlertDialogTitle>
              <AlertDialogDescription>
                Restore revision {pendingRestoreRevision} as the current value
                for {secret.key} in {environmentName}?
              </AlertDialogDescription>
            </AlertDialogHeader>

            {restoreError ? <p role="alert">{restoreError}</p> : null}

            <AlertDialogFooter>
              <AlertDialogCancel disabled={restorePending}>
                Cancel
              </AlertDialogCancel>
              <Button
                disabled={restorePending}
                onClick={() => {
                  void confirmRestore()
                }}
                type="button"
                variant="destructive"
              >
                {restorePending ? 'Restoring...' : 'Restore revision'}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : null}
    </>
  )
}

interface HistoryListProps {
  errorMessage?: string
  errorsByRevision: Record<number, string | undefined>
  isLoading: boolean
  loadingRevisions: Record<number, boolean>
  onOpenRestoreConfirmation: (revision: number) => void
  onToggleRevision: (revision: number) => void | Promise<void>
  restoreDisabledReason?: string
  revealedRevisions: number[]
  revealedValuesByRevision: Record<number, string>
  revisions: Array<{
    isCurrent: boolean
    modifiedAt: string
    createdByDisplayName: string
    revision: number
  }>
}

function HistoryList({
  errorMessage,
  errorsByRevision,
  isLoading,
  loadingRevisions,
  onOpenRestoreConfirmation,
  onToggleRevision,
  restoreDisabledReason,
  revealedRevisions,
  revealedValuesByRevision,
  revisions,
}: HistoryListProps) {
  if (isLoading) {
    return (
      <StatusPanel role="status" title="Loading history...">
        <p>Revision metadata is being prepared.</p>
      </StatusPanel>
    )
  }

  if (errorMessage) {
    return (
      <StatusPanel role="alert" title="Failed to load history." tone="error">
        <p>{errorMessage}</p>
      </StatusPanel>
    )
  }

  if (revisions.length === 0) {
    return (
      <StatusPanel role="status" title="No history yet">
        <p>
          No saved revisions are available for this secret in this environment.
        </p>
      </StatusPanel>
    )
  }

  return (
    <div className="grid content-start items-start gap-6 px-1">
      {restoreDisabledReason ? (
        <p className="m-0 text-xs text-muted-foreground">
          {restoreDisabledReason}
        </p>
      ) : null}

      {revisions.map((revision) => {
        const isRevealed = revealedRevisions.includes(revision.revision)
        const isLoadingRevision = loadingRevisions[revision.revision] === true
        const error = errorsByRevision[revision.revision]
        const restoreDisabled =
          revision.isCurrent || Boolean(restoreDisabledReason)
        const restoreTitle = revision.isCurrent
          ? 'This revision is already current.'
          : restoreDisabledReason

        return (
          <article
            aria-busy={isLoadingRevision}
            className="grid content-start gap-1"
            key={revision.revision}
          >
            <div className="flex min-w-[32rem] items-center gap-3">
              <SecretValueField
                draftValue={null}
                hideActionMenu
                isMarkedForDeletion={false}
                isRevealing={isLoadingRevision}
                isRevealedReadOnly
                isSaving={false}
                isStatic
                isValueRevealed={isRevealed}
                keepInlineActionsVisibleWhenStatic
                onCancelEdit={() => undefined}
                onDeleteToggle={() => undefined}
                onDraftValueChange={() => undefined}
                onOpenHistory={() => undefined}
                onReveal={() => void onToggleRevision(revision.revision)}
                onSaveEdit={() => undefined}
                onStartValueEdit={() => undefined}
                revealedValue={revealedValuesByRevision[revision.revision]}
                secret={{
                  ...revision,
                  id: `history-${revision.revision}`,
                  key: `Revision ${revision.revision} value`,
                  hasValue: true,
                }}
              />
              <div className="grid auto-cols-max grid-flow-col gap-2 self-center">
                <Button
                  aria-label={`Restore revision ${revision.revision}`}
                  disabled={restoreDisabled}
                  onClick={() => onOpenRestoreConfirmation(revision.revision)}
                  size="icon-lg"
                  title={restoreTitle}
                  type="button"
                  variant="ghost"
                >
                  <UndoIcon />
                </Button>
              </div>
            </div>

            <p className="m-0 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-xs text-muted-foreground">
              <span className="font-semibold text-primary">
                {revision.createdByDisplayName}
              </span>
              <span>{formatCreatedDate(revision.modifiedAt)}</span>
              {revision.isCurrent ? (
                <span className="inline-flex items-center rounded-full bg-[color:var(--color-success-soft)] px-2 py-0.5 text-xs font-semibold text-success">
                  Current
                </span>
              ) : null}
            </p>

            {isLoadingRevision && !isRevealed ? (
              <span className="sr-only" role="status">
                Loading value...
              </span>
            ) : null}

            {error ? (
              <p className="m-0 text-xs text-destructive" role="alert">
                {error}
              </p>
            ) : null}

            {isRevealed &&
            revealedValuesByRevision[revision.revision]?.length === 0 ? (
              <p className="m-0 text-xs text-muted-foreground">
                This revision has an empty value.
              </p>
            ) : null}
          </article>
        )
      })}
    </div>
  )
}

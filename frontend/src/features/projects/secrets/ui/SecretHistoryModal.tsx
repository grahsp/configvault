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
import { StatePanel } from '@/shared/ui'
import { cx } from '@/shared/utils/cx.ts'
import { formatCreatedDate, getErrorMessage } from '@/features/projects'
import { useSecretHistory } from '../application'
import type { Secret } from '../domain'
import { UndoIcon } from './SecretRowIcons.tsx'
import { SecretValueField } from './SecretValueField.tsx'
import styles from './SecretHistoryModal.module.css'

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
          className="w-full gap-0 overflow-hidden p-0 sm:max-w-[42rem]"
          side="right"
        >
          <SheetHeader className="border-b border-border px-6 py-5 pr-14">
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
      <StatePanel role="status" title="Loading history...">
        <p>Revision metadata is being prepared.</p>
      </StatePanel>
    )
  }

  if (errorMessage) {
    return (
      <StatePanel role="alert" title="Failed to load history." tone="error">
        <p>{errorMessage}</p>
      </StatePanel>
    )
  }

  if (revisions.length === 0) {
    return (
      <StatePanel role="status" title="No history yet">
        <p>No saved revisions are available for this secret in this environment.</p>
      </StatePanel>
    )
  }

  return (
    <div className={styles.historyList}>
      {restoreDisabledReason ? (
        <p className={styles.restoreNotice}>{restoreDisabledReason}</p>
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
            className={styles.revisionRow}
            key={revision.revision}
          >
            <div className={styles.fieldRow}>
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
              <div className={styles.rowActions}>
                <button
                  aria-label={`Restore revision ${revision.revision}`}
                  className={styles.iconButton}
                  disabled={restoreDisabled}
                  onClick={() => onOpenRestoreConfirmation(revision.revision)}
                  title={restoreTitle}
                  type="button"
                >
                  <UndoIcon />
                </button>
              </div>
            </div>

            <p className={styles.revisionMetaLine}>
              <span className={styles.revisionCreator}>
                {revision.createdByDisplayName}
              </span>
              <span>{formatCreatedDate(revision.modifiedAt)}</span>
              {revision.isCurrent ? (
                <span className={cx(styles.currentBadge, styles.currentBadgeInline)}>
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
              <p className={styles.valueError} role="alert">
                {error}
              </p>
            ) : null}

            {isRevealed && revealedValuesByRevision[revision.revision]?.length === 0 ? (
              <p className={styles.maskedHint}>This revision has an empty value.</p>
            ) : null}
          </article>
        )
      })}
    </div>
  )
}

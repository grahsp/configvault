import { useLayoutEffect, useRef } from 'react'
import { Button, ConfirmationDialog, Modal, StatePanel } from '../../../../shared/ui'
import { cx } from '../../../../shared/utils/cx.ts'
import { formatCreatedDate, getErrorMessage } from '../../domain/project.utils.ts'
import { useSecretHistory } from '../application'
import type { Secret } from '../domain'
import { EyeIcon, EyeOffIcon, UndoIcon } from './SecretRowIcons.tsx'
import styles from './SecretHistoryModal.module.css'

const revealedValueMaxHeightPx = 192
const maskedRevisionValue = '************'

interface SecretHistoryModalProps {
  environmentName: string
  hasUnsavedChanges: boolean
  onClose: () => void
  projectId: string
  secret: Secret
}

export function SecretHistoryModal({
  environmentName,
  hasUnsavedChanges,
  onClose,
  projectId,
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
      <Modal
        actions={
          <Button onClick={onClose} type="button" variant="secondary">
            Close
          </Button>
        }
        description={`Revision history for ${secret.key} in ${environmentName}.`}
        size="md"
        title={`${secret.key} history`}
      >
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
      </Modal>

      {pendingRestoreRevision !== null ? (
        <ConfirmationDialog
          confirmLabel="Restore revision"
          errorMessage={restoreError}
          isPending={restorePending}
          onCancel={closeRestoreConfirmation}
          onConfirm={() => void confirmRestore()}
          pendingConfirmLabel="Restoring..."
          title="Restore secret revision?"
        >
          <p>
            Restore revision {pendingRestoreRevision} as the current value for{' '}
            {secret.key} in {environmentName}?
          </p>
        </ConfirmationDialog>
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

interface RevealedRevisionValueProps {
  ariaLabel: string
  value: string
}

function RevealedRevisionValue({
  ariaLabel,
  value,
}: RevealedRevisionValueProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useLayoutEffect(() => {
    const textarea = textareaRef.current

    if (!textarea) {
      return
    }

    textarea.style.height = 'auto'
    const scrollHeight = textarea.scrollHeight
    textarea.style.height = `${Math.min(scrollHeight, revealedValueMaxHeightPx)}px`
    textarea.style.overflowY =
      scrollHeight > revealedValueMaxHeightPx ? 'auto' : 'hidden'
  }, [value])

  return (
    <textarea
      aria-label={ariaLabel}
      className={styles.revealedValue}
      readOnly
      ref={textareaRef}
      rows={1}
      value={value}
    />
  )
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
        const value = isRevealed
          ? revealedValuesByRevision[revision.revision]
          : maskedRevisionValue
        const isLoadingRevision = loadingRevisions[revision.revision] === true
        const error = errorsByRevision[revision.revision]
        const restoreDisabled =
          revision.isCurrent || Boolean(restoreDisabledReason)
        const restoreTitle = revision.isCurrent
          ? 'This revision is already current.'
          : restoreDisabledReason

        return (
          <article className={styles.revisionRow} key={revision.revision}>
            <div className={styles.fieldRow}>
              <RevealedRevisionValue
                ariaLabel={`Revision ${revision.revision} value`}
                value={value}
              />
              <div className={styles.rowActions}>
                <button
                  aria-label={
                    isRevealed
                      ? `Hide revision ${revision.revision} value`
                      : `Reveal revision ${revision.revision} value`
                  }
                  className={styles.iconButton}
                  disabled={isLoadingRevision}
                  onClick={() => void onToggleRevision(revision.revision)}
                  type="button"
                >
                  {isRevealed ? <EyeOffIcon /> : <EyeIcon />}
                </button>
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
              <p className={styles.valueHint} role="status">
                Loading value...
              </p>
            ) : null}

            {error ? (
              <p className={styles.valueError} role="alert">
                {error}
              </p>
            ) : null}

            {isRevealed && value.length === 0 ? (
              <p className={styles.maskedHint}>This revision has an empty value.</p>
            ) : null}
          </article>
        )
      })}
    </div>
  )
}

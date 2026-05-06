import { Button, Modal, StatePanel } from '../../../../shared/ui'
import { formatCreatedDate, getErrorMessage } from '../../domain/project.utils.ts'
import { useSecretHistory } from '../application'
import type { Secret } from '../domain'
import styles from './SecretHistoryModal.module.css'

interface SecretHistoryModalProps {
  environmentName: string
  onClose: () => void
  projectId: string
  secret: Secret
}

export function SecretHistoryModal({
  environmentName,
  onClose,
  projectId,
  secret,
}: SecretHistoryModalProps) {
  const {
    errorsByRevision,
    loadingRevisions,
    revealedRevisions,
    revealedValuesByRevision,
    revisionsQuery,
    toggleRevision,
  } = useSecretHistory({
    environmentName,
    isOpen: true,
    projectId,
    secretId: secret.id,
  })

  return (
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
        onToggleRevision={toggleRevision}
        revealedRevisions={revealedRevisions}
        revealedValuesByRevision={revealedValuesByRevision}
        revisions={revisionsQuery.data ?? []}
      />
    </Modal>
  )
}

interface HistoryListProps {
  errorMessage?: string
  errorsByRevision: Record<number, string | undefined>
  isLoading: boolean
  loadingRevisions: Record<number, boolean>
  onToggleRevision: (revision: number) => void | Promise<void>
  revealedRevisions: number[]
  revealedValuesByRevision: Record<number, string>
  revisions: Array<{
    isCurrent: boolean
    modifiedAt: string
    modifiedByDisplayName: string
    revision: number
  }>
}

function HistoryList({
  errorMessage,
  errorsByRevision,
  isLoading,
  loadingRevisions,
  onToggleRevision,
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
      {revisions.map((revision) => {
        const isRevealed = revealedRevisions.includes(revision.revision)
        const value = revealedValuesByRevision[revision.revision]
        const isLoadingRevision = loadingRevisions[revision.revision] === true
        const error = errorsByRevision[revision.revision]

        return (
          <article className={styles.revisionCard} key={revision.revision}>
            <header className={styles.revisionHeader}>
              <div className={styles.revisionHeading}>
                <h3 className={styles.revisionTitle}>Revision {revision.revision}</h3>
                <p className={styles.revisionMeta}>
                  {formatCreatedDate(revision.modifiedAt)}
                </p>
                <p className={styles.revisionMeta}>
                  {revision.modifiedByDisplayName}
                </p>
              </div>
              {revision.isCurrent ? (
                <span className={styles.currentBadge}>Current</span>
              ) : null}
            </header>

            <div className={styles.valueSection}>
              <span className={styles.valueLabel}>Value</span>

              {isRevealed ? (
                <>
                  <textarea
                    aria-label={`Revision ${revision.revision} value`}
                    className={styles.revealedValue}
                    readOnly
                    value={value}
                  />
                  <button
                    className={styles.valueAction}
                    onClick={() => void onToggleRevision(revision.revision)}
                    type="button"
                  >
                    Hide value
                  </button>
                </>
              ) : (
                <button
                  aria-label={`Reveal revision ${revision.revision} value`}
                  className={styles.maskedValueButton}
                  disabled={isLoadingRevision}
                  onClick={() => void onToggleRevision(revision.revision)}
                  type="button"
                >
                  <span className={styles.maskedValueText}>************</span>
                  <span className={styles.maskedValueHint}>
                    {isLoadingRevision ? 'Loading value...' : 'Reveal value'}
                  </span>
                </button>
              )}

              {error ? (
                <p className={styles.valueError} role="alert">
                  {error}
                </p>
              ) : null}
            </div>
          </article>
        )
      })}
    </div>
  )
}

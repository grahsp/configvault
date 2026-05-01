import type { Secret } from '../domain'
import type { SecretRowViewModel } from '../application'
import { ImportSecretsModal } from './ImportSecretsModal.tsx'
import { SecretRow } from './SecretRow.tsx'
import { SecretsTableFooterActions } from './SecretsTableFooterActions.tsx'
import { SecretsTableHeaderActions } from './SecretsTableHeaderActions.tsx'
import {
  SecretsEmptyState,
  SecretsErrorState,
  SecretsLoadingState,
} from './SecretsTableStates.tsx'
import styles from './SecretsTable.module.css'

interface SecretsTableProps {
  environmentName: string
  isError: boolean
  hasUnsavedChanges: boolean
  isImportModalOpen: boolean
  isImporting: boolean
  isLoading: boolean
  isSaving: boolean
  loadErrorMessage?: string
  rows: SecretRowViewModel[]
  onCancelEdit: () => void
  onCloseImportModal: () => void
  onDraftKeyChange: (secret: Secret, nextDraftKey: string) => void
  onDraftValueChange: (secret: Secret, nextDraftValue: string) => void
  onImport: (content: string) => Promise<void>
  onOpenAddSecret: () => void
  onOpenImportModal: () => void
  onReveal: (secret: Secret) => Promise<void>
  onRetry: () => void
  onSaveEdit: () => Promise<void>
  onStartValueEdit: (secret: Secret) => Promise<void> | void
  onToggleDelete: (secret: Secret) => void
}

export function SecretsTable({
  environmentName,
  isError,
  hasUnsavedChanges,
  isImportModalOpen,
  isImporting,
  isLoading,
  isSaving,
  loadErrorMessage,
  rows,
  onCancelEdit,
  onCloseImportModal,
  onDraftKeyChange,
  onDraftValueChange,
  onImport,
  onOpenAddSecret,
  onOpenImportModal,
  onReveal,
  onRetry,
  onSaveEdit,
  onStartValueEdit,
  onToggleDelete,
}: SecretsTableProps) {
  const hasRows = rows.length > 0
  const showHeaderActions = Boolean(environmentName) && !isLoading && !isError && hasRows
  const showLoadingState = isLoading
  const showErrorState = Boolean(environmentName) && isError
  const showEmptyState =
    Boolean(environmentName) && !isLoading && !isError && !hasRows
  const showTable = Boolean(environmentName) && !isLoading && !isError && hasRows

  return (
    <section className={styles.sectionCard}>
      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>Secrets</h3>
        <p className={styles.sectionDescription}>
          Set environment-specific config and secrets, then manage key and value
          updates from one edit state.
        </p>

        {showHeaderActions ? (
          <SecretsTableHeaderActions
            onOpenAddSecret={onOpenAddSecret}
            onOpenImportModal={onOpenImportModal}
          />
        ) : null}
      </div>

      <SecretsLoadingState isVisible={showLoadingState} />
      <SecretsErrorState
        errorMessage={loadErrorMessage}
        isVisible={showErrorState}
        onRetry={onRetry}
      />
      <SecretsEmptyState
        isVisible={showEmptyState}
        onOpenAddSecret={onOpenAddSecret}
        onOpenImportModal={onOpenImportModal}
      />

      {showTable ? (
        <>
          <div className={styles.tableWrapper}>
            <table className={styles.configItemsTable}>
              <caption className={styles.visuallyHidden}>
                Project secrets
              </caption>
              <thead>
                <tr>
                  <th scope="col">Key</th>
                  <th scope="col">Value</th>
                  <th className={styles.actionsColumn} scope="col">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <SecretRow
                    secret={row.secret}
                    draftKey={row.draftKey}
                    draftValue={row.draftValue}
                    isMarkedForDeletion={row.isMarkedForDeletion}
                    isRevealing={row.isRevealing}
                    isSaving={isSaving}
                    isValueRevealed={row.isValueRevealed}
                    key={row.secret.id}
                    onCancelEdit={onCancelEdit}
                    onDeleteToggle={onToggleDelete}
                    onDraftKeyChange={(nextDraftKey) =>
                      onDraftKeyChange(row.secret, nextDraftKey)
                    }
                    onDraftValueChange={(nextDraftValue) =>
                      onDraftValueChange(row.secret, nextDraftValue)
                    }
                    onReveal={onReveal}
                    onSaveEdit={() => void onSaveEdit()}
                    onStartValueEdit={onStartValueEdit}
                    revealedValue={row.revealedValue}
                    shouldFocus={row.shouldFocus}
                    validationError={row.validationError}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {hasUnsavedChanges ? (
            <SecretsTableFooterActions
              isSaving={isSaving}
              onCancelEdit={onCancelEdit}
              onSaveEdit={onSaveEdit}
            />
          ) : null}
        </>
      ) : null}

      {isImportModalOpen ? (
        <ImportSecretsModal
          hasUnsavedChanges={hasUnsavedChanges}
          isPending={isImporting}
          onCancel={onCloseImportModal}
          onSubmit={onImport}
        />
      ) : null}
    </section>
  )
}

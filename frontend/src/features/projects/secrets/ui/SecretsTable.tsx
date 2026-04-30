import { Button, StatePanel } from '../../../../shared/ui'
import type { Secret } from '../domain'
import type { SecretRowViewModel } from '../application'
import { ImportSecretsModal } from './ImportSecretsModal.tsx'
import { SecretRow } from './SecretRow.tsx'
import styles from './SecretsTable.module.css'

interface SecretsTableProps {
  environmentName: string
  isEditing: boolean
  isError: boolean
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
  onStartEdit: () => void
  onStartValueEdit: (secret: Secret) => Promise<void> | void
  onToggleDelete: (secret: Secret) => void
}

export function SecretsTable({
  environmentName,
  isEditing,
  isError,
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
  onStartEdit,
  onStartValueEdit,
  onToggleDelete,
}: SecretsTableProps) {
  const hasRows = rows.length > 0

  return (
    <section className={styles.sectionCard}>
      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>Environment Variables</h3>
        <p className={styles.sectionDescription}>
          Set environment-specific config and secrets, then manage key and value
          updates from one edit state.
        </p>

        {!isEditing &&
        environmentName &&
        !isLoading &&
        !isError &&
        hasRows ? (
          <div className={styles.sectionHeaderActions}>
            <Button onClick={onOpenImportModal} type="button" variant="secondary">
              Import .env
            </Button>
            <Button onClick={onStartEdit} type="button" variant="secondary">
              Edit
            </Button>
          </div>
        ) : null}
      </div>

      {isLoading ? (
        <StatePanel
          className={styles.sectionState}
          role="status"
          title="Loading secrets..."
        >
          <p>
            Config item keys are being prepared.
          </p>
        </StatePanel>
      ) : null}

      {environmentName && isError ? (
        <StatePanel
          actions={
            <Button onClick={onRetry} type="button" variant="secondary">
              Retry
            </Button>
          }
          className={styles.sectionState}
          role="alert"
          title="Failed to load secrets."
          tone="error"
        >
          <p>{loadErrorMessage}</p>
        </StatePanel>
      ) : null}

      {environmentName &&
      !isLoading &&
      !isError &&
      !hasRows ? (
        <StatePanel
          actions={
            <>
              <Button onClick={onOpenAddSecret} type="button" variant="primary">
                Add Secret
              </Button>
              <Button onClick={onOpenImportModal} type="button" variant="secondary">
                Import .env
              </Button>
            </>
          }
          className={styles.sectionState}
          title="No secrets yet"
        >
          <p>
            Add a secret key to start tracking values across environments.
          </p>
        </StatePanel>
      ) : null}

      {environmentName &&
      !isLoading &&
      !isError &&
      hasRows ? (
        <>
          <div className={styles.tableWrapper}>
            <table className={styles.configItemsTable}>
              <caption className={styles.visuallyHidden}>
                Project secrets and config items
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
                    isEditing={isEditing}
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

          {isEditing ? (
            <div className={styles.sectionFooterActions}>
              <div className={styles.sectionFooterPrimaryActions}>
                <Button
                  className={styles.footerPrimaryButton}
                  disabled={isSaving}
                  onClick={onOpenAddSecret}
                  type="button"
                  variant="primary"
                >
                  Add Secret
                </Button>
                <Button
                  className={styles.footerPrimaryButton}
                  disabled={isSaving}
                  onClick={onOpenImportModal}
                  type="button"
                  variant="secondary"
                >
                  Import .env
                </Button>
              </div>
              <div className={styles.sectionFooterSecondaryActions}>
                <Button
                  disabled={isSaving}
                  onClick={() => void onSaveEdit()}
                  type="button"
                  variant="primary"
                >
                  {isSaving ? 'Saving' : 'Save Changes'}
                </Button>
                <Button
                  disabled={isSaving}
                  onClick={onCancelEdit}
                  type="button"
                  variant="secondary"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : null}
        </>
      ) : null}

      {isImportModalOpen ? (
        <ImportSecretsModal
          isEditing={isEditing}
          isPending={isImporting}
          onCancel={onCloseImportModal}
          onSubmit={onImport}
        />
      ) : null}
    </section>
  )
}

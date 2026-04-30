import { cx } from '../../../../shared/utils/cx.ts'
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
            <button
              className={cx(styles.button, styles.buttonSecondary)}
              onClick={onOpenImportModal}
              type="button"
            >
              Import .env
            </button>
            <button
              className={cx(styles.button, styles.buttonSecondary)}
              onClick={onStartEdit}
              type="button"
            >
              Edit
            </button>
          </div>
        ) : null}
      </div>

      {isLoading ? (
        <div className={styles.state} role="status">
          <p className={styles.stateTitle}>Loading secrets...</p>
          <p className={styles.stateCopy}>
            Config item keys are being prepared.
          </p>
        </div>
      ) : null}

      {environmentName && isError ? (
        <div className={cx(styles.state, styles.stateError)} role="alert">
          <p className={styles.stateTitle}>Failed to load secrets.</p>
          <p className={styles.stateCopy}>{loadErrorMessage}</p>
          <button
            className={cx(styles.button, styles.buttonSecondary)}
            onClick={onRetry}
            type="button"
          >
            Retry
          </button>
        </div>
      ) : null}

      {environmentName &&
      !isLoading &&
      !isError &&
      !hasRows ? (
        <div className={styles.state}>
          <p className={styles.stateTitle}>No secrets yet</p>
          <p className={styles.stateCopy}>
            Add a secret key to start tracking values across environments.
          </p>
          <button
            className={cx(styles.button, styles.buttonPrimary)}
            onClick={onOpenAddSecret}
            type="button"
          >
            Add Secret
          </button>
          <button
            className={cx(styles.button, styles.buttonSecondary)}
            onClick={onOpenImportModal}
            type="button"
          >
            Import .env
          </button>
        </div>
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
                <button
                  className={cx(styles.button, styles.buttonPrimary)}
                  disabled={isSaving}
                  onClick={onOpenAddSecret}
                  type="button"
                >
                  Add Secret
                </button>
                <button
                  className={cx(styles.button, styles.buttonSecondary)}
                  disabled={isSaving}
                  onClick={onOpenImportModal}
                  type="button"
                >
                  Import .env
                </button>
              </div>
              <div className={styles.sectionFooterSecondaryActions}>
                <button
                  className={cx(styles.button, styles.buttonPrimary)}
                  disabled={isSaving}
                  onClick={() => void onSaveEdit()}
                  type="button"
                >
                  {isSaving ? 'Saving' : 'Save Changes'}
                </button>
                <button
                  className={cx(styles.button, styles.buttonSecondary)}
                  disabled={isSaving}
                  onClick={onCancelEdit}
                  type="button"
                >
                  Cancel
                </button>
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

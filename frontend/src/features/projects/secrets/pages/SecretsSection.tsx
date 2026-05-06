import { useSecretsEditor } from '../application'
import {
  ImportSecretsModal,
  SecretHistoryModal,
  SecretsTableFooterActions,
  SecretsTableHeaderActions,
} from '../ui'
import { SecretsContent } from './SecretsContent.tsx'
import styles from './SecretsSection.module.css'

interface SecretsSectionProps {
  environmentName: string
  projectId: string
}

export function SecretsSection({
  environmentName,
  projectId,
}: SecretsSectionProps) {
  const editor = useSecretsEditor({
    environmentName,
    projectId,
  })
  const hasRows = editor.rows.length > 0
  const showHeaderActions = !editor.isLoading && !editor.isError && hasRows
  const showFooterActions = showHeaderActions && editor.hasUnsavedChanges

  return (
    <section className={styles.sectionCard}>
      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>Secrets</h3>
        {showHeaderActions ? (
          <div className={styles.sectionHeaderActions}>
            <SecretsTableHeaderActions
              canCopyExport={editor.canCopyExport}
              isCopyingExport={editor.isCopyingExport}
              onCopyExport={editor.onCopyExport}
              onOpenAddSecret={editor.onOpenAddSecret}
              onOpenImportModal={editor.onOpenImportModal}
            />
          </div>
        ) : null}
        <p className={styles.sectionDescription}>
          Set environment-specific config and secrets, then manage key and value
          updates from one edit state.
        </p>
      </div>

      <SecretsContent
        isError={editor.isError}
        isLoading={editor.isLoading}
        isSaving={editor.isSaving}
        loadErrorMessage={editor.loadErrorMessage}
        onCancelEdit={editor.onCancelEdit}
        onDraftKeyChange={editor.onDraftKeyChange}
        onDraftValueChange={editor.onDraftValueChange}
        onOpenAddSecret={editor.onOpenAddSecret}
        onOpenHistory={editor.onOpenHistory}
        onOpenImportModal={editor.onOpenImportModal}
        onReveal={editor.onReveal}
        onRetry={editor.onRetry}
        onSaveEdit={editor.onSaveEdit}
        onStartValueEdit={editor.onStartValueEdit}
        onToggleDelete={editor.onToggleDelete}
        rows={editor.rows}
      />

      {showFooterActions ? (
        <div className={styles.sectionFooterActions}>
          <SecretsTableFooterActions
            isSaving={editor.isSaving}
            onCancelEdit={editor.onCancelEdit}
            onSaveEdit={editor.onSaveEdit}
          />
        </div>
      ) : null}

      {editor.isImportModalOpen ? (
        <ImportSecretsModal
          hasUnsavedChanges={editor.hasUnsavedChanges}
          isPending={editor.isImporting}
          onCancel={editor.onCloseImportModal}
          onSubmit={editor.onImport}
        />
      ) : null}

      {editor.historySecret ? (
        <SecretHistoryModal
          environmentName={editor.environmentName}
          hasUnsavedChanges={editor.hasUnsavedChanges}
          onClose={editor.onCloseHistory}
          projectId={projectId}
          secret={editor.historySecret}
        />
      ) : null}
    </section>
  )
}

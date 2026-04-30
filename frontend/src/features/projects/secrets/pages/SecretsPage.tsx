import { useOutletContext } from 'react-router-dom'
import { cx } from '../../../../shared/utils/cx.ts'
import { useSecretsEditor } from '../application'
import type { ProjectLayoutContext } from '../../pages/ProjectDetailPage'
import { SecretsTable } from '../ui'
import styles from './SecretsPage.module.css'

export function SecretsPage() {
  const { project, selectedEnvironmentName } =
    useOutletContext<ProjectLayoutContext>()
  const editor = useSecretsEditor({
    projectId: project.id,
    environmentName: selectedEnvironmentName,
  })

  return (
    <section className={styles.page}>
      {editor.canCopyExport ? (
        <div className={styles.actions}>
          <button
            className={cx(styles.button, styles.buttonSecondary)}
            disabled={editor.isCopyingExport}
            onClick={editor.onCopyExport}
            type="button"
          >
            {editor.isCopyingExport ? 'Copying export...' : 'Copy Export'}
          </button>
        </div>
      ) : null}

      <SecretsTable
        environmentName={editor.environmentName}
        isEditing={editor.isEditing}
        isError={editor.isError}
        isImportModalOpen={editor.isImportModalOpen}
        isImporting={editor.isImporting}
        isLoading={editor.isLoading}
        isSaving={editor.isSaving}
        loadErrorMessage={editor.loadErrorMessage}
        onCancelEdit={editor.onCancelEdit}
        onCloseImportModal={editor.onCloseImportModal}
        onDraftKeyChange={editor.onDraftKeyChange}
        onDraftValueChange={editor.onDraftValueChange}
        onImport={editor.onImport}
        onOpenAddSecret={editor.onOpenAddSecret}
        onOpenImportModal={editor.onOpenImportModal}
        onReveal={editor.onReveal}
        onRetry={editor.onRetry}
        onSaveEdit={editor.onSaveEdit}
        onStartEdit={editor.onStartEdit}
        onStartValueEdit={editor.onStartValueEdit}
        onToggleDelete={editor.onToggleDelete}
        rows={editor.rows}
      />
    </section>
  )
}

import { useOutletContext } from 'react-router-dom'
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
      <SecretsTable
        canCopyExport={editor.canCopyExport}
        environmentName={editor.environmentName}
        isError={editor.isError}
        hasUnsavedChanges={editor.hasUnsavedChanges}
        isCopyingExport={editor.isCopyingExport}
        isImportModalOpen={editor.isImportModalOpen}
        isImporting={editor.isImporting}
        isLoading={editor.isLoading}
        isSaving={editor.isSaving}
        loadErrorMessage={editor.loadErrorMessage}
        onCancelEdit={editor.onCancelEdit}
        onCloseImportModal={editor.onCloseImportModal}
        onCopyExport={editor.onCopyExport}
        onDraftKeyChange={editor.onDraftKeyChange}
        onDraftValueChange={editor.onDraftValueChange}
        onImport={editor.onImport}
        onOpenAddSecret={editor.onOpenAddSecret}
        onOpenImportModal={editor.onOpenImportModal}
        onReveal={editor.onReveal}
        onRetry={editor.onRetry}
        onSaveEdit={editor.onSaveEdit}
        onStartValueEdit={editor.onStartValueEdit}
        onToggleDelete={editor.onToggleDelete}
        rows={editor.rows}
      />
    </section>
  )
}

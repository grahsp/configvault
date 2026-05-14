import { useSecretsEditor } from '../application'
import {
  ImportSecretsModal,
  SecretHistoryModal,
  SecretsTableFooterActions,
  SecretsTableHeaderActions,
} from '../ui'
import { Separator } from '../../../../components/ui/separator'
import { SecretsContent } from './SecretsContent.tsx'

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
  const showFooterActions = editor.hasUnsavedChanges

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold tracking-[-0.02em] text-foreground">
            Secrets
          </h2>
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
            Set environment-specific config and secrets, then manage key and
            value updates from one edit state.
          </p>
        </div>

        {!editor.isLoading && !editor.isError && hasRows ? (
          <div className="flex items-center gap-2 self-start">
            <SecretsTableHeaderActions
              canCopyExport={editor.canCopyExport}
              isCopyingExport={editor.isCopyingExport}
              onCopyExport={editor.onCopyExport}
              onOpenAddSecret={editor.onOpenAddSecret}
              onOpenImportModal={editor.onOpenImportModal}
            />
          </div>
        ) : null}
      </div>

      <Separator />

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
        <>
          <Separator />
          <div className="flex items-center justify-end gap-2">
          <SecretsTableFooterActions
            isSaving={editor.isSaving}
            onCancelEdit={editor.onCancelEdit}
            onSaveEdit={editor.onSaveEdit}
          />
          </div>
        </>
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

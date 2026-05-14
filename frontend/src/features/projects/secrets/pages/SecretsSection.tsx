import { ArrowDownAZIcon, ArrowDownZAIcon } from 'lucide-react'
import { SortMenu, ToolbarSearchInput } from '../../../projects/ui'
import { useSecretsEditor } from '../application'
import {
  ImportSecretsModal,
  SecretHistoryModal,
  SecretsTableFooterActions,
  SecretsTableHeaderActions,
} from '../ui'
import { Separator } from '../../../../components/ui/separator'
import { SecretsContent } from './SecretsContent.tsx'

const secretSortOptions = [
  {
    icon: ArrowDownAZIcon,
    id: 'key-asc',
    label: 'Key (A-Z)',
  },
  {
    icon: ArrowDownZAIcon,
    id: 'key-desc',
    label: 'Key (Z-A)',
  },
] as const

interface SecretsSectionProps {
  environmentName: string
  isEnvironmentLoading: boolean
  projectId: string
}

export function SecretsSection({
  environmentName,
  isEnvironmentLoading,
  projectId,
}: SecretsSectionProps) {
  const editor = useSecretsEditor({
    environmentName,
    isEnvironmentLoading,
    projectId,
  })
  const hasRows = editor.totalRowCount > 0
  const showFooterActions = editor.hasUnsavedChanges

  return (
    <section className="flex flex-col gap-4 sm:gap-5">
      {!editor.isLoading && !editor.isError && hasRows ? (
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center">
            <h2 className="text-[1.45rem] font-bold leading-[0.98] tracking-[-0.015em] text-foreground/85">
              Secrets ({editor.totalRowCount})
            </h2>
          </div>
          <div className="flex w-full flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-end lg:w-auto">
            <SortMenu
              ariaLabel={`Secret sort: ${
                secretSortOptions.find((option) => option.id === editor.sortOptionId)?.label ?? 'Key (A-Z)'
              }`}
              buttonClassName="border-border/60 bg-background/80 shadow-none"
              buttonSize="icon"
              onSelect={editor.onSortOptionChange}
              options={[...secretSortOptions]}
              selectedOptionId={editor.sortOptionId}
            />
            <ToolbarSearchInput
              ariaLabel="Search secrets"
              inputClassName="h-9 border-border/60 bg-background/80 pl-9 text-sm shadow-none placeholder:text-muted-foreground/80"
              iconClassName="left-3 size-3.5"
              onChange={editor.onSearchTermChange}
              placeholder="Search for a secret..."
              value={editor.searchTerm}
              wrapperClassName="relative w-full sm:w-[15rem] lg:w-[16rem]"
            />
            <SecretsTableHeaderActions
              canCopyExport={editor.canCopyExport}
              compact
              isCopyingExport={editor.isCopyingExport}
              onCopyExport={editor.onCopyExport}
              onOpenAddSecret={editor.onOpenAddSecret}
              onOpenImportModal={editor.onOpenImportModal}
            />
          </div>
        </div>
      ) : null}

      <SecretsContent
        hasActiveSearch={editor.hasActiveSearch}
        hasSelectedEnvironment={editor.hasSelectedEnvironment}
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
        searchTerm={editor.searchTerm}
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

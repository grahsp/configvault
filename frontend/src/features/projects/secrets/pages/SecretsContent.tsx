import { StatePanel } from '../../../../shared/ui'
import type { Secret } from '../domain'
import type { SecretRowViewModel } from '../application'
import {
  SecretsEmptyState,
  SecretsEnvironmentRequiredState,
  SecretsErrorState,
  SecretsLoadingState,
  SecretsTable,
} from '../ui'

export interface SecretsContentProps {
  hasActiveSearch: boolean
  hasSelectedEnvironment: boolean
  isError: boolean
  isLoading: boolean
  isSaving: boolean
  loadErrorMessage?: string
  rows: SecretRowViewModel[]
  onCancelEdit: () => void
  onDraftKeyChange: (secret: Secret, nextDraftKey: string) => void
  onDraftValueChange: (secret: Secret, nextDraftValue: string) => void
  onOpenAddSecret: () => void
  onOpenHistory: (secret: Secret) => void
  onOpenImportModal: () => void
  onReveal: (secret: Secret) => Promise<void>
  onRetry: () => void
  onSaveEdit: () => Promise<void>
  onStartValueEdit: (secret: Secret) => Promise<void> | void
  onToggleDelete: (secret: Secret) => void
  searchTerm: string
}

export function SecretsContent({
  hasActiveSearch,
  hasSelectedEnvironment,
  isError,
  isLoading,
  isSaving,
  loadErrorMessage,
  onCancelEdit,
  onDraftKeyChange,
  onDraftValueChange,
  onOpenAddSecret,
  onOpenHistory,
  onOpenImportModal,
  onReveal,
  onRetry,
  onSaveEdit,
  onStartValueEdit,
  onToggleDelete,
  rows,
  searchTerm,
}: SecretsContentProps) {
  if (isLoading) {
    return <SecretsLoadingState />
  }

  if (isError) {
    return (
      <SecretsErrorState
        errorMessage={loadErrorMessage}
        onRetry={onRetry}
      />
    )
  }

  if (!hasSelectedEnvironment) {
    return <SecretsEnvironmentRequiredState />
  }

  if (rows.length === 0) {
    if (hasActiveSearch) {
      return (
        <StatePanel title="No matching secrets">
          <p>
            No secrets matched "{searchTerm.trim()}". Try a different search.
          </p>
        </StatePanel>
      )
    }

    return (
      <SecretsEmptyState
        onOpenAddSecret={onOpenAddSecret}
        onOpenImportModal={onOpenImportModal}
      />
    )
  }

  return (
    <SecretsTable
      isSaving={isSaving}
      onCancelEdit={onCancelEdit}
      onDraftKeyChange={onDraftKeyChange}
      onDraftValueChange={onDraftValueChange}
      onOpenHistory={onOpenHistory}
      onReveal={onReveal}
      onSaveEdit={onSaveEdit}
      onStartValueEdit={onStartValueEdit}
      onToggleDelete={onToggleDelete}
      rows={rows}
    />
  )
}

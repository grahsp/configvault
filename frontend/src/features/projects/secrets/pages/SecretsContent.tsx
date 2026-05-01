import type { Secret } from '../domain'
import type { SecretRowViewModel } from '../application'
import {
  SecretsEmptyState,
  SecretsErrorState,
  SecretsLoadingState,
  SecretsTable,
} from '../ui'
import styles from './SecretsContent.module.css'

export interface SecretsContentProps {
  isError: boolean
  isLoading: boolean
  isSaving: boolean
  loadErrorMessage?: string
  rows: SecretRowViewModel[]
  onCancelEdit: () => void
  onDraftKeyChange: (secret: Secret, nextDraftKey: string) => void
  onDraftValueChange: (secret: Secret, nextDraftValue: string) => void
  onOpenAddSecret: () => void
  onOpenImportModal: () => void
  onReveal: (secret: Secret) => Promise<void>
  onRetry: () => void
  onSaveEdit: () => Promise<void>
  onStartValueEdit: (secret: Secret) => Promise<void> | void
  onToggleDelete: (secret: Secret) => void
}

export function SecretsContent({
  isError,
  isLoading,
  isSaving,
  loadErrorMessage,
  onCancelEdit,
  onDraftKeyChange,
  onDraftValueChange,
  onOpenAddSecret,
  onOpenImportModal,
  onReveal,
  onRetry,
  onSaveEdit,
  onStartValueEdit,
  onToggleDelete,
  rows,
}: SecretsContentProps) {
  if (isLoading) {
    return <SecretsLoadingState className={styles.statePanel} />
  }

  if (isError) {
    return (
      <SecretsErrorState
        className={styles.statePanel}
        errorMessage={loadErrorMessage}
        onRetry={onRetry}
      />
    )
  }

  if (rows.length === 0) {
    return (
      <SecretsEmptyState
        className={styles.statePanel}
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
      onReveal={onReveal}
      onSaveEdit={onSaveEdit}
      onStartValueEdit={onStartValueEdit}
      onToggleDelete={onToggleDelete}
      rows={rows}
    />
  )
}

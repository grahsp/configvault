import { useCallback, useMemo, useState } from 'react'
import { buildSecretRows } from './secretRowViewModels.ts'
import type {
  SecretRowViewModel,
  SecretsEditSessionController,
  SecretsRevealController,
  SecretsSaveController,
} from './secretsEditor.types.ts'
import { toLocalSecret } from './secretsEditorDrafts.ts'
import { getErrorMessage } from './secretsOperationMessages.ts'
import { useSecretsEditSession } from './useSecretsEditSession.ts'
import { useSecretsEditorState } from './useSecretsEditorState.ts'
import { useSecretsMutations } from './useSecretsMutations.ts'
import { useSecretsQuery } from './useSecretsQuery.ts'
import { useSecretsRevealActions } from './useSecretsRevealActions.ts'
import { useSecretsSave } from './useSecretsSave.ts'
import { useSecretsTransferActions } from './useSecretsTransferActions.ts'
import type { Secret } from '../domain'

interface UseSecretsEditorOptions {
  environmentName: string
  isEnvironmentLoading: boolean
  projectId: string
}

type SecretSortOptionId = 'key-asc' | 'key-desc'

const EMPTY_SECRETS: Secret[] = []

export function useSecretsEditor({
  environmentName,
  isEnvironmentLoading,
  projectId,
}: UseSecretsEditorOptions) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortOptionId, setSortOptionId] = useState<SecretSortOptionId>('key-asc')
  const secretsQuery = useSecretsQuery(projectId, environmentName)
  const mutations = useSecretsMutations(projectId, environmentName)
  const secrets = secretsQuery.data ?? EMPTY_SECRETS
  const resetImportMutation = mutations.importSecrets.reset
  const resetRevealMutation = mutations.revealSecretValue.reset
  const resetSaveMutation = mutations.saveSecrets.reset
  const resetMutations = useCallback(() => {
    resetImportMutation()
    resetRevealMutation()
    resetSaveMutation()
  }, [resetImportMutation, resetRevealMutation, resetSaveMutation])
  const {
    drafts,
    focusedSecretId,
    historySecret,
    highlightedValidationIds,
    isImportModalOpen,
    newSecrets,
    pendingDeletionIds,
    revealedValueRevisions,
    revealedValues,
    revealingId,
    setDrafts,
    setFocusedSecretId,
    setHistorySecret,
    setHighlightedValidationIds,
    setIsImportModalOpen,
    setNewSecrets,
    setPendingDeletionIds,
    setRevealedValueRevisions,
    setRevealedValues,
    setRevealingId,
    setVisibleRevealedValues,
    visibleRevealedValues,
  } = useSecretsEditorState(environmentName, resetMutations)

  const tableSecrets = useMemo(
    () => [...newSecrets.map(toLocalSecret), ...secrets],
    [secrets, newSecrets],
  )
  const hasUnsavedChanges =
    Object.keys(drafts).length > 0 ||
    newSecrets.length > 0 ||
    pendingDeletionIds.length > 0

  const rows = useMemo<SecretRowViewModel[]>(
    () =>
      buildSecretRows({
        drafts,
        focusedSecretId,
        highlightedValidationIds,
        newSecrets,
        pendingDeletionIds,
        revealedValues,
        revealingId,
        tableSecrets,
        visibleRevealedValues,
      }),
    [
      drafts,
      focusedSecretId,
      highlightedValidationIds,
      newSecrets,
      pendingDeletionIds,
      revealedValues,
      revealingId,
      tableSecrets,
      visibleRevealedValues,
    ],
  )
  const normalizedSearchTerm = searchTerm.trim().toLocaleLowerCase()
  const filteredRows = useMemo(() => {
    const sortedRows = [...rows].sort((firstRow, secondRow) => {
      const direction = sortOptionId === 'key-desc' ? -1 : 1

      return (
        firstRow.draftKey.localeCompare(secondRow.draftKey, undefined, {
          sensitivity: 'base',
        }) * direction
      )
    })

    if (!normalizedSearchTerm) {
      return sortedRows
    }

    return sortedRows.filter((row) =>
      row.draftKey.toLocaleLowerCase().includes(normalizedSearchTerm),
    )
  }, [normalizedSearchTerm, rows, sortOptionId])

  const editSessionState: SecretsEditSessionController = {
    setDrafts,
    setFocusedSecretId,
    setHistorySecret,
    setHighlightedValidationIds,
    setIsImportModalOpen,
    setNewSecrets,
    setPendingDeletionIds,
  }

  const revealState: SecretsRevealController = {
    drafts,
    revealedValueRevisions,
    revealedValues,
    setDrafts,
    setRevealedValueRevisions,
    setRevealedValues,
    setRevealingId,
    setVisibleRevealedValues,
    visibleRevealedValues,
  }

  const saveState: SecretsSaveController = {
    drafts,
    newSecrets,
    pendingDeletionIds,
    revealedValueRevisions,
    setHighlightedValidationIds,
    setRevealedValueRevisions,
    setRevealedValues,
    setVisibleRevealedValues,
  }

  const editSession = useSecretsEditSession({
    resetImportMutation,
    resetSaveMutation,
    state: editSessionState,
  })
  const revealActions = useSecretsRevealActions({
    mutations,
    state: revealState,
  })
  const saveActions = useSecretsSave({
    handleCancelEdit: editSession.onCancelEdit,
    mutations,
    secrets,
    state: saveState,
  })
  const transferActions = useSecretsTransferActions({
    hasUnsavedChanges,
    handleCancelEdit: editSession.onCancelEdit,
    handleCloseImportModal: editSession.onCloseImportModal,
    mutations,
  })

  return {
    canCopyExport: Boolean(environmentName),
    environmentName,
    hasSelectedEnvironment: Boolean(environmentName),
    hasUnsavedChanges,
    historySecret,
    isCopyingExport: mutations.exportSecrets.isPending,
    isError: secretsQuery.isError,
    isImportModalOpen,
    isImporting: mutations.importSecrets.isPending,
    isLoading: isEnvironmentLoading || secretsQuery.isLoading,
    isSaving: mutations.saveSecrets.isPending,
    loadErrorMessage: secretsQuery.isError
        ? getErrorMessage(
          secretsQuery.error,
          'Something went wrong while loading secrets.',
        )
      : undefined,
    hasActiveSearch: Boolean(normalizedSearchTerm),
    onCancelEdit: editSession.onCancelEdit,
    onCloseImportModal: editSession.onCloseImportModal,
    onCopyExport: transferActions.onCopyExport,
    onDraftKeyChange: editSession.onDraftKeyChange,
    onDraftValueChange: editSession.onDraftValueChange,
    onCloseHistory: () => setHistorySecret(null),
    onImport: transferActions.onImport,
    onOpenAddSecret: editSession.onOpenAddSecret,
    onOpenHistory: setHistorySecret,
    onOpenImportModal: editSession.onOpenImportModal,
    onReveal: revealActions.onReveal,
    onRetry: () => secretsQuery.refetch(),
    onSaveEdit: saveActions.onSaveEdit,
    onSearchTermChange: setSearchTerm,
    onStartValueEdit: revealActions.onStartValueEdit,
    onSortOptionChange: setSortOptionId,
    onToggleDelete: editSession.onToggleDelete,
    rows: filteredRows,
    searchTerm,
    sortOptionId,
    totalRowCount: rows.length,
  }
}

export type SecretsEditorState = ReturnType<typeof useSecretsEditor>

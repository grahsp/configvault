import { useCallback, useMemo } from 'react'
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

interface UseSecretsEditorOptions {
  environmentName: string
  projectId: string
}

export function useSecretsEditor({
  environmentName,
  projectId,
}: UseSecretsEditorOptions) {
  const secretsQuery = useSecretsQuery(projectId, environmentName)
  const mutations = useSecretsMutations(projectId, environmentName)
  const secrets = secretsQuery.data ?? []
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
    highlightedValidationIds,
    isImportModalOpen,
    newSecrets,
    pendingDeletionIds,
    revealedValues,
    revealingId,
    setDrafts,
    setFocusedSecretId,
    setHighlightedValidationIds,
    setIsImportModalOpen,
    setNewSecrets,
    setPendingDeletionIds,
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

  const editSessionState: SecretsEditSessionController = {
    setDrafts,
    setFocusedSecretId,
    setHighlightedValidationIds,
    setIsImportModalOpen,
    setNewSecrets,
    setPendingDeletionIds,
  }

  const revealState: SecretsRevealController = {
    drafts,
    revealedValues,
    setDrafts,
    setRevealedValues,
    setRevealingId,
    setVisibleRevealedValues,
    visibleRevealedValues,
  }

  const saveState: SecretsSaveController = {
    drafts,
    newSecrets,
    pendingDeletionIds,
    setHighlightedValidationIds,
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
    hasUnsavedChanges,
    isCopyingExport: mutations.exportSecrets.isPending,
    isError: secretsQuery.isError,
    isImportModalOpen,
    isImporting: mutations.importSecrets.isPending,
    isLoading: !environmentName || secretsQuery.isLoading,
    isSaving: mutations.saveSecrets.isPending,
    loadErrorMessage: secretsQuery.isError
        ? getErrorMessage(
          secretsQuery.error,
          'Something went wrong while loading secrets.',
        )
      : undefined,
    onCancelEdit: editSession.onCancelEdit,
    onCloseImportModal: editSession.onCloseImportModal,
    onCopyExport: transferActions.onCopyExport,
    onDraftKeyChange: editSession.onDraftKeyChange,
    onDraftValueChange: editSession.onDraftValueChange,
    onImport: transferActions.onImport,
    onOpenAddSecret: editSession.onOpenAddSecret,
    onOpenImportModal: editSession.onOpenImportModal,
    onReveal: revealActions.onReveal,
    onRetry: () => secretsQuery.refetch(),
    onSaveEdit: saveActions.onSaveEdit,
    onStartValueEdit: revealActions.onStartValueEdit,
    onToggleDelete: editSession.onToggleDelete,
    rows,
  }
}

export type SecretsEditorState = ReturnType<typeof useSecretsEditor>

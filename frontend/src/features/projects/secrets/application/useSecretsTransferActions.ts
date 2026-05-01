import { useToast } from '../../../../shared/components/toast/useToast.ts'
import { getErrorMessage } from './secretsOperationMessages.ts'
import type { UseSecretsMutationsResult } from './useSecretsMutations.ts'

interface UseSecretsTransferActionsOptions {
  hasUnsavedChanges: boolean
  handleCancelEdit: () => void
  handleCloseImportModal: () => void
  mutations: UseSecretsMutationsResult
}

export function useSecretsTransferActions({
  hasUnsavedChanges,
  handleCancelEdit,
  handleCloseImportModal,
  mutations,
}: UseSecretsTransferActionsOptions) {
  const { addToast } = useToast()

  async function handleImport(content: string) {
    try {
      await mutations.importSecrets.mutateAsync(content)
      addToast({
        message: 'Secrets imported',
        type: 'success',
      })
      if (hasUnsavedChanges) {
        handleCancelEdit()
      }
      handleCloseImportModal()
    } catch (error) {
      addToast({
        message: getErrorMessage(error, 'Failed to import secrets'),
        type: 'error',
      })
      throw error
    }
  }

  async function handleCopyExport() {
    try {
      const exportedSecrets = await mutations.exportSecrets.mutateAsync()
      await navigator.clipboard.writeText(exportedSecrets)
      addToast({
        message: 'Secrets export copied',
        type: 'success',
      })
    } catch (error) {
      addToast({
        message: getErrorMessage(error, 'Failed to copy secrets export'),
        type: 'error',
      })
    }
  }

  return {
    onCopyExport: handleCopyExport,
    onImport: handleImport,
  }
}

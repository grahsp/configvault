import { toast } from 'sonner'
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
  async function handleImport(content: string) {
    try {
      await mutations.importSecrets.mutateAsync(content)
      toast.success('Secrets imported')
      if (hasUnsavedChanges) {
        handleCancelEdit()
      }
      handleCloseImportModal()
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to import secrets'))
      throw error
    }
  }

  async function handleCopyExport() {
    try {
      const exportedSecrets = await mutations.exportSecrets.mutateAsync()
      await navigator.clipboard.writeText(exportedSecrets)
      toast.success('Secrets export copied')
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to copy secrets export'))
    }
  }

  return {
    onCopyExport: handleCopyExport,
    onImport: handleImport,
  }
}

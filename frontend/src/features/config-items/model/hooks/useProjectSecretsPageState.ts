import { useState } from 'react'
import { useToast } from '../../../../shared/components/toast/useToast.ts'
import { useExportConfigItems } from './useExportConfigItems.ts'

export function useProjectSecretsPageState(
  projectId: string,
  environmentName: string,
) {
  const { addToast } = useToast()
  const [focusedConfigItemId, setFocusedConfigItemId] = useState<string | null>(
    null,
  )
  const exportConfigItemsMutation = useExportConfigItems(
    projectId,
    environmentName,
  )

  async function handleCopyExport() {
    try {
      const exportedSecrets = await exportConfigItemsMutation.mutateAsync()
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
    focusedConfigItemId,
    isCopyingExport: exportConfigItemsMutation.isPending,
    onCopyExport: handleCopyExport,
    onFocusConfigItem: setFocusedConfigItemId,
  }
}

function getErrorMessage(error: unknown, fallbackMessage: string) {
  return error instanceof Error ? error.message : fallbackMessage
}

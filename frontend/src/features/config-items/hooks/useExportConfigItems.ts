import { useMutation } from '@tanstack/react-query'
import { exportConfigItems } from '../api/configItemsApi'
import { useAuthenticatedConfigItemsClient } from './useConfigItems'

export function useExportConfigItems(projectId: string, environmentName: string) {
  const client = useAuthenticatedConfigItemsClient()

  return useMutation<string, Error>({
    mutationFn: () => exportConfigItems(client, projectId, environmentName),
  })
}

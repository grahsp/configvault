import { useMutation } from '@tanstack/react-query'
import { useAuthenticatedApiClient } from '../../../shared/api/useAuthenticatedApiClient'
import { exportConfigItems } from '../api/configItemsApi'

export function useExportConfigItems(projectId: string, environmentName: string) {
  const client = useAuthenticatedApiClient()

  return useMutation<string, Error>({
    mutationFn: () => exportConfigItems(client, projectId, environmentName),
  })
}

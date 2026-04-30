import { useMutation } from '@tanstack/react-query'
import { useAuthenticatedApiClient } from '../../../../shared/api/useAuthenticatedApiClient.ts'
import { exportConfigItems } from '../../api'

export function useExportConfigItems(projectId: string, environmentName: string) {
  const client = useAuthenticatedApiClient()

  return useMutation<string, Error>({
    mutationFn: () => exportConfigItems(client, projectId, environmentName),
  })
}

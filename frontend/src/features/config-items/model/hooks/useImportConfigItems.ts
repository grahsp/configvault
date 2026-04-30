import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthenticatedApiClient } from '../../../../shared/api/useAuthenticatedApiClient.ts'
import { importConfigItems } from '../../api'
import { configItemQueryKeys } from '../configItemQueryKeys.ts'

export function useImportConfigItems(projectId: string, environmentName: string) {
  const client = useAuthenticatedApiClient()
  const queryClient = useQueryClient()
  const queryKey = configItemQueryKeys.list(projectId, environmentName)

  return useMutation<void, Error, string>({
    mutationFn: (content) =>
      importConfigItems(client, projectId, environmentName, content),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  })
}

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { importConfigItems } from '../api/configItemsApi'
import { configItemQueryKeys } from './configItemQueryKeys'
import { useAuthenticatedConfigItemsClient } from './useConfigItems'

export function useImportConfigItems(projectId: string, environmentName: string) {
  const client = useAuthenticatedConfigItemsClient()
  const queryClient = useQueryClient()
  const queryKey = configItemQueryKeys.list(projectId, environmentName)

  return useMutation<void, Error, string>({
    mutationFn: (content) =>
      importConfigItems(client, projectId, environmentName, content),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  })
}

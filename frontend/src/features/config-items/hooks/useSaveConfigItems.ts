import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthenticatedApiClient } from '../../../shared/api/useAuthenticatedApiClient'
import {
  saveConfigItems,
  type ConfigItemBatchOperation,
} from '../api/configItemsApi'
import { configItemQueryKeys } from './configItemQueryKeys'

interface SaveConfigItemsVariables {
  operations: ConfigItemBatchOperation[]
}

export function useSaveConfigItems(projectId: string, environmentName: string) {
  const client = useAuthenticatedApiClient()
  const queryClient = useQueryClient()
  const queryKey = configItemQueryKeys.list(projectId, environmentName)

  return useMutation<void, Error, SaveConfigItemsVariables>({
    mutationFn: ({ operations }) =>
      saveConfigItems(client, projectId, environmentName, operations),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  })
}

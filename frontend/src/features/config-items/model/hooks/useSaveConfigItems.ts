import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthenticatedApiClient } from '../../../../shared/api/useAuthenticatedApiClient.ts'
import {
  saveConfigItems,
  type ConfigItemBatchOperation,
} from '../../api'
import { configItemQueryKeys } from '../configItemQueryKeys.ts'

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

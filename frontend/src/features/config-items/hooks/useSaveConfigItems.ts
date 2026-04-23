import { useMutation, useQueryClient } from '@tanstack/react-query'
import { saveConfigItems } from '../api/configItemsApi'
import { configItemQueryKeys } from './configItemQueryKeys'
import { useAuthenticatedConfigItemsClient } from './useConfigItems'

interface SaveConfigItemsUpdate {
  configItemId: string
  key?: string
  value?: string
}

interface SaveConfigItemsVariables {
  deleteConfigItemIds: string[]
  updates: SaveConfigItemsUpdate[]
}

export function useSaveConfigItems(projectId: string, environmentName: string) {
  const client = useAuthenticatedConfigItemsClient()
  const queryClient = useQueryClient()
  const queryKey = configItemQueryKeys.list(projectId, environmentName)

  return useMutation<void, Error, SaveConfigItemsVariables>({
    mutationFn: ({ deleteConfigItemIds, updates }) =>
      saveConfigItems(
        client,
        projectId,
        environmentName,
        updates,
        deleteConfigItemIds,
      ),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  })
}

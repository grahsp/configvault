import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteConfigItem } from '../api/configItemsApi'
import type { ConfigItem } from '../types/ConfigItem'
import { configItemQueryKeys } from './configItemQueryKeys'
import { useAuthenticatedConfigItemsClient } from './useConfigItems'

interface DeleteConfigItemContext {
  previousConfigItems?: ConfigItem[]
}

export function useDeleteConfigItem(projectId: string) {
  const client = useAuthenticatedConfigItemsClient()
  const queryClient = useQueryClient()
  const queryKey = configItemQueryKeys.list(projectId)

  return useMutation<void, Error, string, DeleteConfigItemContext>({
    mutationFn: (configItemId: string) =>
      deleteConfigItem(client, projectId, configItemId),
    onMutate: async (configItemId) => {
      await queryClient.cancelQueries({ queryKey })

      const previousConfigItems = queryClient.getQueryData<ConfigItem[]>(
        queryKey,
      )

      queryClient.setQueryData<ConfigItem[]>(queryKey, (current = []) =>
        current.filter((configItem) => configItem.id !== configItemId),
      )

      return { previousConfigItems }
    },
    onError: (_error, _configItemId, context) => {
      queryClient.setQueryData(queryKey, context?.previousConfigItems)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  })
}

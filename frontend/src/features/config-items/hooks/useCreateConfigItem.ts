import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createConfigItem } from '../api/configItemsApi'
import type { ConfigItem } from '../types/ConfigItem'
import { configItemQueryKeys } from './configItemQueryKeys'
import { useAuthenticatedConfigItemsClient } from './useConfigItems'

interface CreateConfigItemContext {
  optimisticId: string
  previousConfigItems?: ConfigItem[]
}

export function useCreateConfigItem(projectId: string) {
  const client = useAuthenticatedConfigItemsClient()
  const queryClient = useQueryClient()
  const queryKey = configItemQueryKeys.list(projectId)

  return useMutation<ConfigItem, Error, string, CreateConfigItemContext>({
    mutationFn: (key: string) => createConfigItem(client, projectId, key),
    onMutate: async (key) => {
      await queryClient.cancelQueries({ queryKey })

      const previousConfigItems = queryClient.getQueryData<ConfigItem[]>(
        queryKey,
      )
      const optimisticId = `optimistic-${Date.now()}`
      const optimisticConfigItem: ConfigItem = {
        id: optimisticId,
        key,
        createdAt: new Date().toISOString(),
      }

      queryClient.setQueryData<ConfigItem[]>(queryKey, (current = []) => [
        ...current,
        optimisticConfigItem,
      ])

      return { optimisticId, previousConfigItems }
    },
    onError: (_error, _key, context) => {
      queryClient.setQueryData(queryKey, context?.previousConfigItems)
    },
    onSuccess: (createdConfigItem, _key, context) => {
      queryClient.setQueryData<ConfigItem[]>(queryKey, (current = []) =>
        current.map((configItem) =>
          configItem.id === context.optimisticId
            ? createdConfigItem
            : configItem,
        ),
      )

      return queryClient.invalidateQueries({ queryKey })
    },
  })
}

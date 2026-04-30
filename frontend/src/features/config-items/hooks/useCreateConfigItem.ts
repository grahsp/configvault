import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthenticatedApiClient } from '../../../shared/api/useAuthenticatedApiClient'
import { createConfigItem } from '../api/configItemsApi'
import type { ConfigItem } from '../types/ConfigItem'
import { configItemQueryKeys } from './configItemQueryKeys'

interface CreateConfigItemContext {
  previousConfigItems?: ConfigItem[]
}

export function useCreateConfigItem(projectId: string, environmentName: string) {
  const client = useAuthenticatedApiClient()
  const queryClient = useQueryClient()
  const queryKey = configItemQueryKeys.list(projectId, environmentName)

  return useMutation<void, Error, string, CreateConfigItemContext>({
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
        hasValue: false,
      }

      queryClient.setQueryData<ConfigItem[]>(queryKey, (current = []) => [
        ...current,
        optimisticConfigItem,
      ])

      return { previousConfigItems }
    },
    onError: (_error, _key, context) => {
      queryClient.setQueryData(queryKey, context?.previousConfigItems)
    },
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey })
    },
  })
}

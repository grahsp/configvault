import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthenticatedApiClient } from '../../../../shared/api/useAuthenticatedApiClient.ts'
import { deleteConfigItem } from '../../api'
import type { ConfigItem } from '../configItem.types.ts'
import { configItemQueryKeys } from '../configItemQueryKeys.ts'

interface DeleteConfigItemContext {
  previousConfigItems?: ConfigItem[]
}

export function useDeleteConfigItem(projectId: string, environmentName: string) {
  const client = useAuthenticatedApiClient()
  const queryClient = useQueryClient()
  const queryKey = configItemQueryKeys.list(projectId, environmentName)

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

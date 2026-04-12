import { useMutation, useQueryClient } from '@tanstack/react-query'
import { renameConfigItem } from '../api/configItemsApi'
import type { ConfigItem } from '../types/ConfigItem'
import { configItemQueryKeys } from './configItemQueryKeys'
import { useAuthenticatedConfigItemsClient } from './useConfigItems'

interface RenameConfigItemVariables {
  configItemId: string
  key: string
}

interface RenameConfigItemContext {
  previousConfigItems?: ConfigItem[]
}

export function useRenameConfigItem(projectId: string) {
  const client = useAuthenticatedConfigItemsClient()
  const queryClient = useQueryClient()
  const queryKey = configItemQueryKeys.list(projectId)

  return useMutation<
    ConfigItem,
    Error,
    RenameConfigItemVariables,
    RenameConfigItemContext
  >({
    mutationFn: ({ configItemId, key }) =>
      renameConfigItem(client, projectId, configItemId, key),
    onMutate: async ({ configItemId, key }) => {
      await queryClient.cancelQueries({ queryKey })

      const previousConfigItems = queryClient.getQueryData<ConfigItem[]>(
        queryKey,
      )

      queryClient.setQueryData<ConfigItem[]>(queryKey, (current = []) =>
        current.map((configItem) =>
          configItem.id === configItemId
            ? { ...configItem, key }
            : configItem,
        ),
      )

      return { previousConfigItems }
    },
    onError: (_error, _variables, context) => {
      queryClient.setQueryData(queryKey, context?.previousConfigItems)
    },
    onSuccess: (renamedConfigItem) => {
      queryClient.setQueryData<ConfigItem[]>(queryKey, (current = []) =>
        current.map((configItem) =>
          configItem.id === renamedConfigItem.id
            ? renamedConfigItem
            : configItem,
        ),
      )

      return queryClient.invalidateQueries({ queryKey })
    },
  })
}

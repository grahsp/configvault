import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthenticatedApiClient } from '../../../../shared/api/useAuthenticatedApiClient.ts'
import { renameConfigItem } from '../../api'
import type { ConfigItem } from '../configItem.types.ts'
import { configItemQueryKeys } from '../configItemQueryKeys.ts'

interface RenameConfigItemVariables {
  configItemId: string
  key: string
}

interface RenameConfigItemContext {
  previousConfigItems?: ConfigItem[]
}

export function useRenameConfigItem(projectId: string, environmentName: string) {
  const client = useAuthenticatedApiClient()
  const queryClient = useQueryClient()
  const queryKey = configItemQueryKeys.list(projectId, environmentName)

  return useMutation<
    void,
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
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  })
}

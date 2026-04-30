import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthenticatedApiClient } from '../../../shared/api/useAuthenticatedApiClient'
import { upsertConfigItemValue } from '../api/configItemsApi'
import type { ConfigItem } from '../types/ConfigItem'
import { configItemQueryKeys } from './configItemQueryKeys'

interface UpsertConfigItemValueVariables {
  configItemId: string
  value: string
}

export function useUpsertConfigItemValue(
  projectId: string,
  environmentName: string,
) {
  const client = useAuthenticatedApiClient()
  const queryClient = useQueryClient()
  const queryKey = configItemQueryKeys.list(projectId, environmentName)

  return useMutation<void, Error, UpsertConfigItemValueVariables>({
    mutationFn: ({ configItemId, value }) =>
      upsertConfigItemValue(
        client,
        projectId,
        configItemId,
        environmentName,
        value,
      ),
    onSuccess: (_data, { configItemId }) => {
      queryClient.setQueryData<ConfigItem[]>(queryKey, (current = []) =>
        current.map((configItem) =>
          configItem.id === configItemId
            ? { ...configItem, hasValue: true }
            : configItem,
        ),
      )
    },
  })
}

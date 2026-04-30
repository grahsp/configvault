import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthenticatedApiClient } from '../../../../shared/api/useAuthenticatedApiClient.ts'
import { upsertConfigItemValue } from '../../api'
import type { ConfigItem } from '../configItem.types.ts'
import { configItemQueryKeys } from '../configItemQueryKeys.ts'

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

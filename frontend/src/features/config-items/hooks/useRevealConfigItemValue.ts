import { useMutation } from '@tanstack/react-query'
import { useAuthenticatedApiClient } from '../../../shared/api/useAuthenticatedApiClient'
import { getConfigItemValue } from '../api/configItemsApi'
import type { ConfigItemValue } from '../types/ConfigItem'

interface RevealConfigItemValueVariables {
  configItemId: string
}

export function useRevealConfigItemValue(
  projectId: string,
  environmentName: string,
) {
  const client = useAuthenticatedApiClient()

  return useMutation<ConfigItemValue, Error, RevealConfigItemValueVariables>({
    mutationFn: ({ configItemId }) =>
      getConfigItemValue(client, projectId, configItemId, environmentName),
  })
}

import { useMutation } from '@tanstack/react-query'
import { getConfigItemValue } from '../api/configItemsApi'
import type { ConfigItemValue } from '../types/ConfigItem'
import { useAuthenticatedConfigItemsClient } from './useConfigItems'

interface RevealConfigItemValueVariables {
  configItemId: string
}

export function useRevealConfigItemValue(
  projectId: string,
  environmentName: string,
) {
  const client = useAuthenticatedConfigItemsClient()

  return useMutation<ConfigItemValue, Error, RevealConfigItemValueVariables>({
    mutationFn: ({ configItemId }) =>
      getConfigItemValue(client, projectId, configItemId, environmentName),
  })
}

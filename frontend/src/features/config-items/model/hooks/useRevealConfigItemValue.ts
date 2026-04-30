import { useMutation } from '@tanstack/react-query'
import { useAuthenticatedApiClient } from '../../../../shared/api/useAuthenticatedApiClient.ts'
import { getConfigItemValue } from '../../api'
import type { ConfigItemValue } from '../configItem.types.ts'

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

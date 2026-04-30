import { useQuery } from '@tanstack/react-query'
import { useAuthenticatedApiClient } from '../../../shared/api/useAuthenticatedApiClient'
import { getConfigItems } from '../api/configItemsApi'
import { configItemQueryKeys } from './configItemQueryKeys'

export function useConfigItems(projectId: string, environmentName: string) {
  const client = useAuthenticatedApiClient()

  return useQuery({
    queryKey: configItemQueryKeys.list(projectId, environmentName),
    queryFn: () => getConfigItems(client, projectId, environmentName),
    enabled: Boolean(projectId && environmentName),
  })
}

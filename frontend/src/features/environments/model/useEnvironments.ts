import { useQuery } from '@tanstack/react-query'
import { useAuthenticatedApiClient } from '../../../shared/api/useAuthenticatedApiClient'
import { getEnvironments } from '../api/environmentsApi'
import { environmentQueryKeys } from './environmentQueryKeys'

export function useEnvironments(projectId: string) {
  const client = useAuthenticatedApiClient()

  return useQuery({
    queryKey: environmentQueryKeys.list(projectId),
    queryFn: () => getEnvironments(client, projectId),
    enabled: Boolean(projectId),
  })
}

import { useQuery } from '@tanstack/react-query'
import { useAuthenticatedApiClient } from '../../../../shared/api/useAuthenticatedApiClient.ts'
import { getEnvironments } from '../api/environmentsApi.ts'
import { environmentQueryKeys } from './environmentQueryKeys.ts'

export function useEnvironments(projectId: string) {
  const client = useAuthenticatedApiClient()

  return useQuery({
    queryKey: environmentQueryKeys.list(projectId),
    queryFn: () => getEnvironments(client, projectId),
    enabled: Boolean(projectId),
  })
}

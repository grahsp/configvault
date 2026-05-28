import { useQuery } from '@tanstack/react-query'
import { useAuthenticatedApiClient } from '@/features/auth/api'
import { getEnvironments } from '../api/environmentsApi.ts'
import { environmentQueryKeys } from './environmentQueryKeys.ts'

export function useEnvironments(projectId: string, enabled = true) {
  const client = useAuthenticatedApiClient()

  return useQuery({
    queryKey: environmentQueryKeys.list(projectId),
    queryFn: () => getEnvironments(client, projectId),
    enabled: Boolean(projectId) && enabled,
  })
}

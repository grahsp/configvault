import { useQuery } from '@tanstack/react-query'
import { useAuthenticatedApiClient } from '@/features/auth/api'
import { getSecrets } from '../api'
import { secretsQueryKeys } from './secretsQueryKeys.ts'

export function useSecretsQuery(projectId: string, environmentName: string) {
  const client = useAuthenticatedApiClient()

  return useQuery({
    queryKey: secretsQueryKeys.list(projectId, environmentName),
    queryFn: () => getSecrets(client, projectId, environmentName),
    enabled: Boolean(projectId && environmentName),
  })
}

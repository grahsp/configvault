import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { createApiClient } from '../../../api/apiClient'
import { useAuth } from '../../../shared/hooks/useAuth'
import { getEnvironments } from '../api/environmentsApi'
import { environmentQueryKeys } from './environmentQueryKeys'

export function useAuthenticatedEnvironmentClient() {
  const { getAccessTokenSilently } = useAuth()

  return useMemo(
    () => createApiClient({ getAccessTokenSilently }),
    [getAccessTokenSilently],
  )
}

export function useEnvironments(projectId: string) {
  const client = useAuthenticatedEnvironmentClient()

  return useQuery({
    queryKey: environmentQueryKeys.list(projectId),
    queryFn: () => getEnvironments(client, projectId),
    enabled: Boolean(projectId),
  })
}

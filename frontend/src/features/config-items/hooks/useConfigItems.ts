import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { createApiClient } from '../../../api/apiClient'
import { useAuth } from '../../../shared/hooks/useAuth'
import { getConfigItems } from '../api/configItemsApi'
import { configItemQueryKeys } from './configItemQueryKeys'

export function useAuthenticatedConfigItemsClient() {
  const { getAccessTokenSilently } = useAuth()

  return useMemo(
    () => createApiClient({ getAccessTokenSilently }),
    [getAccessTokenSilently],
  )
}

export function useConfigItems(projectId: string, environmentName: string) {
  const client = useAuthenticatedConfigItemsClient()

  return useQuery({
    queryKey: configItemQueryKeys.list(projectId, environmentName),
    queryFn: () => getConfigItems(client, projectId, environmentName),
    enabled: Boolean(projectId && environmentName),
  })
}

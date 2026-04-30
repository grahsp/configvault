import { useMemo } from 'react'
import { createApiClient } from '../../api/apiClient'
import { useAuth } from '../hooks/useAuth'

export function useAuthenticatedApiClient() {
  const { getAccessTokenSilently } = useAuth()

  return useMemo(
    () => createApiClient({ getAccessTokenSilently }),
    [getAccessTokenSilently],
  )
}

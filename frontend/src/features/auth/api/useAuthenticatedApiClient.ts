import { useMemo } from 'react'
import { createApiClient } from '@/api/apiClient'
import { useAuth } from '@/features/auth/hooks'

export function useAuthenticatedApiClient() {
  const { getAccessTokenSilently, getAccessTokenSilentlySafe } = useAuth()
  const accessTokenGetter =
    getAccessTokenSilentlySafe ?? getAccessTokenSilently

  return useMemo(
    () => createApiClient({ getAccessTokenSilently: accessTokenGetter }),
    [accessTokenGetter],
  )
}

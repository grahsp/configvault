import {
  type PropsWithChildren,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { createApiClient } from '../../../api/apiClient'
import { CurrentUserContext } from '../../../shared/hooks/currentUserContext'
import { useAuth } from '../../../shared/hooks/useAuth'
import type { CurrentUser } from '../../../shared/utils/currentUserTypes'

export function CurrentUserProvider({ children }: PropsWithChildren) {
  const { getAccessTokenSilently, isAuthenticated } = useAuth()
  const [currentUser, setCurrentUser] = useState<CurrentUser>()
  const [error, setError] = useState<Error>()
  const [isLoading, setIsLoading] = useState(false)
  const requestIdRef = useRef(0)

  const refreshCurrentUser = useCallback(async () => {
    if (!isAuthenticated) {
      requestIdRef.current += 1
      setCurrentUser(undefined)
      setError(undefined)
      setIsLoading(false)
      return undefined
    }

    const requestId = requestIdRef.current + 1
    requestIdRef.current = requestId
    setIsLoading(true)
    setError(undefined)

    try {
      const client = createApiClient({ getAccessTokenSilently })
      const user = await client.request<CurrentUser>('/me')

      if (requestIdRef.current !== requestId) {
        return user
      }

      setCurrentUser(user)
      setIsLoading(false)
      return user
    } catch (error: unknown) {
      if (requestIdRef.current !== requestId) {
        throw error
      }

      console.error('Failed to load current user', error)
      setCurrentUser(undefined)
      setError(
        error instanceof Error
          ? error
          : new Error('Failed to load current user'),
      )
      setIsLoading(false)
      throw error
    }
  }, [getAccessTokenSilently, isAuthenticated])

  useEffect(() => {
    async function loadCurrentUser() {
      await refreshCurrentUser()
    }

    loadCurrentUser().catch(() => {
      // Errors are exposed through context state.
    })
  }, [refreshCurrentUser])

  return (
    <CurrentUserContext.Provider
      value={{
        user: isAuthenticated && !isLoading ? currentUser : undefined,
        isLoading: isAuthenticated ? isLoading : false,
        error: isAuthenticated ? error : undefined,
        refreshCurrentUser,
      }}
    >
      {children}
    </CurrentUserContext.Provider>
  )
}

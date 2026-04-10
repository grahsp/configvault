import { type PropsWithChildren, useEffect, useState } from 'react'
import { createApiClient } from '../api/apiClient'
import type { CurrentUser } from '../features/user/types'
import { CurrentUserContext } from './currentUserContext'
import { useAuth } from './useAuth'

export function CurrentUserProvider({ children }: PropsWithChildren) {
  const { getAccessTokenSilently, isAuthenticated } = useAuth()
  const [currentUser, setCurrentUser] = useState<CurrentUser>()
  const [error, setError] = useState<Error>()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      return
    }

    let isCancelled = false

    async function loadCurrentUser() {
      setIsLoading(true)
      setError(undefined)

      try {
        const client = createApiClient({ getAccessTokenSilently })
        const user = await client.request<CurrentUser>('/me')

        if (isCancelled) {
          return
        }

        setCurrentUser(user)
        setIsLoading(false)
      } catch (error: unknown) {
        if (isCancelled) {
          return
        }

        console.error('Failed to load current user', error)
        setCurrentUser(undefined)
        setError(
          error instanceof Error
            ? error
            : new Error('Failed to load current user'),
        )
        setIsLoading(false)
      }
    }

    loadCurrentUser().catch(() => {
      // Errors are handled in loadCurrentUser to keep state updates in one place.
    })

    return () => {
      isCancelled = true
    }
  }, [getAccessTokenSilently, isAuthenticated])

  return (
    <CurrentUserContext.Provider
      value={{
        user: isAuthenticated && !isLoading ? currentUser : undefined,
        isLoading: isAuthenticated ? isLoading : false,
        error: isAuthenticated ? error : undefined,
      }}
    >
      {children}
    </CurrentUserContext.Provider>
  )
}

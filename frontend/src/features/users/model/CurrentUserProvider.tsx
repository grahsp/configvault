import {
  type PropsWithChildren,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { useAuth } from '../../../shared/hooks/useAuth'
import { getCurrentUser } from '../api/getCurrentUser'
import { CurrentUserContext } from './currentUserContext'
import type { CurrentUser } from './currentUser.ts'

export function CurrentUserProvider({ children }: PropsWithChildren) {
  const { getAccessTokenSilentlySafe, isAuthenticated } = useAuth()
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
      const user = await getCurrentUser(getAccessTokenSilentlySafe)

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
  }, [getAccessTokenSilentlySafe, isAuthenticated])

  useEffect(() => {
    if (isAuthenticated) {
      return
    }

    requestIdRef.current += 1
    setCurrentUser(undefined)
    setError(undefined)
    setIsLoading(false)
  }, [isAuthenticated])

  return (
    <CurrentUserContext.Provider
      value={{
        user: isAuthenticated ? currentUser : undefined,
        isLoading: isAuthenticated ? isLoading : false,
        error: isAuthenticated ? error : undefined,
        refreshCurrentUser,
      }}
    >
      {children}
    </CurrentUserContext.Provider>
  )
}

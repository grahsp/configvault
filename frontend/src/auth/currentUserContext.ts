import { createContext, useContext } from 'react'
import type { CurrentUser } from '../features/user/types'

export interface CurrentUserContextValue {
  user?: CurrentUser
  isLoading: boolean
  error?: Error
}

export const CurrentUserContext = createContext<
  CurrentUserContextValue | undefined
>(undefined)

export function useCurrentUserContext() {
  const context = useContext(CurrentUserContext)

  if (!context) {
    throw new Error(
      'useCurrentUser must be used within a CurrentUserProvider',
    )
  }

  return context
}

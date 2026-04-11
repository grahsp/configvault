import {
  useCurrentUserContext,
} from '../../auth/context/currentUserContext'
import type { CurrentUserContextValue } from '../../auth/context/currentUserContext'

export type UseCurrentUserResult = CurrentUserContextValue

export function useCurrentUser(): UseCurrentUserResult {
  return useCurrentUserContext()
}

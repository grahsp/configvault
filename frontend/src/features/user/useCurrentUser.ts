import {
  useCurrentUserContext,
} from '../../auth/currentUserContext'
import type { CurrentUserContextValue } from '../../auth/currentUserContext'

export type UseCurrentUserResult = CurrentUserContextValue

export function useCurrentUser(): UseCurrentUserResult {
  return useCurrentUserContext()
}

import {
  useCurrentUserContext,
} from './currentUserContext'
import type { CurrentUserContextValue } from './currentUserContext'

export type UseCurrentUserResult = CurrentUserContextValue

export function useCurrentUser(): UseCurrentUserResult {
  return useCurrentUserContext()
}

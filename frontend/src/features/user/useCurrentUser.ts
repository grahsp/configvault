import { useAuth } from '../../auth/useAuth'
import type { User } from '@auth0/auth0-react'

export function useCurrentUser(): User | undefined {
  const { user } = useAuth()

  return user
}

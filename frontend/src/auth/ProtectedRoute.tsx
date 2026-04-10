import type { PropsWithChildren } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { Navigate } from 'react-router-dom'
import { useCurrentUser } from '../features/user/useCurrentUser'

export function ProtectedRoute({ children }: PropsWithChildren) {
  const { isAuthenticated, isLoading } = useAuth0()
  const { user, isLoading: isCurrentUserLoading, error } = useCurrentUser()

  if (isLoading) {
    return <p>Loading...</p>
  }

  if (!isAuthenticated) {
    return <Navigate replace to="/" />
  }

  if (isCurrentUserLoading) {
    return <p>Loading user data...</p>
  }

  if (error) {
    return <p role="alert">Unable to load user data. Please try again.</p>
  }

  if (user?.status === 'Pending') {
    return <Navigate replace to="/activate" />
  }

  return <>{children}</>
}

export function ActivationRoute({ children }: PropsWithChildren) {
  const { isAuthenticated, isLoading } = useAuth0()
  const { user, isLoading: isCurrentUserLoading, error } = useCurrentUser()

  if (isLoading) {
    return <p>Loading...</p>
  }

  if (!isAuthenticated) {
    return <Navigate replace to="/" />
  }

  if (isCurrentUserLoading) {
    return <p>Loading user data...</p>
  }

  if (error) {
    return <p role="alert">Unable to load user data. Please try again.</p>
  }

  if (user?.status === 'Active') {
    return <Navigate replace to="/projects" />
  }

  return <>{children}</>
}

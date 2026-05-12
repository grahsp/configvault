import type { PropsWithChildren } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { Navigate } from 'react-router-dom'
import { PageLoader } from '../../../shared/ui'
import { useCurrentUser } from '../../users'

export function ProtectedRoute({ children }: PropsWithChildren) {
  const { isAuthenticated, isLoading } = useAuth0()
  const { isLoading: isCurrentUserLoading, error } = useCurrentUser()

  if (isLoading) {
    return <PageLoader fullScreen={false} />
  }

  if (!isAuthenticated) {
    return <Navigate replace to="/" />
  }

  if (isCurrentUserLoading) {
    return <PageLoader fullScreen={false} />
  }

  if (error) {
    return <p role="alert">Unable to load user data. Please try again.</p>
  }
  return <>{children}</>
}

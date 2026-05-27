import type { PropsWithChildren } from 'react'
import { useEffect, useRef } from 'react'
import { PageLoader } from '@/components/composed/PageLoader.tsx'
import { useAuth } from '@/shared/hooks/useAuth.ts'

export function ProtectedRoute({ children }: PropsWithChildren) {
  const { isAuthenticated, isLoading, login } = useAuth()
  const hasStartedLoginRef = useRef(false)

  useEffect(() => {
    if (isLoading || isAuthenticated || hasStartedLoginRef.current) {
      return
    }

    hasStartedLoginRef.current = true
    void login({
      returnTo: `${window.location.pathname}${window.location.search}${window.location.hash}`,
    }).catch(() => {
      hasStartedLoginRef.current = false
    })
  }, [isAuthenticated, isLoading, login])

  if (isLoading) {
    return <PageLoader fullScreen={false} />
  }

  if (!isAuthenticated) {
    return <PageLoader fullScreen={false} />
  }

  return <>{children}</>
}

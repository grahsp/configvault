import type { PropsWithChildren } from 'react'
import { Auth0Provider } from '@auth0/auth0-react'
import { authAuthorizationParams, authConfig } from '../../../shared/utils/authConfig'

export function AuthProvider({ children }: PropsWithChildren) {
  return (
    <Auth0Provider
      domain={authConfig.domain}
      clientId={authConfig.clientId}
      authorizationParams={authAuthorizationParams}
    >
      {children}
    </Auth0Provider>
  )
}

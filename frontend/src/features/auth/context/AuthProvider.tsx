import type { PropsWithChildren } from 'react'
import { Auth0Provider } from '@auth0/auth0-react'
import { authAuthorizationParams, authConfig } from '../../../shared/utils/authConfig'
import {
  resolveAuthRedirectTarget,
  type AuthRedirectState,
} from '../utils/authRedirectState'

export function AuthProvider({ children }: PropsWithChildren) {
  return (
    <Auth0Provider
      domain={authConfig.domain}
      clientId={authConfig.clientId}
      onRedirectCallback={(appState) => {
        const target = resolveAuthRedirectTarget(appState as AuthRedirectState)

        window.location.replace(target)
      }}
      authorizationParams={authAuthorizationParams}
    >
      {children}
    </Auth0Provider>
  )
}

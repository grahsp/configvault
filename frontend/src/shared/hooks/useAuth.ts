import { useAuth0 } from '@auth0/auth0-react'
import { authConfig } from '../utils/authConfig'

export interface AuthRedirectOptions {
  authorizationParams?: Record<string, string>
  returnTo?: string
}

export function useAuth() {
  const auth = useAuth0()

  const login = (options?: AuthRedirectOptions) =>
    auth.loginWithRedirect({
      appState: options?.returnTo ? { returnTo: options.returnTo } : undefined,
      authorizationParams: options?.authorizationParams,
    })

  const signup = (options?: AuthRedirectOptions) =>
    auth.loginWithRedirect({
      appState: options?.returnTo ? { returnTo: options.returnTo } : undefined,
      authorizationParams: {
        ...options?.authorizationParams,
        screen_hint: 'signup',
      },
    })

  const logout = () =>
    auth.logout({
      logoutParams: { returnTo: authConfig.redirectUri },
    })

  return {
    ...auth,
    login,
    signup,
    logout,
  }
}

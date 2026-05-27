import { useAuth0 } from '@auth0/auth0-react'
import { authConfig } from '@/features/auth/config'

export interface AuthRedirectOptions {
  authorizationParams?: Record<string, string>
  returnTo?: string
}

function getCurrentReturnTo() {
  const { hash, pathname, search } = window.location

  return `${pathname}${search}${hash}`
}

export function useAuth() {
  const auth = useAuth0()

  const login = (options?: AuthRedirectOptions) =>
    auth.loginWithRedirect({
      appState: options?.returnTo ? { returnTo: options.returnTo } : undefined,
      authorizationParams: options?.authorizationParams,
    })

  const reauthenticate = (options?: AuthRedirectOptions) =>
    login({
      ...options,
      returnTo: options?.returnTo ?? getCurrentReturnTo(),
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
    getAccessTokenSilently: auth.getAccessTokenSilently,
    getAccessTokenSilentlySafe: auth.getAccessTokenSilently,
    login,
    signup,
    reauthenticate,
    logout,
  }
}

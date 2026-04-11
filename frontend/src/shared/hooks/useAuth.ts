import { useAuth0 } from '@auth0/auth0-react'
import { authConfig } from '../utils/authConfig'

export function useAuth() {
  const auth = useAuth0()

  const login = () => auth.loginWithRedirect()

  const signup = () =>
    auth.loginWithRedirect({
      authorizationParams: { screen_hint: 'signup' },
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

export interface AuthRedirectState {
  returnTo?: string
}

const DEFAULT_AUTH_REDIRECT_TARGET = '/projects'

export function resolveAuthRedirectTarget(state?: AuthRedirectState) {
  const returnTo = state?.returnTo?.trim()

  return returnTo || DEFAULT_AUTH_REDIRECT_TARGET
}

function requireEnvValue(name: 'VITE_AUTH0_DOMAIN' | 'VITE_AUTH0_CLIENT_ID' | 'VITE_AUTH0_LOGOUT_URI') {
  const value = import.meta.env[name]?.trim()

  if (!value) {
    throw new Error(`Missing required Auth0 environment variable: ${name}`)
  }

  return value
}

const audience = import.meta.env.VITE_AUTH0_AUDIENCE?.trim()

export const authConfig = {
  domain: requireEnvValue('VITE_AUTH0_DOMAIN'),
  clientId: requireEnvValue('VITE_AUTH0_CLIENT_ID'),
  logoutUri: requireEnvValue('VITE_AUTH0_LOGOUT_URI')
}

export const authorizationParams = {
  redirect_uri: window.location.origin,
  ...(audience ? { audience } : {}),
}

function requireEnvValue(name: 'VITE_AUTH0_DOMAIN' | 'VITE_AUTH0_CLIENT_ID') {
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
  audience: audience || undefined,
  redirectUri: window.location.origin,
}

export const authAuthorizationParams = {
  redirect_uri: authConfig.redirectUri,
  ...(authConfig.audience ? { audience: authConfig.audience } : {}),
}

export const authConfig = {
  domain: import.meta.env.VITE_AUTH0_DOMAIN,
  clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
  redirectUri: window.location.origin,
  audience: import.meta.env.VITE_AUTH0_AUDIENCE,
}

export const authAuthorizationParams = {
  redirect_uri: authConfig.redirectUri,
  ...(authConfig.audience ? { audience: authConfig.audience } : {}),
}

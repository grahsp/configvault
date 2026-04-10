import { authConfig } from '../auth/authConfig'

type AccessTokenGetter = () => Promise<string>

interface ApiClientOptions {
  getAccessTokenSilently: AccessTokenGetter
}

function buildApiUrl(path: string) {
  const baseUrl = import.meta.env.VITE_API_BASE_URL?.trim()

  if (!baseUrl) {
    return path
  }

  return new URL(path, `${baseUrl.replace(/\/+$/, '')}/`).toString()
}

export function createApiClient({
  getAccessTokenSilently,
}: ApiClientOptions) {
  return {
    async request<T>(path: string, init: RequestInit = {}): Promise<T> {
      const token = await getAccessTokenSilently()
      const headers = new Headers(init.headers)

      headers.set('Authorization', `Bearer ${token}`)

      if (init.body && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json')
      }

      const response = await fetch(buildApiUrl(path), {
        ...init,
        headers,
      })

      if (!response.ok) {
        throw new Error(
          `API request failed with status ${response.status} for ${path}`,
        )
      }

      if (response.status === 204) {
        return undefined as T
      }

      const responseText = await response.text()

      if (!responseText.trim()) {
        return undefined as T
      }

      return JSON.parse(responseText) as T
    },
  }
}

export const apiClient = createApiClient({
  getAccessTokenSilently: () => {
    throw new Error(
      `apiClient requires an Auth0 token getter. Use createApiClient() with getAccessTokenSilently for audience "${authConfig.audience ?? 'default'}".`,
    )
  },
})

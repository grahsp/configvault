import { buildApiError } from './errors/apiErrorParsing'
export { ApiError } from './errors/apiError'
export type {
  ApiErrorDetails,
  ApiErrorKind,
  ValidationErrors,
} from './errors/apiError'

export type AccessTokenGetter = () => Promise<string>

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
  async function execute(path: string, init: RequestInit = {}) {
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
      throw await buildApiError(response, path)
    }

    return response
  }

  return {
    async request<T>(path: string, init: RequestInit = {}): Promise<T> {
      const response = await execute(path, init)

      if (response.status === 204) {
        return undefined as T
      }

      const responseText = await response.text()

      if (!responseText.trim()) {
        return undefined as T
      }

      return JSON.parse(responseText) as T
    },
    async requestText(path: string, init: RequestInit = {}): Promise<string> {
      const response = await execute(path, init)

      if (response.status === 204) {
        return ''
      }

      return response.text()
    },
  }
}

export type ApiClient = ReturnType<typeof createApiClient>

export const apiClient = createApiClient({
  getAccessTokenSilently: () => {
    throw new Error(
      'apiClient requires an Auth0 token getter. Use createApiClient() with getAccessTokenSilently.',
    )
  },
})

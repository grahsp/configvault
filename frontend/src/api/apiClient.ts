import { authConfig } from '../auth/authConfig'

type AccessTokenGetter = () => Promise<string>

interface ApiClientOptions {
  getAccessTokenSilently: AccessTokenGetter
}

export type ApiErrorDetails = Record<string, unknown> | unknown[] | string | null

interface ParsedErrorBody {
  message?: string
  details?: ApiErrorDetails
}

export class ApiError extends Error {
  status: number
  details?: ApiErrorDetails

  constructor({
    details,
    message,
    status,
  }: {
    details?: ApiErrorDetails
    message: string
    status: number
  }) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

function buildApiUrl(path: string) {
  const baseUrl = import.meta.env.VITE_API_BASE_URL?.trim()

  if (!baseUrl) {
    return path
  }

  return new URL(path, `${baseUrl.replace(/\/+$/, '')}/`).toString()
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function readStringField(
  value: Record<string, unknown>,
  field: string,
): string | undefined {
  const fieldValue = value[field]

  return typeof fieldValue === 'string' && fieldValue.trim()
    ? fieldValue
    : undefined
}

function toApiErrorDetails(value: unknown): ApiErrorDetails | undefined {
  if (
    value === null ||
    typeof value === 'string' ||
    Array.isArray(value) ||
    isRecord(value)
  ) {
    return value
  }

  return undefined
}

function parseErrorBody(responseText: string): ParsedErrorBody {
  const trimmedResponseText = responseText.trim()

  if (!trimmedResponseText) {
    return {}
  }

  try {
    const parsedBody = JSON.parse(trimmedResponseText) as unknown

    if (!isRecord(parsedBody)) {
      return {
        details: toApiErrorDetails(parsedBody),
      }
    }

    const message =
      readStringField(parsedBody, 'message') ??
      readStringField(parsedBody, 'title') ??
      readStringField(parsedBody, 'error') ??
      readStringField(parsedBody, 'detail')

    return {
      message,
      details:
        toApiErrorDetails(parsedBody.errors) ?? toApiErrorDetails(parsedBody),
    }
  } catch {
    return {
      message: trimmedResponseText,
      details: trimmedResponseText,
    }
  }
}

async function buildApiError(response: Response, path: string) {
  const responseText = await response.text()
  const parsedError = parseErrorBody(responseText)

  return new ApiError({
    status: response.status,
    message:
      parsedError.message ??
      `API request failed with status ${response.status} for ${path}`,
    details: parsedError.details,
  })
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
        throw await buildApiError(response, path)
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

import {
  ApiError,
  type ApiErrorDetails,
  type ApiErrorKind,
  type ValidationErrors,
} from './apiError'

interface ParsedErrorBody {
  detail?: string
  message?: string
  details?: ApiErrorDetails
  validationErrors?: ValidationErrors
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

function toValidationErrors(value: unknown): ValidationErrors | undefined {
  if (!isRecord(value)) {
    return undefined
  }

  const validationErrors = Object.entries(value).reduce<ValidationErrors>(
    (errors, [field, fieldErrors]) => {
      if (!Array.isArray(fieldErrors)) {
        return errors
      }

      const messages = fieldErrors.filter(
        (fieldError): fieldError is string =>
          typeof fieldError === 'string' && Boolean(fieldError.trim()),
      )

      if (messages.length > 0) {
        errors[field] = messages
      }

      return errors
    },
    {},
  )

  return Object.keys(validationErrors).length > 0
    ? validationErrors
    : undefined
}

function classifyApiError(
  response: Response,
  validationErrors?: ValidationErrors,
): ApiErrorKind {
  if (response.status === 404) {
    return 'not-found'
  }

  if (response.status === 401 || response.status === 403) {
    return 'auth'
  }

  if (response.status === 400 || response.status === 422 || validationErrors) {
    return 'validation'
  }

  return 'unexpected'
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
    const detail = readStringField(parsedBody, 'detail')
    const validationErrors = toValidationErrors(parsedBody.errors)

    return {
      detail,
      message,
      validationErrors,
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

export async function buildApiError(response: Response, path: string) {
  const responseText = await response.text()
  const parsedError = parseErrorBody(responseText)
  const kind = classifyApiError(response, parsedError.validationErrors)

  return new ApiError({
    kind,
    status: response.status,
    message:
      parsedError.detail ??
      parsedError.message ??
      `API request failed with status ${response.status} for ${path}`,
    details: parsedError.details,
    validationErrors: parsedError.validationErrors,
  })
}

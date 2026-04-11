export type ApiErrorDetails = Record<string, unknown> | unknown[] | string | null
export type ApiErrorKind = 'auth' | 'not-found' | 'unexpected' | 'validation'
export type ValidationErrors = Record<string, string[]>

export class ApiError extends Error {
  status: number
  kind: ApiErrorKind
  details?: ApiErrorDetails
  validationErrors?: ValidationErrors

  constructor({
    details,
    kind,
    message,
    status,
    validationErrors,
  }: {
    details?: ApiErrorDetails
    kind: ApiErrorKind
    message: string
    status: number
    validationErrors?: ValidationErrors
  }) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.kind = kind
    this.details = details
    this.validationErrors = validationErrors
  }
}

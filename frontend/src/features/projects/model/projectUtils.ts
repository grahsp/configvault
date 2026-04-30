import { ApiError } from '../../../api/errors/apiError'
import type { ProjectListItem } from './types'

export function formatCreatedDate(createdAt?: string) {
  if (!createdAt) {
    return 'date unavailable'
  }

  const createdDate = new Date(createdAt)

  if (Number.isNaN(createdDate.getTime())) {
    return 'date unavailable'
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(createdDate)
}

export function getErrorMessage(error: unknown, fallbackMessage: string) {
  return error instanceof Error ? error.message : fallbackMessage
}

export function getValidationMessage(error: unknown, fieldNames: string[]) {
  if (!(error instanceof ApiError) || error.kind !== 'validation') {
    return undefined
  }

  const matchingFieldName = Object.keys(error.validationErrors ?? {}).find(
    (fieldName) =>
      fieldNames.some(
        (expectedFieldName) =>
          fieldName.toLowerCase() === expectedFieldName.toLowerCase(),
      ),
  )

  if (!matchingFieldName) {
    return undefined
  }

  return error.validationErrors?.[matchingFieldName]?.[0]
}

export function isNotFoundError(error: unknown) {
  return error instanceof ApiError && error.kind === 'not-found'
}

export function isAuthError(error: unknown) {
  return error instanceof ApiError && error.kind === 'auth'
}

export function sortProjectsByCreatedDate(projects: ProjectListItem[]) {
  return [...projects].sort((firstProject, secondProject) => {
    const firstCreatedAt = firstProject.createdAt
      ? new Date(firstProject.createdAt).getTime()
      : 0
    const secondCreatedAt = secondProject.createdAt
      ? new Date(secondProject.createdAt).getTime()
      : 0

    return (
      (Number.isNaN(secondCreatedAt) ? 0 : secondCreatedAt) -
      (Number.isNaN(firstCreatedAt) ? 0 : firstCreatedAt)
    )
  })
}

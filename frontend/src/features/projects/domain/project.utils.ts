import { ApiError } from '../../../api/errors/apiError'
import type { ProjectListItem } from './project.types'

export type ProjectSortField = 'name' | 'createdAt'
export type ProjectSortDirection = 'asc' | 'desc'

interface ProjectSortOptions {
  direction: ProjectSortDirection
  field: ProjectSortField
}

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
  return sortProjects(projects, {
    direction: 'desc',
    field: 'createdAt',
  })
}

export function sortProjects(
  projects: ProjectListItem[],
  { direction, field }: ProjectSortOptions,
) {
  return [...projects].sort((firstProject, secondProject) => {
    if (field === 'name') {
      const firstName = firstProject.name.trim().toLocaleLowerCase()
      const secondName = secondProject.name.trim().toLocaleLowerCase()

      return direction === 'asc'
        ? firstName.localeCompare(secondName)
        : secondName.localeCompare(firstName)
    }

    const firstCreatedAt = getValidDateTimestamp(firstProject.createdAt)
    const secondCreatedAt = getValidDateTimestamp(secondProject.createdAt)

    if (firstCreatedAt === null && secondCreatedAt === null) {
      return 0
    }

    if (firstCreatedAt === null) {
      return 1
    }

    if (secondCreatedAt === null) {
      return -1
    }

    return direction === 'asc'
      ? firstCreatedAt - secondCreatedAt
      : secondCreatedAt - firstCreatedAt
  })
}

function getValidDateTimestamp(value?: string) {
  if (!value) {
    return null
  }

  const timestamp = new Date(value).getTime()

  return Number.isNaN(timestamp) ? null : timestamp
}

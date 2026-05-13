export const PROJECT_NAME_MAX_LENGTH = 120

export function normalizeProjectName(projectName: string) {
  return projectName.trim()
}

export function getProjectNameValidationError(projectName: string) {
  if (!normalizeProjectName(projectName)) {
    return 'Project name is required.'
  }

  if (projectName.length > PROJECT_NAME_MAX_LENGTH) {
    return `Project name must be ${PROJECT_NAME_MAX_LENGTH} characters or fewer.`
  }

  return undefined
}

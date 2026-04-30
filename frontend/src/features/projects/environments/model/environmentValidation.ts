import type { Environment } from './environment.ts'

export function normalizeEnvironmentName(environmentName: string) {
  return environmentName.trim().toLocaleLowerCase()
}

export function validateEnvironmentName(
  environmentName: string,
  environments: Environment[],
) {
  const trimmedName = environmentName.trim()

  if (!trimmedName) {
    return 'Enter an environment name.'
  }

  const normalizedName = normalizeEnvironmentName(trimmedName)
  const hasDuplicate = environments.some(
    (environment) =>
      normalizeEnvironmentName(environment.environmentName) === normalizedName,
  )

  if (hasDuplicate) {
    return 'Environment already exists.'
  }

  return ''
}

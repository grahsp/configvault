import type { Environment } from '../domain'

interface UseEnvironmentSelectionOptions {
  environments: Environment[]
  selectedEnvironmentId: string
}

export function useEnvironmentSelection({
  environments,
  selectedEnvironmentId,
}: UseEnvironmentSelectionOptions) {
  const selectedEnvironment =
    environments.find((environment) => environment.id === selectedEnvironmentId) ?? null

  return {
    selectedEnvironment,
    selectedIndex: selectedEnvironment
      ? environments.findIndex((environment) => environment.id === selectedEnvironment.id)
      : -1,
  }
}

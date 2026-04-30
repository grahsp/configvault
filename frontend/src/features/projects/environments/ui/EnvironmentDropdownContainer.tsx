import type { Environment } from '../model'
import { useEnvironmentDropdown } from '../model'
import { EnvironmentDropdown as EnvironmentDropdownView } from './EnvironmentDropdown/EnvironmentDropdown.tsx'

interface EnvironmentDropdownContainerProps {
  onEnvironmentChange: (environmentId: string) => void
  onSelectedEnvironmentChange?: (environment: Environment | null) => void
  projectId: string
  selectedEnvironmentId: string
}

export function EnvironmentDropdown({
  onEnvironmentChange,
  onSelectedEnvironmentChange,
  projectId,
  selectedEnvironmentId,
}: EnvironmentDropdownContainerProps) {
  const dropdown = useEnvironmentDropdown({
    onEnvironmentChange,
    onSelectedEnvironmentChange,
    projectId,
    selectedEnvironmentId,
  })

  return <EnvironmentDropdownView {...dropdown} />
}

import type { Environment } from '../../domain'
import { useEnvironmentDropdown } from '../../application'
import { EnvironmentDropdown as EnvironmentDropdownView } from '../../ui/EnvironmentDropdown'

interface EnvironmentDropdownPageProps {
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
}: EnvironmentDropdownPageProps) {
  const dropdown = useEnvironmentDropdown({
    onEnvironmentChange,
    onSelectedEnvironmentChange,
    projectId,
    selectedEnvironmentId,
  })

  return <EnvironmentDropdownView {...dropdown} />
}

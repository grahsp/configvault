import { useEnvironmentDropdown } from '../../application'
import { EnvironmentDropdown as EnvironmentDropdownView } from '../../ui/EnvironmentDropdown'

interface EnvironmentDropdownPageProps {
  onEnvironmentChange: (environmentId: string) => void
  projectId: string
  selectedEnvironmentId: string
}

export function EnvironmentDropdown({
  onEnvironmentChange,
  projectId,
  selectedEnvironmentId,
}: EnvironmentDropdownPageProps) {
  const dropdown = useEnvironmentDropdown({
    onEnvironmentChange,
    projectId,
    selectedEnvironmentId,
  })

  return <EnvironmentDropdownView {...dropdown} />
}

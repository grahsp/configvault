import { useEnvironmentSelection } from '../../environments/application/useEnvironmentSelection'
import { useEnvironments } from '../../environments/application/useEnvironments'
import type { Environment } from '../../environments/domain'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../components/ui/select'

interface ProjectEnvironmentSelectProps {
  onEnvironmentChange: (environmentId: string) => void
  onSelectedEnvironmentChange: (environment: Environment | null) => void
  projectId: string
  selectedEnvironmentId: string
}

export function ProjectEnvironmentSelect({
  onEnvironmentChange,
  onSelectedEnvironmentChange,
  projectId,
  selectedEnvironmentId,
}: ProjectEnvironmentSelectProps) {
  const environmentsQuery = useEnvironments(projectId)
  const environments = environmentsQuery.data ?? []

  const { selectedEnvironment } = useEnvironmentSelection({
    environments,
    onEnvironmentChange,
    onSelectedEnvironmentChange,
    projectId,
    selectedEnvironmentId,
  })

  const placeholder = environmentsQuery.isPending
    ? 'Loading...'
    : environmentsQuery.isError
      ? 'Environments unavailable'
      : 'Select environment'

  return (
    <div className="flex items-center gap-3 self-start sm:self-auto">
      <span className="text-sm font-medium text-muted-foreground">
        Environment
      </span>
      <Select
        disabled={
          environmentsQuery.isPending ||
          environmentsQuery.isError ||
          environments.length === 0
        }
        onValueChange={onEnvironmentChange}
        value={selectedEnvironment?.id ?? ''}
      >
        <SelectTrigger
          aria-label="Environment"
          className="h-10 min-w-[12rem] rounded-[var(--radius-md-lg)] border-border bg-background shadow-none"
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent align="end">
          <SelectGroup>
            {environments.map((environment) => (
              <SelectItem key={environment.id} value={environment.id}>
                {environment.environmentName}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )
}

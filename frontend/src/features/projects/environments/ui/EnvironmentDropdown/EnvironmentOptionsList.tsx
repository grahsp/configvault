import type { Environment } from '../../domain'
import { EnvironmentOptionRow } from './EnvironmentOptionRow.tsx'

export interface EnvironmentOptionsListProps {
  activeIndex: number
  deletingEnvironmentId: string
  environments: Environment[]
  listboxId: string
  onOpenDeleteDialog: (environment: Environment) => void
  onSelectEnvironment: (environment: Environment) => void
  selectedEnvironmentId: string
}

export function EnvironmentOptionsList({
  activeIndex,
  deletingEnvironmentId,
  environments,
  listboxId,
  onOpenDeleteDialog,
  onSelectEnvironment,
  selectedEnvironmentId,
}: EnvironmentOptionsListProps) {
  return environments.map((environment, index) => (
    <EnvironmentOptionRow
      environment={environment}
      id={`${listboxId}-option-${environment.id}`}
      isActive={index === activeIndex}
      isDeleting={deletingEnvironmentId === environment.id}
      isOnlyEnvironment={environments.length <= 1}
      isSelected={environment.id === selectedEnvironmentId}
      key={environment.id}
      onOpenDeleteDialog={onOpenDeleteDialog}
      onSelectEnvironment={onSelectEnvironment}
    />
  ))
}

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Environment } from '../../domain'

export interface EnvironmentOptionRowProps {
  environment: Environment
  id: string
  isActive: boolean
  isDeleting: boolean
  isOnlyEnvironment: boolean
  isSelected: boolean
  onOpenDeleteDialog: (environment: Environment) => void
  onSelectEnvironment: (environment: Environment) => void
}

export function EnvironmentOptionRow({
  environment,
  id,
  isActive,
  isDeleting,
  isOnlyEnvironment,
  isSelected,
  onOpenDeleteDialog,
  onSelectEnvironment,
}: EnvironmentOptionRowProps) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-stretch gap-1">
      <button
        aria-selected={isSelected}
        className={cn(
          'min-h-9 min-w-0 rounded-md px-2.5 py-2 text-left text-sm font-medium text-foreground outline-none transition-colors [overflow-wrap:anywhere] hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30',
          isActive && 'bg-muted',
          isSelected && 'bg-accent text-accent-foreground',
        )}
        id={id}
        onClick={() => onSelectEnvironment(environment)}
        role="option"
        type="button"
      >
        {environment.environmentName}
      </button>
      <Button
        aria-label={
          isOnlyEnvironment
            ? `Cannot delete ${environment.environmentName} because it is the only environment`
            : `Delete ${environment.environmentName}`
        }
        className="h-9 px-2 text-xs"
        disabled={isOnlyEnvironment || isDeleting}
        onClick={() => onOpenDeleteDialog(environment)}
        size="sm"
        type="button"
        variant="destructive"
      >
        {isDeleting ? 'Deleting' : 'Delete'}
      </Button>
    </div>
  )
}

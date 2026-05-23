import { SplitActionButton } from '../../../../components/composed'
import { Button } from '../../../../components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../../components/ui/dropdown-menu'
import { cn } from '../../../../lib/utils'

interface SecretsStateProps {
  className?: string
}

export function SecretsLoadingState(props: SecretsStateProps) {
  return (
    <div
      className={cn("flex min-h-40 flex-col justify-center gap-2 py-6", props.className)}
      role="status"
    >
      <h3 className="text-base font-semibold text-foreground">Loading secrets...</h3>
      <p className="text-sm text-muted-foreground">Secrets are being prepared.</p>
    </div>
  )
}

interface SecretsErrorStateProps extends SecretsStateProps {
  errorMessage?: string
  onRetry: () => void
}

export function SecretsErrorState({
  errorMessage,
  onRetry,
  ...props
}: SecretsErrorStateProps) {
  return (
    <div
      className={cn("flex min-h-40 flex-col justify-center gap-4 py-6", props.className)}
      role="alert"
    >
      <div className="flex flex-col gap-2">
        <h3 className="text-base font-semibold text-foreground">Failed to load secrets.</h3>
        <p className="text-sm text-muted-foreground">{errorMessage}</p>
      </div>
      <div>
        <Button onClick={onRetry} type="button" variant="outline">
          Retry
        </Button>
      </div>
    </div>
  )
}

interface SecretsEmptyStateProps extends SecretsStateProps {
  onOpenAddSecret: () => void
  onOpenImportModal: () => void
}

export function SecretsEmptyState({
  onOpenAddSecret,
  onOpenImportModal,
  ...props
}: SecretsEmptyStateProps) {
  return (
    <div
      className={cn("flex min-h-40 flex-col justify-center gap-4 py-6", props.className)}
    >
      <div className="flex flex-col gap-2">
        <h3 className="text-base font-semibold text-foreground">No secrets yet</h3>
        <p className="text-sm text-muted-foreground">
          Add a secret key to start tracking values across environments.
        </p>
      </div>
      <SplitActionButton
        primaryAction={{
          label: '+ Add Secret',
          onClick: onOpenAddSecret,
        }}
        secondaryActions={[
          {
            label: 'Import Secrets',
            onSelect: onOpenImportModal,
          },
        ]}
      />
    </div>
  )
}

export function SecretsEnvironmentRequiredState(props: SecretsStateProps) {
  return (
    <div
      className={cn("flex min-h-40 flex-col justify-center gap-2 py-6", props.className)}
    >
      <h3 className="text-base font-semibold text-foreground">No environment available</h3>
      <p className="text-sm text-muted-foreground">
        Create an environment before managing this project&apos;s secrets.
      </p>
    </div>
  )
}

import { SplitActionButton } from '../../../../components/composed'
import { Button } from '../../../../components/ui/button'
import { StatusPanel } from '@/components/composed'

interface SecretsStateProps {
  className?: string
}

export function SecretsLoadingState(props: SecretsStateProps) {
  return (
    <StatusPanel
      className={props.className}
      role="status"
      title="Loading secrets..."
    >
      <p>Secrets are being prepared.</p>
    </StatusPanel>
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
    <StatusPanel
      actions={
        <Button onClick={onRetry} type="button" variant="outline">
          Retry
        </Button>
      }
      className={props.className}
      role="alert"
      title="Failed to load secrets."
      tone="error"
    >
      <p>{errorMessage}</p>
    </StatusPanel>
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
    <StatusPanel
      actions={
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
      }
      className={props.className}
      title="No secrets yet"
    >
      <p>
        Add a secret key to start tracking values across environments.
      </p>
    </StatusPanel>
  )
}

export function SecretsEnvironmentRequiredState(props: SecretsStateProps) {
  return (
    <StatusPanel
      className={props.className}
      title="No environment available"
    >
      <p>
        Create an environment before managing this project&apos;s secrets.
      </p>
    </StatusPanel>
  )
}

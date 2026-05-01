import type { StatePanelProps } from '../../../../shared/ui'
import { Button, SplitButton, StatePanel } from '../../../../shared/ui'

type SecretsStateProps = Pick<StatePanelProps, 'className'>

export function SecretsLoadingState(props: SecretsStateProps) {
  return (
    <StatePanel role="status" title="Loading secrets..." {...props}>
      <p>Secrets are being prepared.</p>
    </StatePanel>
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
    <StatePanel
      actions={
        <Button onClick={onRetry} type="button" variant="secondary">
          Retry
        </Button>
      }
      role="alert"
      title="Failed to load secrets."
      tone="error"
      {...props}
    >
      <p>{errorMessage}</p>
    </StatePanel>
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
    <StatePanel
      actions={
        <SplitButton
          actionLabel="+ Add Secret"
          menuActionLabel="Import Secrets"
          menuLabel="Open secret actions"
          onActionClick={onOpenAddSecret}
          onMenuActionClick={onOpenImportModal}
          variant="primary"
        />
      }
      title="No secrets yet"
      {...props}
    >
      <p>Add a secret key to start tracking values across environments.</p>
    </StatePanel>
  )
}

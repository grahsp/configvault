import { Button, StatePanel } from '../../../../shared/ui'
import styles from './SecretsTable.module.css'

interface SecretsLoadingStateProps {
  isVisible: boolean
}

export function SecretsLoadingState({ isVisible }: SecretsLoadingStateProps) {
  if (!isVisible) {
    return null
  }

  return (
    <StatePanel
      className={styles.sectionState}
      role="status"
      title="Loading secrets..."
    >
      <p>Secrets are being prepared.</p>
    </StatePanel>
  )
}

interface SecretsErrorStateProps {
  errorMessage?: string
  isVisible: boolean
  onRetry: () => void
}

export function SecretsErrorState({
  errorMessage,
  isVisible,
  onRetry,
}: SecretsErrorStateProps) {
  if (!isVisible) {
    return null
  }

  return (
    <StatePanel
      actions={
        <Button onClick={onRetry} type="button" variant="secondary">
          Retry
        </Button>
      }
      className={styles.sectionState}
      role="alert"
      title="Failed to load secrets."
      tone="error"
    >
      <p>{errorMessage}</p>
    </StatePanel>
  )
}

interface SecretsEmptyStateProps {
  isVisible: boolean
  onOpenAddSecret: () => void
  onOpenImportModal: () => void
}

export function SecretsEmptyState({
  isVisible,
  onOpenAddSecret,
  onOpenImportModal,
}: SecretsEmptyStateProps) {
  if (!isVisible) {
    return null
  }

  return (
    <StatePanel
      actions={
        <>
          <Button onClick={onOpenAddSecret} type="button" variant="primary">
            Add Secret
          </Button>
          <Button onClick={onOpenImportModal} type="button" variant="secondary">
            Import .env
          </Button>
        </>
      }
      className={styles.sectionState}
      title="No secrets yet"
    >
      <p>Add a secret key to start tracking values across environments.</p>
    </StatePanel>
  )
}

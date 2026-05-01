import { Button } from '../../../../shared/ui'
import styles from './SecretsTable.module.css'

interface SecretsTableFooterActionsProps {
  isSaving: boolean
  onCancelEdit: () => void
  onSaveEdit: () => Promise<void>
}

export function SecretsTableFooterActions({
  isSaving,
  onCancelEdit,
  onSaveEdit,
}: SecretsTableFooterActionsProps) {
  return (
    <div className={styles.sectionFooterActions}>
      <div className={styles.sectionFooterSecondaryActions}>
        <Button
          disabled={isSaving}
          onClick={() => void onSaveEdit()}
          type="button"
          variant="primary"
        >
          {isSaving ? 'Saving' : 'Save Changes'}
        </Button>
        <Button
          disabled={isSaving}
          onClick={onCancelEdit}
          type="button"
          variant="secondary"
        >
          Cancel
        </Button>
      </div>
    </div>
  )
}

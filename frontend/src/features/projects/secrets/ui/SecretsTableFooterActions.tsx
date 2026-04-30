import { Button } from '../../../../shared/ui'
import styles from './SecretsTable.module.css'

interface SecretsTableFooterActionsProps {
  isSaving: boolean
  onCancelEdit: () => void
  onOpenAddSecret: () => void
  onOpenImportModal: () => void
  onSaveEdit: () => Promise<void>
}

export function SecretsTableFooterActions({
  isSaving,
  onCancelEdit,
  onOpenAddSecret,
  onOpenImportModal,
  onSaveEdit,
}: SecretsTableFooterActionsProps) {
  return (
    <div className={styles.sectionFooterActions}>
      <div className={styles.sectionFooterPrimaryActions}>
        <Button
          className={styles.footerPrimaryButton}
          disabled={isSaving}
          onClick={onOpenAddSecret}
          type="button"
          variant="primary"
        >
          Add Secret
        </Button>
        <Button
          className={styles.footerPrimaryButton}
          disabled={isSaving}
          onClick={onOpenImportModal}
          type="button"
          variant="secondary"
        >
          Import .env
        </Button>
      </div>
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

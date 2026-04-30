import { Button } from '../../../../shared/ui'
import styles from './SecretsTable.module.css'

interface SecretsTableHeaderActionsProps {
  onOpenImportModal: () => void
  onStartEdit: () => void
}

export function SecretsTableHeaderActions({
  onOpenImportModal,
  onStartEdit,
}: SecretsTableHeaderActionsProps) {
  return (
    <div className={styles.sectionHeaderActions}>
      <Button onClick={onOpenImportModal} type="button" variant="secondary">
        Import .env
      </Button>
      <Button onClick={onStartEdit} type="button" variant="secondary">
        Edit
      </Button>
    </div>
  )
}

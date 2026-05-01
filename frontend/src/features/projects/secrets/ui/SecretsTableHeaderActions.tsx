import { Button } from '../../../../shared/ui'
import styles from './SecretsTable.module.css'

interface SecretsTableHeaderActionsProps {
  onOpenAddSecret: () => void
  onOpenImportModal: () => void
}

export function SecretsTableHeaderActions({
  onOpenAddSecret,
  onOpenImportModal,
}: SecretsTableHeaderActionsProps) {
  return (
    <div className={styles.sectionHeaderActions}>
      <Button onClick={onOpenAddSecret} type="button" variant="primary">
        Add Secret
      </Button>
      <Button onClick={onOpenImportModal} type="button" variant="secondary">
        Import .env
      </Button>
    </div>
  )
}

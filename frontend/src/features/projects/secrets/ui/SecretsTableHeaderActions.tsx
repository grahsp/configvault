import { SplitButton } from '../../../../shared/ui'
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
      <SplitButton
        actionLabel="+ Add Secret"
        menuActionLabel="Import Secrets"
        menuLabel="Open secret actions"
        onActionClick={onOpenAddSecret}
        onMenuActionClick={onOpenImportModal}
        variant="primary"
      />
    </div>
  )
}

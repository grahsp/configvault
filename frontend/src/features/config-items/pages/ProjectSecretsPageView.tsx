import { cx } from '../../../shared/utils/cx'
import type { ConfigItemsTableState } from '../model'
import { ConfigItemsTable } from '../ui'
import styles from './ProjectSecretsPage.module.css'

interface ProjectSecretsPageViewProps {
  canCopyExport: boolean
  isCopyingExport: boolean
  onCopyExport: () => void
  tableState: ConfigItemsTableState
}

export function ProjectSecretsPageView({
  canCopyExport,
  isCopyingExport,
  onCopyExport,
  tableState,
}: ProjectSecretsPageViewProps) {
  return (
    <section className={styles.page}>
      {canCopyExport ? (
        <div className={styles.actions}>
          <button
            className={cx(styles.button, styles.buttonSecondary)}
            disabled={isCopyingExport}
            onClick={onCopyExport}
            type="button"
          >
            {isCopyingExport ? 'Copying export...' : 'Copy Export'}
          </button>
        </div>
      ) : null}

      <ConfigItemsTable {...tableState} />
    </section>
  )
}

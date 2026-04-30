import { cx } from '../../../shared/utils/cx'
import styles from './ConfigItemsTable.module.css'

interface DeleteConfigItemDialogProps {
  configItemKey: string
  isPending: boolean
  onCancel: () => void
  onConfirm: () => Promise<void> | void
}

export function DeleteConfigItemDialog({
  configItemKey,
  isPending,
  onCancel,
  onConfirm,
}: DeleteConfigItemDialogProps) {
  return (
    <div className={styles.modalBackdrop} role="presentation">
      <div
        aria-labelledby="delete-config-item-title"
        aria-modal="true"
        className={styles.modal}
        role="dialog"
      >
        <div className={styles.modalHeader}>
          <h2 id="delete-config-item-title">Delete secret?</h2>
        </div>

        <p className={styles.modalCopy}>{configItemKey}</p>
        <p className={styles.modalCopy}>
          This will remove all environment values.
        </p>

        <div className={styles.formActions}>
          <button
            className={cx(styles.button, styles.buttonSecondary)}
            disabled={isPending}
            onClick={onCancel}
            type="button"
          >
            Cancel
          </button>
          <button
            className={cx(styles.button, styles.buttonDanger)}
            disabled={isPending}
            onClick={() => void onConfirm()}
            type="button"
          >
            {isPending ? 'Deleting' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

import { useToast } from '../../../shared/components/toast/useToast'
import { cx } from '../../../shared/utils/cx'
import { useDeleteConfigItem } from '../hooks/useDeleteConfigItem'
import type { ConfigItem } from '../types/ConfigItem'
import styles from './ConfigItemsTable.module.css'

interface DeleteConfigItemDialogProps {
  configItem: ConfigItem
  onCancel: () => void
  projectId: string
}

export function DeleteConfigItemDialog({
  configItem,
  onCancel,
  projectId,
}: DeleteConfigItemDialogProps) {
  const { addToast } = useToast()
  const deleteConfigItemMutation = useDeleteConfigItem(projectId)

  async function handleConfirm() {
    try {
      await deleteConfigItemMutation.mutateAsync(configItem.id)
      addToast({ message: 'Secret deleted', type: 'success' })
      onCancel()
    } catch (error) {
      addToast({
        message: getErrorMessage(error, 'Failed to delete secret'),
        type: 'error',
      })
    }
  }

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

        <p className={styles.modalCopy}>{configItem.key}</p>
        <p className={styles.modalCopy}>
          This will remove all environment values.
        </p>

        <div className={styles.formActions}>
          <button
            className={cx(styles.button, styles.buttonSecondary)}
            disabled={deleteConfigItemMutation.isPending}
            onClick={onCancel}
            type="button"
          >
            Cancel
          </button>
          <button
            className={cx(styles.button, styles.buttonDanger)}
            disabled={deleteConfigItemMutation.isPending}
            onClick={handleConfirm}
            type="button"
          >
            {deleteConfigItemMutation.isPending ? 'Deleting' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

function getErrorMessage(error: unknown, fallbackMessage: string) {
  return error instanceof Error ? error.message : fallbackMessage
}

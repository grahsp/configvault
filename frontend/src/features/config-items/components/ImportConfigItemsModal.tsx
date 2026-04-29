import type { FormEvent } from 'react'
import { useState } from 'react'
import { useToast } from '../../../shared/components/toast/useToast'
import { cx } from '../../../shared/utils/cx'
import { useImportConfigItems } from '../hooks/useImportConfigItems'
import styles from './ConfigItemsTable.module.css'

interface ImportConfigItemsModalProps {
  environmentName: string
  isEditing: boolean
  onCancel: () => void
  onImported: () => void
  projectId: string
}

export function ImportConfigItemsModal({
  environmentName,
  isEditing,
  onCancel,
  onImported,
  projectId,
}: ImportConfigItemsModalProps) {
  const { addToast } = useToast()
  const importConfigItemsMutation = useImportConfigItems(
    projectId,
    environmentName,
  )
  const [content, setContent] = useState('')
  const trimmedContent = content.trim()

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!trimmedContent) {
      return
    }

    try {
      await importConfigItemsMutation.mutateAsync(content)
      addToast({
        message: 'Secrets imported',
        type: 'success',
      })
      onImported()
      onCancel()
    } catch (error) {
      addToast({
        message: getErrorMessage(error, 'Failed to import secrets'),
        type: 'error',
      })
    }
  }

  return (
    <div className={styles.modalBackdrop} role="presentation">
      <div
        aria-labelledby="import-config-items-title"
        aria-modal="true"
        className={styles.modal}
        role="dialog"
      >
        <div className={styles.modalHeader}>
          <h2 id="import-config-items-title">Import .env data</h2>
        </div>

        <p className={styles.modalCopy}>
          Paste `.env`-formatted content to create or update secrets for this
          environment.
        </p>
        {isEditing ? (
          <p className={styles.modalCopy}>
            Unsaved edits in the table will be cleared after import.
          </p>
        ) : null}

        <form className={styles.configItemForm} onSubmit={handleSubmit}>
          <label className={styles.configItemFormField}>
            .env content
            <textarea
              autoFocus
              className={styles.configItemTextarea}
              disabled={importConfigItemsMutation.isPending}
              onChange={(event) => {
                importConfigItemsMutation.reset()
                setContent(event.target.value)
              }}
              placeholder="API_KEY=secret-value"
              rows={10}
              value={content}
            />
          </label>

          <div className={styles.formActions}>
            <button
              className={cx(styles.button, styles.buttonSecondary)}
              disabled={importConfigItemsMutation.isPending}
              onClick={onCancel}
              type="button"
            >
              Cancel
            </button>
            <button
              className={cx(styles.button, styles.buttonPrimary)}
              disabled={
                importConfigItemsMutation.isPending || trimmedContent.length === 0
              }
              type="submit"
            >
              {importConfigItemsMutation.isPending ? 'Importing' : 'Import'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function getErrorMessage(error: unknown, fallbackMessage: string) {
  return error instanceof Error ? error.message : fallbackMessage
}

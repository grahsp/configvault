import type { FormEvent } from 'react'
import { useState } from 'react'
import { cx } from '../../../shared/utils/cx'
import styles from './ConfigItemsTable.module.css'

interface ImportConfigItemsModalProps {
  isEditing: boolean
  isPending: boolean
  onCancel: () => void
  onSubmit: (content: string) => Promise<void>
}

export function ImportConfigItemsModal({
  isEditing,
  isPending,
  onCancel,
  onSubmit,
}: ImportConfigItemsModalProps) {
  const [content, setContent] = useState('')
  const trimmedContent = content.trim()

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!trimmedContent) {
      return
    }

    try {
      await onSubmit(content)
      setContent('')
    } catch {
      return
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
              disabled={isPending}
              onChange={(event) => {
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
              disabled={isPending}
              onClick={onCancel}
              type="button"
            >
              Cancel
            </button>
            <button
              className={cx(styles.button, styles.buttonPrimary)}
              disabled={isPending || trimmedContent.length === 0}
              type="submit"
            >
              {isPending ? 'Importing' : 'Import'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

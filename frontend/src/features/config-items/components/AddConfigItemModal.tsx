import type { FormEvent } from 'react'
import { useState } from 'react'
import { cx } from '../../../shared/utils/cx'
import { getConfigItemKeyValidationError } from '../validation/configItemValidation'
import styles from './ConfigItemsTable.module.css'

interface AddConfigItemModalProps {
  onCancel: () => void
  onCreate: (key: string) => void
}

export function AddConfigItemModal({
  onCancel,
  onCreate,
}: AddConfigItemModalProps) {
  const [key, setKey] = useState('')
  const validationError = getConfigItemKeyValidationError(key)
  const visibleError = validationError

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (validationError) {
      return
    }

    onCreate(key.trim())
  }

  return (
    <div className={styles.modalBackdrop} role="presentation">
      <div
        aria-labelledby="add-config-item-title"
        aria-modal="true"
        className={styles.modal}
        role="dialog"
      >
        <div className={styles.modalHeader}>
          <h2 id="add-config-item-title">Add secret</h2>
        </div>

        <form className={styles.configItemForm} onSubmit={handleSubmit}>
          <label className={styles.configItemFormField}>
            Key
            <input
              autoFocus
              aria-describedby={
                visibleError ? 'add-config-item-key-error' : undefined
              }
              aria-invalid={Boolean(visibleError)}
              onChange={(event) => {
                setKey(event.target.value)
              }}
              placeholder="API_KEY"
              required
              type="text"
              value={key}
            />
          </label>

          {visibleError ? (
            <p
              className={styles.configItemFormError}
              id="add-config-item-key-error"
              role="alert"
            >
              {visibleError}
            </p>
          ) : null}

          <div className={styles.formActions}>
            <button
              className={cx(styles.button, styles.buttonSecondary)}
              onClick={onCancel}
              type="button"
            >
              Cancel
            </button>
            <button
              className={cx(styles.button, styles.buttonPrimary)}
              disabled={Boolean(validationError)}
              type="submit"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

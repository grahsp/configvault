import type { FormEvent } from 'react'
import { useState } from 'react'
import { cx } from '../../../shared/utils/cx'
import { useCreateConfigItem } from '../hooks/useCreateConfigItem'
import type { ConfigItem } from '../types/ConfigItem'
import {
  getConfigItemKeyValidationError,
  getUppercaseConfigItemKeySuggestion,
} from '../validation/configItemValidation'
import styles from './ConfigItemsTable.module.css'

interface AddConfigItemModalProps {
  onCancel: () => void
  onCreated: (configItem: ConfigItem) => void
  projectId: string
}

export function AddConfigItemModal({
  onCancel,
  onCreated,
  projectId,
}: AddConfigItemModalProps) {
  const [key, setKey] = useState('')
  const createConfigItemMutation = useCreateConfigItem(projectId)
  const validationError = getConfigItemKeyValidationError(key)
  const uppercaseSuggestion = getUppercaseConfigItemKeySuggestion(key)
  const visibleError =
    key || createConfigItemMutation.isError
      ? validationError ?? getErrorMessage(createConfigItemMutation.error)
      : undefined

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (validationError) {
      return
    }

    try {
      const createdConfigItem = await createConfigItemMutation.mutateAsync(
        key.trim(),
      )
      onCreated(createdConfigItem)
    } catch {
      // The mutation state renders the error without closing the modal.
    }
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
          <button
            aria-label="Close add secret"
            className={styles.modalClose}
            disabled={createConfigItemMutation.isPending}
            onClick={onCancel}
            type="button"
          >
            Close
          </button>
        </div>

        <form className={styles.configItemForm} onSubmit={handleSubmit}>
          <label className={styles.configItemFormField}>
            Key
            <input
              autoFocus
              aria-describedby={
                visibleError
                  ? 'add-config-item-key-error'
                  : uppercaseSuggestion
                    ? 'add-config-item-key-suggestion'
                    : undefined
              }
              aria-invalid={Boolean(visibleError)}
              disabled={createConfigItemMutation.isPending}
              onChange={(event) => {
                createConfigItemMutation.reset()
                setKey(event.target.value)
              }}
              placeholder="API_KEY"
              required
              type="text"
              value={key}
            />
          </label>

          {uppercaseSuggestion && !visibleError ? (
            <p
              className={styles.configItemFormHint}
              id="add-config-item-key-suggestion"
            >
              Suggested key: {uppercaseSuggestion}
            </p>
          ) : null}

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
              disabled={createConfigItemMutation.isPending}
              onClick={onCancel}
              type="button"
            >
              Cancel
            </button>
            <button
              className={cx(styles.button, styles.buttonPrimary)}
              disabled={
                createConfigItemMutation.isPending || Boolean(validationError)
              }
              type="submit"
            >
              {createConfigItemMutation.isPending ? 'Creating' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Failed to create secret.'
}

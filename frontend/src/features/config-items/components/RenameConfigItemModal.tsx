import type { FormEvent } from 'react'
import { useState } from 'react'
import { cx } from '../../../shared/utils/cx'
import { useRenameConfigItem } from '../hooks/useRenameConfigItem'
import type { ConfigItem } from '../types/ConfigItem'
import {
  getConfigItemKeyValidationError,
  getUppercaseConfigItemKeySuggestion,
} from '../validation/configItemValidation'
import styles from './ConfigItemsTable.module.css'

interface RenameConfigItemModalProps {
  configItem: ConfigItem
  onCancel: () => void
  projectId: string
}

export function RenameConfigItemModal({
  configItem,
  onCancel,
  projectId,
}: RenameConfigItemModalProps) {
  const [key, setKey] = useState(configItem.key)
  const renameConfigItemMutation = useRenameConfigItem(projectId)
  const validationError = getConfigItemKeyValidationError(key)
  const uppercaseSuggestion = getUppercaseConfigItemKeySuggestion(key)
  const visibleError =
    validationError ?? getErrorMessage(renameConfigItemMutation.error)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (validationError) {
      return
    }

    try {
      await renameConfigItemMutation.mutateAsync({
        configItemId: configItem.id,
        key: key.trim(),
      })
      onCancel()
    } catch {
      // The mutation state renders the error without closing the modal.
    }
  }

  return (
    <div className={styles.modalBackdrop} role="presentation">
      <div
        aria-labelledby="rename-config-item-title"
        aria-modal="true"
        className={styles.modal}
        role="dialog"
      >
        <div className={styles.modalHeader}>
          <h2 id="rename-config-item-title">Rename secret</h2>
          <button
            aria-label="Close rename secret"
            className={styles.modalClose}
            disabled={renameConfigItemMutation.isPending}
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
                  ? 'rename-config-item-key-error'
                  : uppercaseSuggestion
                    ? 'rename-config-item-key-suggestion'
                    : undefined
              }
              aria-invalid={Boolean(visibleError)}
              disabled={renameConfigItemMutation.isPending}
              onChange={(event) => {
                renameConfigItemMutation.reset()
                setKey(event.target.value)
              }}
              required
              type="text"
              value={key}
            />
          </label>

          {uppercaseSuggestion && !visibleError ? (
            <p
              className={styles.configItemFormHint}
              id="rename-config-item-key-suggestion"
            >
              Suggested key: {uppercaseSuggestion}
            </p>
          ) : null}

          {visibleError ? (
            <p
              className={styles.configItemFormError}
              id="rename-config-item-key-error"
              role="alert"
            >
              {visibleError}
            </p>
          ) : null}

          <div className={styles.formActions}>
            <button
              className={cx(styles.button, styles.buttonSecondary)}
              disabled={renameConfigItemMutation.isPending}
              onClick={onCancel}
              type="button"
            >
              Cancel
            </button>
            <button
              className={cx(styles.button, styles.buttonPrimary)}
              disabled={
                renameConfigItemMutation.isPending || Boolean(validationError)
              }
              type="submit"
            >
              {renameConfigItemMutation.isPending ? 'Saving' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : undefined
}

import type { FormEvent } from 'react'
import { useState } from 'react'
import { useToast } from '../../../shared/components/toast/useToast'
import { cx } from '../../../shared/utils/cx'
import { useCreateConfigItem } from '../hooks/useCreateConfigItem'
import { getConfigItemKeyValidationError } from '../validation/configItemValidation'
import styles from './ConfigItemsTable.module.css'

interface AddConfigItemModalProps {
  environmentName: string
  onCancel: () => void
  onCreated: () => void
  projectId: string
}

export function AddConfigItemModal({
  environmentName,
  onCancel,
  onCreated,
  projectId,
}: AddConfigItemModalProps) {
  const { addToast } = useToast()
  const [key, setKey] = useState('')
  const createConfigItemMutation = useCreateConfigItem(
    projectId,
    environmentName,
  )
  const validationError = getConfigItemKeyValidationError(key)
  const visibleError = validationError

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (validationError) {
      return
    }

    try {
      await createConfigItemMutation.mutateAsync(key.trim())
      addToast({ message: 'Secret created', type: 'success' })
      onCreated()
    } catch (error) {
      addToast({
        message: getErrorMessage(error, 'Failed to create secret'),
        type: 'error',
      })
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

function getErrorMessage(error: unknown, fallbackMessage: string) {
  return error instanceof Error ? error.message : fallbackMessage
}

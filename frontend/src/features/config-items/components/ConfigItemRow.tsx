import type { KeyboardEvent } from 'react'
import { useEffect, useRef } from 'react'
import { cx } from '../../../shared/utils/cx'
import type { ConfigItem } from '../types/ConfigItem'
import styles from './ConfigItemsTable.module.css'

interface ConfigItemRowProps {
  configItem: ConfigItem
  draftKey: string
  draftValue: string
  isRevealing: boolean
  isEditing: boolean
  isSaving: boolean
  isValueRevealed: boolean
  revealedValue?: string
  onDelete: (configItem: ConfigItem) => void
  onDraftKeyChange: (key: string) => void
  onDraftValueChange: (value: string) => void
  onCancelEdit: () => void
  onEdit: (configItem: ConfigItem) => void
  onReveal: (configItem: ConfigItem) => void
  onSaveEdit: () => void
  shouldFocus?: boolean
  validationError?: string
}

const maskedValue = '****'
const emptyValue = '(empty)'

export function ConfigItemRow({
  configItem,
  draftKey,
  draftValue,
  isRevealing,
  isEditing,
  isSaving,
  isValueRevealed,
  revealedValue,
  onCancelEdit,
  onDelete,
  onDraftKeyChange,
  onDraftValueChange,
  onEdit,
  onReveal,
  onSaveEdit,
  shouldFocus = false,
  validationError,
}: ConfigItemRowProps) {
  const keyCellRef = useRef<HTMLTableCellElement>(null)
  const errorId = `config-item-${configItem.id}-key-error`
  const isSaveDisabled = isSaving || Boolean(validationError)

  useEffect(() => {
    if (shouldFocus && !isEditing) {
      keyCellRef.current?.focus()
    }
  }, [isEditing, shouldFocus])

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      event.preventDefault()
      onSaveEdit()
    }

    if (event.key === 'Escape') {
      event.preventDefault()
      onCancelEdit()
    }
  }

  function renderValue() {
    if (isValueRevealed && revealedValue !== undefined) {
      return revealedValue
    }

    return configItem.hasValue ? maskedValue : emptyValue
  }

  return (
    <tr>
      <th ref={keyCellRef} scope="row" tabIndex={shouldFocus ? -1 : undefined}>
        {isEditing ? (
          <div className={styles.inlineKeyField}>
            <label>
              <span className={styles.visuallyHidden}>Key</span>
              <input
                autoFocus
                aria-describedby={validationError ? errorId : undefined}
                aria-invalid={Boolean(validationError)}
                disabled={isSaving}
                onChange={(event) => onDraftKeyChange(event.target.value)}
                onKeyDown={handleKeyDown}
                type="text"
                value={draftKey}
              />
            </label>
            {validationError ? (
              <span className={styles.inlineKeyError} id={errorId} role="alert">
                {validationError}
              </span>
            ) : null}
          </div>
        ) : (
          <span className={styles.configKey}>{configItem.key}</span>
        )}
      </th>
      <td>
        {isEditing ? (
          <label className={styles.inlineValueField}>
            <span className={styles.visuallyHidden}>Value</span>
            <input
              disabled={isSaving}
              onChange={(event) => onDraftValueChange(event.target.value)}
              onKeyDown={handleKeyDown}
              type="text"
              value={draftValue}
            />
          </label>
        ) : (
          <span className={styles.maskedValue}>{renderValue()}</span>
        )}
      </td>
      <td className={styles.actionsColumn}>
        <div className={styles.rowActions}>
          {isEditing ? (
            <>
              <button
                className={cx(styles.rowAction, styles.rowActionPrimary)}
                disabled={isSaveDisabled}
                onClick={onSaveEdit}
                type="button"
              >
                {isSaving ? 'Saving' : 'Save'}
              </button>
              <button
                className={styles.rowAction}
                disabled={isSaving}
                onClick={onCancelEdit}
                type="button"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              {configItem.hasValue ? (
                <button
                  aria-label={
                    isValueRevealed
                      ? `Hide ${configItem.key}`
                      : `Reveal ${configItem.key}`
                  }
                  className={styles.rowAction}
                  disabled={isRevealing}
                  onClick={() => onReveal(configItem)}
                  type="button"
                >
                  {isRevealing ? 'Revealing' : isValueRevealed ? 'Hide' : 'Reveal'}
                </button>
              ) : null}
              <button
                aria-label={`Edit ${configItem.key}`}
                className={styles.rowAction}
                onClick={() => onEdit(configItem)}
                type="button"
              >
                Edit
              </button>
              <button
                aria-label={`Delete ${configItem.key}`}
                className={styles.rowAction}
                onClick={() => onDelete(configItem)}
                type="button"
              >
                Delete
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  )
}

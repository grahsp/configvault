import type { KeyboardEvent } from 'react'
import { useEffect, useRef } from 'react'
import { cx } from '../../../../shared/utils/cx.ts'
import type { Secret } from '../domain'
import { SecretRowActions } from './SecretRowActions.tsx'
import { SecretValueField } from './SecretValueField.tsx'
import styles from './SecretsTable.module.css'

interface SecretRowProps {
  secret: Secret
  draftKey: string
  draftValue: string | null
  isEditing: boolean
  isMarkedForDeletion: boolean
  isRevealing: boolean
  isSaving: boolean
  isValueRevealed: boolean
  onDeleteToggle: (secret: Secret) => void
  onDraftKeyChange: (key: string) => void
  onDraftValueChange: (value: string) => void
  onCancelEdit: () => void
  onReveal: (secret: Secret) => void
  onSaveEdit: () => void
  onStartValueEdit: (secret: Secret) => Promise<void> | void
  revealedValue?: string
  shouldFocus?: boolean
  validationError?: string
}

export function SecretRow({
  secret,
  draftKey,
  draftValue,
  isEditing,
  isMarkedForDeletion,
  isRevealing,
  isSaving,
  isValueRevealed,
  onCancelEdit,
  onDeleteToggle,
  onDraftKeyChange,
  onDraftValueChange,
  onReveal,
  onSaveEdit,
  onStartValueEdit,
  revealedValue,
  shouldFocus = false,
  validationError,
}: SecretRowProps) {
  const keyCellRef = useRef<HTMLTableCellElement>(null)
  const keyFieldRef = useRef<HTMLInputElement>(null)
  const errorId = `secret-${secret.id}-key-error`

  useEffect(() => {
    if (!shouldFocus) {
      return
    }

    if (isEditing) {
      keyFieldRef.current?.focus()
      return
    }

    if (!isEditing) {
      keyCellRef.current?.focus()
    }
  }, [isEditing, shouldFocus])

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      onSaveEdit()
    }

    if (event.key === 'Escape') {
      event.preventDefault()
      onCancelEdit()
    }
  }

  return (
    <tr
      className={cx(
        isEditing && styles.editingRow,
        isMarkedForDeletion && styles.pendingDeleteRow,
      )}
    >
      <th
        className={styles.keyCell}
        ref={keyCellRef}
        scope="row"
        tabIndex={shouldFocus ? -1 : undefined}
      >
        <div className={styles.fieldGroup}>
          <label className={styles.visuallyHidden} htmlFor={`key-${secret.id}`}>
            Key
          </label>
          <input
            aria-describedby={validationError ? errorId : undefined}
            aria-invalid={Boolean(validationError)}
            className={cx(
              styles.textField,
              !isEditing && styles.readonlyField,
              isMarkedForDeletion && styles.markedForDeletionField,
              validationError && styles.textFieldError,
            )}
            disabled={!isEditing || isSaving || isMarkedForDeletion}
            id={`key-${secret.id}`}
            onChange={(event) => onDraftKeyChange(event.target.value)}
            onKeyDown={handleKeyDown}
            readOnly={!isEditing || isMarkedForDeletion}
            ref={keyFieldRef}
            type="text"
            value={isEditing ? draftKey : secret.key}
          />
          {isEditing && validationError ? (
            <span className={styles.inlineKeyError} id={errorId} role="alert">
              {validationError}
            </span>
          ) : null}
        </div>
      </th>
      <td className={styles.valueCell}>
        <SecretValueField
          draftValue={draftValue}
          isEditing={isEditing}
          isMarkedForDeletion={isMarkedForDeletion}
          isSaving={isSaving}
          isValueRevealed={isValueRevealed}
          onCancelEdit={onCancelEdit}
          onDraftValueChange={onDraftValueChange}
          onSaveEdit={onSaveEdit}
          onStartValueEdit={onStartValueEdit}
          revealedValue={revealedValue}
          secret={secret}
        />
      </td>
      <td className={styles.actionsColumn}>
        <SecretRowActions
          isEditing={isEditing}
          isMarkedForDeletion={isMarkedForDeletion}
          isRevealing={isRevealing}
          isSaving={isSaving}
          isValueRevealed={isValueRevealed}
          onDeleteToggle={onDeleteToggle}
          onReveal={onReveal}
          secret={secret}
        />
      </td>
    </tr>
  )
}

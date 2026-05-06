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
  isMarkedForDeletion: boolean
  isRevealing: boolean
  isSaving: boolean
  isValueRevealed: boolean
  onDeleteToggle: (secret: Secret) => void
  onDraftKeyChange: (key: string) => void
  onDraftValueChange: (value: string) => void
  onCancelEdit: () => void
  onOpenHistory: (secret: Secret) => void
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
  isMarkedForDeletion,
  isRevealing,
  isSaving,
  isValueRevealed,
  onCancelEdit,
  onDeleteToggle,
  onDraftKeyChange,
  onDraftValueChange,
  onOpenHistory,
  onReveal,
  onSaveEdit,
  onStartValueEdit,
  revealedValue,
  shouldFocus = false,
  validationError,
}: SecretRowProps) {
  const keyFieldRef = useRef<HTMLInputElement>(null)
  const errorId = `secret-${secret.id}-key-error`

  useEffect(() => {
    if (!shouldFocus) {
      return
    }

    keyFieldRef.current?.focus()
  }, [shouldFocus])

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
        styles.editingRow,
        isMarkedForDeletion && styles.pendingDeleteRow,
      )}
    >
      <th className={styles.keyCell} scope="row">
        <div className={styles.fieldGroup}>
          <label className={styles.visuallyHidden} htmlFor={`key-${secret.id}`}>
            Key
          </label>
          <input
            aria-describedby={validationError ? errorId : undefined}
            aria-invalid={Boolean(validationError)}
            className={cx(
              styles.textField,
              isMarkedForDeletion && styles.markedForDeletionField,
              validationError && styles.textFieldError,
            )}
            disabled={isSaving || isMarkedForDeletion}
            id={`key-${secret.id}`}
            onChange={(event) => onDraftKeyChange(event.target.value)}
            onKeyDown={handleKeyDown}
            readOnly={isMarkedForDeletion}
            ref={keyFieldRef}
            type="text"
            value={draftKey}
          />
          {validationError ? (
            <span className={styles.inlineKeyError} id={errorId} role="alert">
              {validationError}
            </span>
          ) : null}
        </div>
      </th>
      <td className={styles.valueCell}>
        <SecretValueField
          draftValue={draftValue}
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
          isMarkedForDeletion={isMarkedForDeletion}
          isRevealing={isRevealing}
          isSaving={isSaving}
          isValueRevealed={isValueRevealed}
          onDeleteToggle={onDeleteToggle}
          onOpenHistory={onOpenHistory}
          onReveal={onReveal}
          secret={secret}
        />
      </td>
    </tr>
  )
}

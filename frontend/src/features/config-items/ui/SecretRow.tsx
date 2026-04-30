import type { KeyboardEvent } from 'react'
import { useEffect, useRef } from 'react'
import { cx } from '../../../shared/utils/cx'
import type { Secret } from '../domain'
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

const maskedValue = '************'
const emptyValue = '(empty)'

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
  const valueFieldRef = useRef<HTMLTextAreaElement>(null)
  const shouldMoveCaretRef = useRef(false)
  const isStartingValueEditRef = useRef(false)
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

  useEffect(() => {
    if (!shouldMoveCaretRef.current || draftValue === null) {
      return
    }

    valueFieldRef.current?.focus()
    const cursorPosition = draftValue.length
    valueFieldRef.current?.setSelectionRange(cursorPosition, cursorPosition)
    shouldMoveCaretRef.current = false
  }, [draftValue])

  function handleKeyDown(
    event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      onSaveEdit()
    }

    if (event.key === 'Escape') {
      event.preventDefault()
      onCancelEdit()
    }
  }

  function renderValue() {
    if (isMarkedForDeletion) {
      return ''
    }

    if (isValueRevealed && revealedValue !== undefined) {
      return revealedValue
    }

    return secret.hasValue ? maskedValue : emptyValue
  }

  function renderEditingValue() {
    if (isMarkedForDeletion) {
      return ''
    }

    if (draftValue !== null) {
      return draftValue
    }

    return secret.hasValue ? maskedValue : ''
  }

  function handleValueFieldFocus() {
    if (
      !isEditing ||
      isMarkedForDeletion ||
      isSaving ||
      !secret.hasValue ||
      draftValue !== null ||
      isStartingValueEditRef.current
    ) {
      return
    }

    shouldMoveCaretRef.current = true
    isStartingValueEditRef.current = true
    void Promise.resolve(onStartValueEdit(secret)).finally(() => {
      isStartingValueEditRef.current = false
    })
  }

  const isValueFieldLocked =
    isEditing && secret.hasValue && draftValue === null && !isMarkedForDeletion

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
        <label className={styles.visuallyHidden} htmlFor={`value-${secret.id}`}>
          Value
        </label>
        <textarea
          className={cx(
            styles.valueField,
            !isEditing && styles.readonlyField,
            isMarkedForDeletion && styles.markedForDeletionField,
          )}
          disabled={!isEditing || isSaving || isMarkedForDeletion}
          id={`value-${secret.id}`}
          onClick={handleValueFieldFocus}
          onFocus={handleValueFieldFocus}
          onChange={(event) => onDraftValueChange(event.target.value)}
          onKeyDown={handleKeyDown}
          readOnly={!isEditing || isMarkedForDeletion || isValueFieldLocked}
          ref={valueFieldRef}
          rows={1}
          value={isEditing ? renderEditingValue() : renderValue()}
        />
      </td>
      <td className={styles.actionsColumn}>
        <div className={styles.rowActions}>
          {secret.hasValue ? (
            <button
              className={cx(
                styles.iconAction,
                styles.iconActionReveal,
                isMarkedForDeletion && styles.iconActionRevealMuted,
              )}
              disabled={isRevealing}
              onClick={() => onReveal(secret)}
              type="button"
            >
              <span className={styles.visuallyHidden}>
                {isValueRevealed ? `Hide ${secret.key}` : `Reveal ${secret.key}`}
              </span>
              {isValueRevealed ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          ) : null}
          {isEditing ? (
            <button
              className={cx(
                styles.iconAction,
                styles.iconActionDelete,
                isMarkedForDeletion && styles.iconActionDeleteActive,
              )}
              disabled={isSaving}
              onClick={() => onDeleteToggle(secret)}
              type="button"
            >
              <span className={styles.visuallyHidden}>
                {isMarkedForDeletion
                  ? `Undo delete ${secret.key}`
                  : `Delete ${secret.key}`}
              </span>
              {isMarkedForDeletion ? <UndoIcon /> : <TrashIcon />}
            </button>
          ) : null}
        </div>
      </td>
    </tr>
  )
}

function EyeIcon() {
  return (
    <svg
      aria-hidden="true"
      className={styles.iconGlyph}
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M2.8 12c2.3-4.1 5.7-6.2 9.2-6.2s6.9 2.1 9.2 6.2c-2.3 4.1-5.7 6.2-9.2 6.2S5.1 16.1 2.8 12Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.9"
      />
      <circle
        cx="12"
        cy="12"
        r="3.1"
        stroke="currentColor"
        strokeWidth="1.9"
      />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg
      aria-hidden="true"
      className={styles.iconGlyph}
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M2.8 12c2.3-4.1 5.7-6.2 9.2-6.2s6.9 2.1 9.2 6.2c-2.3 4.1-5.7 6.2-9.2 6.2S5.1 16.1 2.8 12Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.9"
      />
      <circle
        cx="12"
        cy="12"
        r="3.1"
        stroke="currentColor"
        strokeWidth="1.9"
      />
      <path
        d="M4.5 4.5 19.5 19.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.9"
      />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg
      aria-hidden="true"
      className={styles.iconGlyph}
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M8.5 5.2h7"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.9"
      />
      <path
        d="M6.2 7.6h11.6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.9"
      />
      <path
        d="M8 7.6v10.1c0 .8.6 1.4 1.4 1.4h5.2c.8 0 1.4-.6 1.4-1.4V7.6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.9"
      />
      <path
        d="M10.2 10.2v6.1M13.8 10.2v6.1"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.9"
      />
    </svg>
  )
}

function UndoIcon() {
  return (
    <svg
      aria-hidden="true"
      className={styles.iconGlyph}
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M9.2 8.4 5.8 11.8l3.4 3.4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.9"
      />
      <path
        d="M6.3 11.8h8.5a4.8 4.8 0 1 1 0 9.6h-2.4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.9"
      />
    </svg>
  )
}

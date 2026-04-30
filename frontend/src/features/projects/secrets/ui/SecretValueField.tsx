import type { KeyboardEvent } from 'react'
import { useEffect, useRef } from 'react'
import { cx } from '../../../../shared/utils/cx.ts'
import type { Secret } from '../domain'
import styles from './SecretsTable.module.css'

interface SecretValueFieldProps {
  secret: Secret
  draftValue: string | null
  isEditing: boolean
  isMarkedForDeletion: boolean
  isSaving: boolean
  isValueRevealed: boolean
  onCancelEdit: () => void
  onDraftValueChange: (value: string) => void
  onSaveEdit: () => void
  onStartValueEdit: (secret: Secret) => Promise<void> | void
  revealedValue?: string
}

const maskedValue = '************'
const emptyValue = '(empty)'

export function SecretValueField({
  secret,
  draftValue,
  isEditing,
  isMarkedForDeletion,
  isSaving,
  isValueRevealed,
  onCancelEdit,
  onDraftValueChange,
  onSaveEdit,
  onStartValueEdit,
  revealedValue,
}: SecretValueFieldProps) {
  const valueFieldRef = useRef<HTMLTextAreaElement>(null)
  const shouldMoveCaretRef = useRef(false)
  const isStartingValueEditRef = useRef(false)

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

  function getDisplayValue() {
    if (isMarkedForDeletion) {
      return ''
    }

    if (isValueRevealed && revealedValue !== undefined) {
      return revealedValue
    }

    return secret.hasValue ? maskedValue : emptyValue
  }

  function getEditingValue() {
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
    <>
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
        onChange={(event) => onDraftValueChange(event.target.value)}
        onClick={handleValueFieldFocus}
        onFocus={handleValueFieldFocus}
        onKeyDown={handleKeyDown}
        readOnly={!isEditing || isMarkedForDeletion || isValueFieldLocked}
        ref={valueFieldRef}
        rows={1}
        value={isEditing ? getEditingValue() : getDisplayValue()}
      />
    </>
  )
}

import type { KeyboardEvent } from 'react'
import { useEffect, useRef } from 'react'
import { Field, FieldLabel } from '../../../../components/ui/field'
import { Input } from '../../../../components/ui/input'
import { cn } from '../../../../lib/utils'
import type { Secret } from '../domain'

interface SecretValueFieldProps {
  secret: Secret
  draftValue: string | null
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
  isMarkedForDeletion,
  isSaving,
  isValueRevealed,
  onCancelEdit,
  onDraftValueChange,
  onSaveEdit,
  onStartValueEdit,
  revealedValue,
}: SecretValueFieldProps) {
  const valueFieldRef = useRef<HTMLInputElement>(null)
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
    event: KeyboardEvent<HTMLInputElement>,
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
    secret.hasValue && draftValue === null && !isMarkedForDeletion

  return (
    <Field className="gap-1.5">
      <FieldLabel className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground md:sr-only" htmlFor={`value-${secret.id}`}>
        Value
      </FieldLabel>
      <Input
        className={cn(
          "h-9 rounded-xl border-border/60 bg-background font-mono shadow-none focus-visible:ring-2 focus-visible:ring-primary/30",
          isMarkedForDeletion && "line-through",
        )}
        disabled={isSaving || isMarkedForDeletion}
        id={`value-${secret.id}`}
        onChange={(event) => onDraftValueChange(event.target.value)}
        onClick={handleValueFieldFocus}
        onFocus={handleValueFieldFocus}
        onKeyDown={handleKeyDown}
        readOnly={isMarkedForDeletion || isValueFieldLocked}
        ref={valueFieldRef}
        type="text"
        value={draftValue !== null || !secret.hasValue ? getEditingValue() : getDisplayValue()}
      />
    </Field>
  )
}

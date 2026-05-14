import type { KeyboardEvent } from 'react'
import { useEffect, useRef } from 'react'
import { Field, FieldDescription, FieldLabel } from '../../../../components/ui/field'
import { Input } from '../../../../components/ui/input'
import { cn } from '../../../../lib/utils'
import type { Secret } from '../domain'
import { SecretRowActions } from './SecretRowActions.tsx'
import { SecretValueField } from './SecretValueField.tsx'

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
    <div
      className={cn(
        "px-1 py-1.5 transition-colors hover:bg-muted/10",
        isMarkedForDeletion && "bg-destructive/5 opacity-70",
      )}
      role="listitem"
    >
      <div className="flex flex-col gap-3 md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_auto] md:items-start md:gap-3">
        <div>
          <Field className="gap-1.5">
            <FieldLabel className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground md:sr-only" htmlFor={`key-${secret.id}`}>
              Key
            </FieldLabel>
            <Input
              aria-describedby={validationError ? errorId : undefined}
              aria-invalid={Boolean(validationError)}
              className={cn(
                "h-9 rounded-xl border-border/60 bg-background shadow-none focus-visible:ring-2 focus-visible:ring-primary/30",
                isMarkedForDeletion && "line-through",
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
              <FieldDescription
                className="text-destructive"
                id={errorId}
                role="alert"
              >
                {validationError}
              </FieldDescription>
            ) : null}
          </Field>
        </div>
        <div>
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
        </div>
        <div className="flex justify-start md:justify-end">
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
        </div>
      </div>
    </div>
  )
}

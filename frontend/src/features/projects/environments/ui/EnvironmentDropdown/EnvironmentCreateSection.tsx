import type { FormEvent, KeyboardEvent, RefObject } from 'react'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

export interface EnvironmentCreateSectionProps {
  createError: string
  createInputRef: RefObject<HTMLInputElement | null>
  createName: string
  isCreatePending: boolean
  isCreating: boolean
  listboxId: string
  onCreateInputChange: (environmentName: string) => void
  onCreateInputKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void
  onCreateStart: () => void
  onResetCreateState: () => void
  onSubmitCreate: (event: FormEvent<HTMLFormElement>) => void
}

export function EnvironmentCreateSection({
  createError,
  createInputRef,
  createName,
  isCreatePending,
  isCreating,
  listboxId,
  onCreateInputChange,
  onCreateInputKeyDown,
  onCreateStart,
  onResetCreateState,
  onSubmitCreate,
}: EnvironmentCreateSectionProps) {
  if (!isCreating) {
    return (
      <Button
        className="w-full justify-start px-2.5 text-primary"
        onClick={onCreateStart}
        size="sm"
        type="button"
        variant="ghost"
      >
        + Add environment
      </Button>
    )
  }

  return (
    <form className="flex flex-col gap-2" onSubmit={onSubmitCreate}>
      <Field className="gap-1.5">
        <FieldLabel className="text-xs font-semibold text-foreground" htmlFor={`${listboxId}-create-input`}>
          Environment name
        </FieldLabel>
        <Input
          aria-describedby={createError ? `${listboxId}-create-error` : undefined}
          aria-invalid={Boolean(createError)}
          className="h-9 rounded-lg border-border bg-background px-2.5 py-2 shadow-none"
          disabled={isCreatePending}
          id={`${listboxId}-create-input`}
          onChange={(event) => onCreateInputChange(event.target.value)}
          onKeyDown={onCreateInputKeyDown}
          ref={createInputRef}
          type="text"
          value={createName}
        />

        {createError ? (
          <FieldDescription
            className="text-destructive"
            id={`${listboxId}-create-error`}
            role="alert"
          >
            {createError}
          </FieldDescription>
        ) : null}
      </Field>

      <div className="grid grid-cols-2 gap-2">
        <Button disabled={isCreatePending} size="sm" type="submit">
          {isCreatePending ? 'Creating' : 'Create'}
        </Button>
        <Button
          disabled={isCreatePending}
          onClick={onResetCreateState}
          size="sm"
          type="button"
          variant="outline"
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}

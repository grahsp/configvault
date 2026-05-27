import { type FormEvent, type ReactNode, useId } from 'react'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

interface AddMemberFormProps {
  actions?: ReactNode
  canManageMembers: boolean
  errorMessage: string
  isPending: boolean
  onSubmit: () => void
  onUserIdChange: (userId: string) => void
  userId: string
}

export function AddMemberForm({
  actions,
  canManageMembers,
  errorMessage,
  isPending,
  onSubmit,
  onUserIdChange,
  userId,
}: AddMemberFormProps) {
  const errorId = useId()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSubmit()
  }

  if (!canManageMembers) {
    return null
  }

  return (
    <form
      aria-label="Add member"
      className="grid grid-cols-1 items-end gap-3 rounded-lg border bg-card p-4 sm:grid-cols-[minmax(180px,1fr)_auto]"
      onSubmit={handleSubmit}
    >
      <Field className="gap-1.5">
        <Input
          aria-label="User ID"
          aria-describedby={errorMessage ? errorId : undefined}
          aria-invalid={errorMessage ? 'true' : undefined}
          className="h-10 rounded-lg border-border bg-background shadow-none"
          disabled={isPending}
          onChange={(event) => onUserIdChange(event.target.value)}
          placeholder="Add by user ID"
          type="text"
          value={userId}
        />
      </Field>

      <div className="flex flex-wrap items-center justify-end gap-2 sm:justify-end">
        <Button disabled={isPending} type="submit" variant="default">
          {isPending ? 'Adding' : '+ Add'}
        </Button>
        {actions}
      </div>

      {errorMessage ? (
        <FieldDescription
          className="m-0 text-destructive sm:col-span-2"
          id={errorId}
          role="alert"
        >
          {errorMessage}
        </FieldDescription>
      ) : null}
    </form>
  )
}

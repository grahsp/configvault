import { type FormEvent, type ReactNode, useId } from 'react'
import { Button } from '../../../../components/ui/button'
import styles from '../../pages/ProjectDetailPage/ProjectDetailPage.module.css'

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
      className={styles.addMemberForm}
      onSubmit={handleSubmit}
    >
      <div className={styles.formField}>
        <input
          aria-label="User ID"
          aria-describedby={errorMessage ? errorId : undefined}
          aria-invalid={errorMessage ? 'true' : undefined}
          className={styles.textInput}
          disabled={isPending}
          onChange={(event) => onUserIdChange(event.target.value)}
          placeholder="Add by user ID"
          type="text"
          value={userId}
        />
      </div>

      <div className={styles.memberActions}>
        <Button disabled={isPending} type="submit" variant="default">
          {isPending ? 'Adding' : '+ Add'}
        </Button>
        {actions}
      </div>

      {errorMessage ? (
        <p className={styles.formError} id={errorId} role="alert">
          {errorMessage}
        </p>
      ) : null}
    </form>
  )
}

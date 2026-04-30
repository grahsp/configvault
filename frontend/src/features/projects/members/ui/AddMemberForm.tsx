import { type FormEvent, useId } from 'react'
import styles from '../../pages/ProjectDetailPage/ProjectDetailPage.module.css'

interface AddMemberFormProps {
  canManageMembers: boolean
  errorMessage: string
  isPending: boolean
  onSubmit: () => void
  onUserIdChange: (userId: string) => void
  userId: string
}

export function AddMemberForm({
  canManageMembers,
  errorMessage,
  isPending,
  onSubmit,
  onUserIdChange,
  userId,
}: AddMemberFormProps) {
  const inputId = useId()
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
        <label className={styles.formLabel} htmlFor={inputId}>
          User ID
        </label>
        <input
          aria-describedby={errorMessage ? errorId : undefined}
          aria-invalid={errorMessage ? 'true' : undefined}
          className={styles.textInput}
          disabled={isPending}
          id={inputId}
          onChange={(event) => onUserIdChange(event.target.value)}
          type="text"
          value={userId}
        />
      </div>

      <button
        className={styles.memberAction}
        disabled={isPending}
        type="submit"
      >
        {isPending ? 'Adding' : 'Add Member'}
      </button>

      {errorMessage ? (
        <p className={styles.formError} id={errorId} role="alert">
          {errorMessage}
        </p>
      ) : null}
    </form>
  )
}

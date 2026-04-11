import { type FormEvent, useId, useState } from 'react'
import { useAddProjectMember } from '../hooks/useProjects'
import { getErrorMessage } from '../pages/projectPageUtils'
import styles from '../pages/ProjectDetailPage/ProjectDetailPage.module.css'

interface AddMemberFormProps {
  canManageMembers: boolean
  projectId: string
}

export function AddMemberForm({
  canManageMembers,
  projectId,
}: AddMemberFormProps) {
  const inputId = useId()
  const errorId = useId()
  const [userId, setUserId] = useState('')
  const [validationError, setValidationError] = useState('')
  const addMemberMutation = useAddProjectMember(projectId)
  const errorMessage = validationError || getMutationErrorMessage()

  function getMutationErrorMessage() {
    if (!addMemberMutation.isError) {
      return ''
    }

    return getErrorMessage(
      addMemberMutation.error,
      'Member could not be added.',
    )
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedUserId = userId.trim()

    addMemberMutation.reset()

    if (!trimmedUserId) {
      setValidationError('Enter a user ID.')
      return
    }

    setValidationError('')
    addMemberMutation.mutate(trimmedUserId, {
      onSuccess: () => setUserId(''),
    })
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
          disabled={addMemberMutation.isPending}
          id={inputId}
          onChange={(event) => {
            setUserId(event.target.value)
            if (validationError) {
              setValidationError('')
            }
          }}
          type="text"
          value={userId}
        />
      </div>

      <button
        className={styles.memberAction}
        disabled={addMemberMutation.isPending}
        type="submit"
      >
        {addMemberMutation.isPending ? 'Adding' : 'Add Member'}
      </button>

      {errorMessage ? (
        <p className={styles.formError} id={errorId} role="alert">
          {errorMessage}
        </p>
      ) : null}
    </form>
  )
}

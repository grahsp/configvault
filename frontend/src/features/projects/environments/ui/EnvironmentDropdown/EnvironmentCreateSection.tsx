import type { FormEvent, KeyboardEvent, RefObject } from 'react'
import { cn } from '@/lib/utils'
import styles from './EnvironmentDropdown.module.css'

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
      <button className={styles.addAction} onClick={onCreateStart} type="button">
        + Add environment
      </button>
    )
  }

  return (
    <form className={styles.createForm} onSubmit={onSubmitCreate}>
      <label className={styles.createLabel}>
        Environment name
        <input
          aria-describedby={createError ? `${listboxId}-create-error` : undefined}
          aria-invalid={Boolean(createError)}
          className={styles.createInput}
          disabled={isCreatePending}
          onChange={(event) => onCreateInputChange(event.target.value)}
          onKeyDown={onCreateInputKeyDown}
          ref={createInputRef}
          type="text"
          value={createName}
        />
      </label>

      {createError ? (
        <p
          className={styles.createError}
          id={`${listboxId}-create-error`}
          role="alert"
        >
          {createError}
        </p>
      ) : null}

      <div className={styles.createActions}>
        <button
          className={cn(styles.createButton, styles.createSubmit)}
          disabled={isCreatePending}
          type="submit"
        >
          {isCreatePending ? 'Creating' : 'Create'}
        </button>
        <button
          className={cn(styles.createButton, styles.createCancel)}
          disabled={isCreatePending}
          onClick={onResetCreateState}
          type="button"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

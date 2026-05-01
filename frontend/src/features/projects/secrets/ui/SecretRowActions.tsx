import { cx } from '../../../../shared/utils/cx.ts'
import type { Secret } from '../domain'
import { EyeIcon, EyeOffIcon, TrashIcon, UndoIcon } from './SecretRowIcons.tsx'
import styles from './SecretsTable.module.css'

interface SecretRowActionsProps {
  secret: Secret
  isMarkedForDeletion: boolean
  isRevealing: boolean
  isSaving: boolean
  isValueRevealed: boolean
  onDeleteToggle: (secret: Secret) => void
  onReveal: (secret: Secret) => void
}

export function SecretRowActions({
  secret,
  isMarkedForDeletion,
  isRevealing,
  isSaving,
  isValueRevealed,
  onDeleteToggle,
  onReveal,
}: SecretRowActionsProps) {
  return (
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
          {isMarkedForDeletion ? `Undo delete ${secret.key}` : `Delete ${secret.key}`}
        </span>
        {isMarkedForDeletion ? <UndoIcon /> : <TrashIcon />}
      </button>
    </div>
  )
}

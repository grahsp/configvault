import { cx } from '../../../../../shared/utils/cx.ts'
import type { Environment } from '../../domain'
import styles from './EnvironmentDropdown.module.css'

export interface EnvironmentOptionRowProps {
  environment: Environment
  id: string
  isActive: boolean
  isDeleting: boolean
  isOnlyEnvironment: boolean
  isSelected: boolean
  onOpenDeleteDialog: (environment: Environment) => void
  onSelectEnvironment: (environment: Environment) => void
}

export function EnvironmentOptionRow({
  environment,
  id,
  isActive,
  isDeleting,
  isOnlyEnvironment,
  isSelected,
  onOpenDeleteDialog,
  onSelectEnvironment,
}: EnvironmentOptionRowProps) {
  return (
    <div className={styles.optionRow}>
      <button
        aria-selected={isSelected}
        className={cx(
          styles.option,
          isActive && styles.optionActive,
          isSelected && styles.optionSelected,
        )}
        id={id}
        onClick={() => onSelectEnvironment(environment)}
        role="option"
        type="button"
      >
        {environment.environmentName}
      </button>
      <button
        aria-label={
          isOnlyEnvironment
            ? `Cannot delete ${environment.environmentName} because it is the only environment`
            : `Delete ${environment.environmentName}`
        }
        className={styles.deleteAction}
        disabled={isOnlyEnvironment || isDeleting}
        onClick={() => onOpenDeleteDialog(environment)}
        type="button"
      >
        {isDeleting ? 'Deleting' : 'Delete'}
      </button>
    </div>
  )
}

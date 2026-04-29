import { cx } from '../../../../shared/utils/cx'
import type { Environment } from '../../model'
import styles from './EnvironmentDropdown.module.css'

export interface EnvironmentOptionsListProps {
  activeIndex: number
  deletingEnvironmentId: string
  environments: Environment[]
  listboxId: string
  onOpenDeleteDialog: (environment: Environment) => void
  onSelectEnvironment: (environment: Environment) => void
  selectedEnvironmentId: string
}

export function EnvironmentOptionsList({
  activeIndex,
  deletingEnvironmentId,
  environments,
  listboxId,
  onOpenDeleteDialog,
  onSelectEnvironment,
  selectedEnvironmentId,
}: EnvironmentOptionsListProps) {
  return environments.map((environment, index) => (
    <div className={styles.optionRow} key={environment.id}>
      <button
        aria-selected={environment.id === selectedEnvironmentId}
        className={cx(
          styles.option,
          index === activeIndex && styles.optionActive,
          environment.id === selectedEnvironmentId && styles.optionSelected,
        )}
        id={`${listboxId}-option-${environment.id}`}
        onClick={() => onSelectEnvironment(environment)}
        role="option"
        type="button"
      >
        {environment.environmentName}
      </button>
      <button
        aria-label={
          environments.length <= 1
            ? `Cannot delete ${environment.environmentName} because it is the only environment`
            : `Delete ${environment.environmentName}`
        }
        className={styles.deleteAction}
        disabled={
          environments.length <= 1 || deletingEnvironmentId === environment.id
        }
        onClick={() => onOpenDeleteDialog(environment)}
        type="button"
      >
        {deletingEnvironmentId === environment.id ? 'Deleting' : 'Delete'}
      </button>
    </div>
  ))
}

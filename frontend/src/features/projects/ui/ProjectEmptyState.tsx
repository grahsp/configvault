import { cx } from '../../../shared/utils/cx'
import styles from '../pages/ProjectsPage/ProjectsPage.module.css'

interface ProjectEmptyStateProps {
  onCreateProject: () => void
}

export function ProjectEmptyState({ onCreateProject }: ProjectEmptyStateProps) {
  return (
    <div className={styles.state}>
      <p className={styles.stateTitle}>No projects yet</p>
      <p className={styles.stateCopy}>
        Create a project to start organizing vault entries.
      </p>
      <button
        className={cx(styles.button, styles.buttonSecondary)}
        onClick={onCreateProject}
        type="button"
      >
        Create your first project
      </button>
    </div>
  )
}

import type { ProjectListItem } from '../../types'
import { cx, getErrorMessage } from '../projectPageUtils'
import styles from './ProjectsPage.module.css'
import { ProjectEmptyState, ProjectList } from './ProjectList'

interface ProjectsContentProps {
  error: unknown
  isDeletePending: boolean
  isError: boolean
  isPending: boolean
  onCreateProject: () => void
  onRetry: () => void
  onSelectProjectForDelete: (projectId: string) => void
  projects: ProjectListItem[]
}

export function ProjectsContent({
  error,
  isDeletePending,
  isError,
  isPending,
  onCreateProject,
  onRetry,
  onSelectProjectForDelete,
  projects,
}: ProjectsContentProps) {
  if (isPending) {
    return (
      <div className={styles.state} role="status">
        <p className={styles.stateTitle}>Loading projects</p>
        <p className={styles.stateCopy}>
          Your workspace list is being prepared.
        </p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className={cx(styles.state, styles.stateError)} role="alert">
        <p className={styles.stateTitle}>Projects could not load</p>
        <p className={styles.stateCopy}>
          {getErrorMessage(
            error,
            'Something went wrong while loading projects.',
          )}
        </p>
        <button
          className={cx(styles.button, styles.buttonSecondary)}
          onClick={onRetry}
          type="button"
        >
          Retry
        </button>
      </div>
    )
  }

  if (projects.length === 0) {
    return <ProjectEmptyState onCreateProject={onCreateProject} />
  }

  return (
    <ProjectList
      isDeletePending={isDeletePending}
      onSelectProjectForDelete={onSelectProjectForDelete}
      projects={projects}
    />
  )
}

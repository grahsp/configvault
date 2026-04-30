import { Link } from 'react-router-dom'
import { cx } from '../../../shared/utils/cx'
import type { ProjectListItem } from '../model/types'
import { formatCreatedDate } from '../model/projectUtils'
import styles from '../pages/ProjectsPage/ProjectsPage.module.css'

interface ProjectListProps {
  isDeletePending: boolean
  onSelectProjectForDelete: (projectId: string) => void
  projects: ProjectListItem[]
}

export function ProjectList({
  isDeletePending,
  onSelectProjectForDelete,
  projects,
}: ProjectListProps) {
  return (
    <ul className={styles.projectList} aria-label="Projects">
      {projects.map((project) => (
        <li className={styles.projectListItem} key={project.id}>
          <Link
            className={styles.projectListLink}
            to={`/projects/${project.id}`}
          >
            <span className={styles.projectListName}>{project.name}</span>
            <span className={styles.projectListMeta}>
              Created {formatCreatedDate(project.createdAt)}
            </span>
          </Link>
          <button
            className={styles.projectListDelete}
            disabled={isDeletePending}
            onClick={() => onSelectProjectForDelete(project.id)}
            type="button"
          >
            Delete
          </button>
        </li>
      ))}
    </ul>
  )
}

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

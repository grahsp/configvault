import { Link } from 'react-router-dom'
import { Button } from '../../../shared/ui'
import { formatCreatedDate, type ProjectListItem } from '../domain'
import styles from '../pages/ProjectsPage/ProjectsPage.module.css'

interface ProjectListRowProps {
  isDeletePending: boolean
  onSelectProjectForDelete: (projectId: string) => void
  project: ProjectListItem
}

export function ProjectListRow({
  isDeletePending,
  onSelectProjectForDelete,
  project,
}: ProjectListRowProps) {
  return (
    <li className={styles.projectListItem}>
      <Link className={styles.projectListLink} to={`/projects/${project.id}`}>
        <span className={styles.projectListName}>{project.name}</span>
        <span className={styles.projectListMeta}>
          Created {formatCreatedDate(project.createdAt)}
        </span>
      </Link>
      <Button
        className={styles.projectListDelete}
        disabled={isDeletePending}
        onClick={() => onSelectProjectForDelete(project.id)}
        type="button"
        variant="danger"
      >
        Delete
      </Button>
    </li>
  )
}

import type { ProjectListItem as ProjectListItemModel } from '../domain'
import { ProjectListRow } from './ProjectListRow'
import styles from '../pages/ProjectsPage/ProjectsPage.module.css'

interface ProjectListProps {
  isDeletePending: boolean
  onSelectProjectForDelete: (projectId: string) => void
  projects: ProjectListItemModel[]
}

export function ProjectList({
  isDeletePending,
  onSelectProjectForDelete,
  projects,
}: ProjectListProps) {
  return (
    <ul className={styles.projectList} aria-label="Projects">
      {projects.map((project) => (
        <ProjectListRow
          isDeletePending={isDeletePending}
          key={project.id}
          onSelectProjectForDelete={onSelectProjectForDelete}
          project={project}
        />
      ))}
    </ul>
  )
}

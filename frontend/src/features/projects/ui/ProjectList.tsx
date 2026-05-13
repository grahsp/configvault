import type { ProjectListItem as ProjectListItemModel } from '../domain'
import { ProjectListRow } from './ProjectListRow'

interface ProjectListProps {
  projects: ProjectListItemModel[]
}

export function ProjectList({ projects }: ProjectListProps) {
  return (
    <ul
      aria-label="Projects"
      className="m-0 flex list-none flex-col gap-2.5 p-0 sm:gap-3"
    >
      {projects.map((project) => (
        <ProjectListRow key={project.id} project={project} />
      ))}
    </ul>
  )
}

import { Link } from 'react-router-dom'
import { formatCreatedDate, type ProjectListItem } from '../domain'

interface ProjectListRowProps {
  project: ProjectListItem
}

export function ProjectListRow({ project }: ProjectListRowProps) {
  return (
    <li>
      <Link
        className="group block px-3 py-[1.125rem] text-inherit no-underline transition-colors hover:bg-[color:var(--color-surface-glass-subtle)] focus-visible:bg-[color:var(--color-surface-glass-subtle)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 sm:px-4 sm:py-5"
        to={`/projects/${project.id}`}
      >
        <span className="flex min-w-0 flex-col gap-1">
          <span className="text-[var(--font-size-title-md)] font-extrabold text-[color:var(--color-inverse)] transition-colors [overflow-wrap:anywhere] group-hover:text-primary group-focus-visible:text-primary">
            {project.name}
          </span>
          <span className="text-[var(--font-size-body-md)] text-[color:var(--color-text-disabled)]">
            Created {formatCreatedDate(project.createdAt)}
          </span>
        </span>
      </Link>
    </li>
  )
}

import { ChevronRightIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatCreatedDate, type ProjectListItem } from '../domain'

interface ProjectListRowProps {
  project: ProjectListItem
}

export function ProjectListRow({ project }: ProjectListRowProps) {
  return (
    <li>
      <Link
        className="group flex cursor-pointer items-center justify-between gap-5 rounded-md px-4 py-3.5 text-inherit no-underline transition-colors hover:bg-[color:var(--color-surface-muted-hover)] focus-visible:bg-[color:var(--color-surface-muted-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 sm:px-5 sm:py-4"
        to={`/projects/${project.id}`}
      >
        <span className="flex min-w-0 flex-1 flex-col gap-1.5">
          <span className="text-[1.05rem] font-semibold leading-6 text-[color:var(--color-inverse)] transition-colors [overflow-wrap:anywhere] group-hover:text-primary group-focus-visible:text-primary sm:text-[1.1rem]">
            {project.name}
          </span>
          <span className="text-sm leading-6 text-[color:var(--color-text-disabled)]">
            {formatCreatedDate(project.createdAt)}
          </span>
        </span>
        <span
          aria-hidden="true"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[color:var(--color-text-muted)] opacity-70 transition-all group-hover:translate-x-0.5 group-hover:text-[color:var(--color-text-body)] group-hover:opacity-100 group-focus-visible:translate-x-0.5 group-focus-visible:text-[color:var(--color-text-body)] group-focus-visible:opacity-100"
        >
          <ChevronRightIcon className="size-4" />
        </span>
      </Link>
    </li>
  )
}

import { MoreHorizontalIcon } from 'lucide-react'
import { Outlet } from 'react-router-dom'
import { Button } from '../../../../components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../../components/ui/dropdown-menu'
import type { ProjectDetails } from '../../domain'
import type { ProjectLayoutContext } from './ProjectDetailPage'

interface ProjectLayoutProps {
  onOpenProjectDeleteDialog: () => void
  project: ProjectDetails
}

export function ProjectLayout({
  onOpenProjectDeleteDialog,
  project,
}: ProjectLayoutProps) {
  return (
    <>
      <div className="flex items-start justify-between gap-3 pb-1">
        <div className="min-w-0">
          <h1 className="sr-only" id="project-detail-title">
            {project.name}
          </h1>
        </div>
        <ProjectActionsMenu onOpenProjectDeleteDialog={onOpenProjectDeleteDialog} />
      </div>
      <Outlet
        context={{
          project,
        } satisfies ProjectLayoutContext}
      />
    </>
  )
}

interface ProjectActionsMenuProps {
  onOpenProjectDeleteDialog: () => void
}

function ProjectActionsMenu({
  onOpenProjectDeleteDialog,
}: ProjectActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label="Actions"
          className="shrink-0"
          size="icon-sm"
          type="button"
          variant="ghost"
        >
          <MoreHorizontalIcon className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onSelect={onOpenProjectDeleteDialog}
          variant="destructive"
        >
          Delete project
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

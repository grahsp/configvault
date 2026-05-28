import { Trash2Icon } from 'lucide-react'
import { useOutletContext } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import type { ProjectLayoutContext } from '@/features/projects/pages/ProjectDetailPage/ProjectDetailPage'
import { ProjectSettingsEnvironmentsSection } from '@/features/projects/pages/ProjectSettingsPage/ProjectSettingsEnvironmentsSection'

export function ProjectSettingsPage() {
  const { onOpenProjectDeleteDialog, project } =
    useOutletContext<ProjectLayoutContext>()

  return (
    <section aria-label="Project settings" className="grid gap-6">
      <ProjectSettingsEnvironmentsSection project={project} />

      <section
        aria-labelledby="project-danger-title"
        className="rounded-md border border-destructive/25 bg-destructive/5 p-4"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="grid gap-1">
            <h3
              className="text-sm font-semibold text-foreground"
              id="project-danger-title"
            >
              Delete project
            </h3>
            <p className="max-w-[58ch] text-sm leading-6 text-muted-foreground">
              Permanently remove this project and its configuration.
            </p>
          </div>
          <Button
            className="w-fit"
            onClick={onOpenProjectDeleteDialog}
            type="button"
            variant="destructive"
          >
            <Trash2Icon aria-hidden="true" className="size-4" />
            Delete project
          </Button>
        </div>
      </section>
    </section>
  )
}

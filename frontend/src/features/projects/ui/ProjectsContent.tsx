import { Button, StatePanel } from '../../../shared/ui'
import { getErrorMessage, type ProjectListItem } from '../domain'
import { ProjectEmptyState } from './ProjectEmptyState'
import { ProjectList } from './ProjectList'

interface ProjectsContentProps {
  error: unknown
  isError: boolean
  isPending: boolean
  onCreateProject: () => void
  onRetry: () => void
  projects: ProjectListItem[]
}

export function ProjectsContent({
  error,
  isError,
  isPending,
  onCreateProject,
  onRetry,
  projects,
}: ProjectsContentProps) {
  if (isPending) {
    return (
      <StatePanel role="status" title="Loading projects">
        <p>
          Your workspace list is being prepared.
        </p>
      </StatePanel>
    )
  }

  if (isError) {
    return (
      <StatePanel
        actions={
          <Button onClick={onRetry} type="button" variant="secondary">
            Retry
          </Button>
        }
        role="alert"
        title="Projects could not load"
        tone="error"
      >
        <p>
          {getErrorMessage(
            error,
            'Something went wrong while loading projects.',
          )}
        </p>
      </StatePanel>
    )
  }

  if (projects.length === 0) {
    return <ProjectEmptyState onCreateProject={onCreateProject} />
  }

  return <ProjectList projects={projects} />
}

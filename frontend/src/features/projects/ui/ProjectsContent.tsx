import { Button } from '../../../components/ui/button'
import { StatePanel } from '../../../shared/ui'
import { getErrorMessage, type ProjectListItem } from '../domain'
import { ProjectEmptyState } from './ProjectEmptyState'
import { ProjectList } from './ProjectList'

interface ProjectsContentProps {
  error: unknown
  hasActiveSearch: boolean
  isError: boolean
  isPending: boolean
  onCreateProject: () => void
  onRetry: () => void
  projects: ProjectListItem[]
  searchTerm: string
}

export function ProjectsContent({
  error,
  hasActiveSearch,
  isError,
  isPending,
  onCreateProject,
  onRetry,
  projects,
  searchTerm,
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
          <Button onClick={onRetry} type="button" variant="outline">
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
    if (hasActiveSearch) {
      return (
        <StatePanel title="No matching projects">
          <p>
            No projects matched "{searchTerm.trim()}". Try a different search.
          </p>
        </StatePanel>
      )
    }

    return <ProjectEmptyState onCreateProject={onCreateProject} />
  }

  return <ProjectList projects={projects} />
}

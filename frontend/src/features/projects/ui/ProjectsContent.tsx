import { Button } from '../../../components/ui/button'
import { StatusPanel } from '@/components/composed'
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
      <StatusPanel role="status" title="Loading projects">
        <p>
          Your workspace list is being prepared.
        </p>
      </StatusPanel>
    )
  }

  if (isError) {
    return (
      <StatusPanel
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
      </StatusPanel>
    )
  }

  if (projects.length === 0) {
    if (hasActiveSearch) {
      return (
        <StatusPanel title="No matching projects">
          <p>
            No projects matched "{searchTerm.trim()}". Try a different search.
          </p>
        </StatusPanel>
      )
    }

    return <ProjectEmptyState onCreateProject={onCreateProject} />
  }

  return <ProjectList projects={projects} />
}

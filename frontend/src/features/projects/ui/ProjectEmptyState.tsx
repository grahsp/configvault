import { Button } from '../../../components/ui/button'
import { StatePanel } from '../../../shared/ui'

interface ProjectEmptyStateProps {
  onCreateProject: () => void
}

export function ProjectEmptyState({ onCreateProject }: ProjectEmptyStateProps) {
  return (
    <StatePanel
      actions={
        <Button onClick={onCreateProject} type="button" variant="outline">
          Create your first project
        </Button>
      }
      title="No projects yet"
    >
      <p>
        Create a project to start organizing vault entries.
      </p>
    </StatePanel>
  )
}

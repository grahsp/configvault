import { useOutletContext } from 'react-router-dom'
import type { ProjectLayoutContext } from '../../pages'
import { SecretsSection } from './SecretsSection.tsx'

export function SecretsPage() {
  const { project, selectedEnvironmentName } =
    useOutletContext<ProjectLayoutContext>()

  return (
    <section className="flex flex-col gap-6">
      <SecretsSection
        environmentName={selectedEnvironmentName}
        projectId={project.id}
      />
    </section>
  )
}

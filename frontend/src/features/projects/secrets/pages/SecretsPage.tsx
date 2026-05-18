import { useOutletContext } from 'react-router-dom'
import type { ProjectLayoutContext } from '../../pages'
import { SecretsSection } from './SecretsSection.tsx'

export function SecretsPage() {
  const {
    isEnvironmentLoading,
    project,
    selectedEnvironmentName,
  } =
    useOutletContext<ProjectLayoutContext>()

  return (
    <section className="flex flex-col pt-2 sm:pt-2.5">
      <SecretsSection
        environmentName={selectedEnvironmentName}
        isEnvironmentLoading={isEnvironmentLoading}
        projectId={project.id}
        projectName={project.name}
      />
    </section>
  )
}

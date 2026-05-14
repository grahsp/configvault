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
    <section className="flex flex-col pt-3 sm:pt-4">
      <SecretsSection
        environmentName={selectedEnvironmentName}
        isEnvironmentLoading={isEnvironmentLoading}
        projectId={project.id}
      />
    </section>
  )
}

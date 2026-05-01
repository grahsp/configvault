import { useOutletContext } from 'react-router-dom'
import type { ProjectLayoutContext } from '../../pages'
import { SecretsSection } from './SecretsSection.tsx'
import styles from './SecretsPage.module.css'

export function SecretsPage() {
  const { project, selectedEnvironmentName } =
    useOutletContext<ProjectLayoutContext>()

  return (
    <section className={styles.page}>
      <SecretsSection
        environmentName={selectedEnvironmentName}
        projectId={project.id}
      />
    </section>
  )
}

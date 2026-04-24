import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import type { ProjectLayoutContext } from '../../projects/pages/ProjectLayout'
import { ConfigItemsTable } from '../components/ConfigItemsTable'
import styles from './ProjectSecretsPage.module.css'

export function ProjectSecretsPage() {
  const { project, selectedEnvironmentName } =
    useOutletContext<ProjectLayoutContext>()
  const [focusedConfigItemId, setFocusedConfigItemId] = useState<string | null>(
    null,
  )

  return (
    <section className={styles.page}>
      <ConfigItemsTable
        environmentName={selectedEnvironmentName}
        focusedConfigItemId={focusedConfigItemId}
        onFocusConfigItem={setFocusedConfigItemId}
        projectId={project.id}
      />
    </section>
  )
}

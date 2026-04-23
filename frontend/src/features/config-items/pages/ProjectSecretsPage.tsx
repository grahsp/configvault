import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import type { ProjectLayoutContext } from '../../projects/pages/ProjectLayout'
import { AddConfigItemModal } from '../components/AddConfigItemModal'
import { ConfigItemsTable } from '../components/ConfigItemsTable'
import styles from './ProjectSecretsPage.module.css'

export function ProjectSecretsPage() {
  const { project, selectedEnvironmentName } =
    useOutletContext<ProjectLayoutContext>()
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [focusedConfigItemId, setFocusedConfigItemId] = useState<string | null>(
    null,
  )

  function handleCreated() {
    setFocusedConfigItemId(null)
    setIsAddModalOpen(false)
  }

  return (
    <>
      <section className={styles.page}>
        <ConfigItemsTable
          environmentName={selectedEnvironmentName}
          focusedConfigItemId={focusedConfigItemId}
          onAddConfigItem={() => setIsAddModalOpen(true)}
          projectId={project.id}
        />
      </section>

      {isAddModalOpen ? (
        <AddConfigItemModal
          environmentName={selectedEnvironmentName}
          onCancel={() => setIsAddModalOpen(false)}
          onCreated={handleCreated}
          projectId={project.id}
        />
      ) : null}
    </>
  )
}

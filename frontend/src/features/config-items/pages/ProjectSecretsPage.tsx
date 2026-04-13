import { useCallback, useState } from 'react'
import { useOutletContext, useSearchParams } from 'react-router-dom'
import { EnvironmentDropdown } from '../../environments/components/EnvironmentDropdown'
import type { Environment } from '../../environments/types'
import type { ProjectLayoutContext } from '../../projects/pages/ProjectLayout'
import { AddConfigItemModal } from '../components/AddConfigItemModal'
import { ConfigItemsTable } from '../components/ConfigItemsTable'
import styles from './ProjectSecretsPage.module.css'

export function ProjectSecretsPage() {
  const { project } = useOutletContext<ProjectLayoutContext>()
  const [searchParams, setSearchParams] = useSearchParams()
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [focusedConfigItemId, setFocusedConfigItemId] = useState<string | null>(
    null,
  )
  const [selectedEnvironmentName, setSelectedEnvironmentName] = useState('')
  const selectedEnvironmentId = searchParams.get('environmentId') ?? ''

  function handleEnvironmentChange(environmentId: string) {
    setSearchParams((currentParams) => {
      const nextParams = new URLSearchParams(currentParams)

      if (environmentId) {
        nextParams.set('environmentId', environmentId)
      } else {
        nextParams.delete('environmentId')
      }

      return nextParams
    })
  }

  const handleSelectedEnvironmentChange = useCallback(
    (environment: Environment | null) => {
      setSelectedEnvironmentName(environment?.environmentName ?? '')
    },
    [],
  )

  function handleCreated() {
    setFocusedConfigItemId(null)
    setIsAddModalOpen(false)
  }

  return (
    <>
      <section className={styles.page} aria-labelledby="secrets-title">
        <div className={styles.header}>
          <div>
            <h2 className={styles.title} id="secrets-title">
              Secrets
            </h2>
          </div>

          <div className={styles.actions}>
            <div className={styles.environmentPicker}>
              <span className={styles.environmentPickerLabel}>Environment</span>
              <EnvironmentDropdown
                onEnvironmentChange={handleEnvironmentChange}
                onSelectedEnvironmentChange={handleSelectedEnvironmentChange}
                projectId={project.id}
                selectedEnvironmentId={selectedEnvironmentId}
              />
            </div>
            <button
              className={styles.addButton}
              onClick={() => setIsAddModalOpen(true)}
              type="button"
            >
              Add Secret
            </button>
          </div>
        </div>

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

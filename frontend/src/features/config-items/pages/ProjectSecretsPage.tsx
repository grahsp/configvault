import { useState } from 'react'
import { useOutletContext, useSearchParams } from 'react-router-dom'
import { EnvironmentDropdown } from '../../environments/components/EnvironmentDropdown'
import type { ProjectLayoutContext } from '../../projects/pages/ProjectLayout'
import { AddConfigItemModal } from '../components/AddConfigItemModal'
import { ConfigItemsTable } from '../components/ConfigItemsTable'
import type { ConfigItem } from '../types/ConfigItem'
import styles from './ProjectSecretsPage.module.css'

export function ProjectSecretsPage() {
  const { project } = useOutletContext<ProjectLayoutContext>()
  const [searchParams, setSearchParams] = useSearchParams()
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [focusedConfigItemId, setFocusedConfigItemId] = useState<string | null>(
    null,
  )
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

  function handleCreated(configItem: ConfigItem) {
    setFocusedConfigItemId(configItem.id)
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
          focusedConfigItemId={focusedConfigItemId}
          onAddConfigItem={() => setIsAddModalOpen(true)}
          projectId={project.id}
        />
      </section>

      {isAddModalOpen ? (
        <AddConfigItemModal
          onCancel={() => setIsAddModalOpen(false)}
          onCreated={handleCreated}
          projectId={project.id}
        />
      ) : null}
    </>
  )
}

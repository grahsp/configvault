import { useOutletContext, useSearchParams } from 'react-router-dom'
import { EnvironmentDropdown } from '../../environments/components/EnvironmentDropdown'
import type { ProjectLayoutContext } from './ProjectLayout'
import styles from './ProjectDetailPage/ProjectDetailPage.module.css'

export function SecretsPage() {
  const { project } = useOutletContext<ProjectLayoutContext>()
  const [searchParams, setSearchParams] = useSearchParams()
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

  return (
    <section className={styles.placeholder} aria-labelledby="secrets-title">
      <div className={styles.placeholderHeader}>
        <h2 className={styles.placeholderTitle} id="secrets-title">
          Secrets
        </h2>
        <div className={styles.environmentPicker}>
          <span className={styles.environmentPickerLabel}>Environment</span>
          <EnvironmentDropdown
            onEnvironmentChange={handleEnvironmentChange}
            projectId={project.id}
            selectedEnvironmentId={selectedEnvironmentId}
          />
        </div>
      </div>
      <p className={styles.placeholderCopy}>
        Vault entries and controls will appear here.
      </p>
    </section>
  )
}

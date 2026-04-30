import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useToast } from '../../../shared/components/toast/useToast'
import { cx } from '../../../shared/utils/cx'
import type { ProjectLayoutContext } from '../../projects/pages/ProjectDetailPage'
import { ConfigItemsTable } from '../components/ConfigItemsTable'
import { useExportConfigItems } from '../hooks/useExportConfigItems'
import styles from './ProjectSecretsPage.module.css'

export function ProjectSecretsPage() {
  const { project, selectedEnvironmentName } =
    useOutletContext<ProjectLayoutContext>()
  const { addToast } = useToast()
  const [focusedConfigItemId, setFocusedConfigItemId] = useState<string | null>(
    null,
  )
  const exportConfigItemsMutation = useExportConfigItems(
    project.id,
    selectedEnvironmentName,
  )

  async function handleCopyExport() {
    try {
      const exportedSecrets = await exportConfigItemsMutation.mutateAsync()
      await navigator.clipboard.writeText(exportedSecrets)
      addToast({
        message: 'Secrets export copied',
        type: 'success',
      })
    } catch (error) {
      addToast({
        message: getErrorMessage(error, 'Failed to copy secrets export'),
        type: 'error',
      })
    }
  }

  return (
    <section className={styles.page}>
      {selectedEnvironmentName ? (
        <div className={styles.actions}>
          <button
            className={cx(styles.button, styles.buttonSecondary)}
            disabled={exportConfigItemsMutation.isPending}
            onClick={handleCopyExport}
            type="button"
          >
            {exportConfigItemsMutation.isPending ? 'Copying export...' : 'Copy Export'}
          </button>
        </div>
      ) : null}

      <ConfigItemsTable
        environmentName={selectedEnvironmentName}
        focusedConfigItemId={focusedConfigItemId}
        onFocusConfigItem={setFocusedConfigItemId}
        projectId={project.id}
      />
    </section>
  )
}

function getErrorMessage(error: unknown, fallbackMessage: string) {
  return error instanceof Error ? error.message : fallbackMessage
}

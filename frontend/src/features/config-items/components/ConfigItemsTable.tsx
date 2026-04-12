import { useState } from 'react'
import { cx } from '../../../shared/utils/cx'
import { useConfigItems } from '../hooks/useConfigItems'
import type { ConfigItem } from '../types/ConfigItem'
import { ConfigItemRow } from './ConfigItemRow'
import { DeleteConfigItemDialog } from './DeleteConfigItemDialog'
import { RenameConfigItemModal } from './RenameConfigItemModal'
import styles from './ConfigItemsTable.module.css'

interface ConfigItemsTableProps {
  focusedConfigItemId?: string | null
  projectId: string
}

export function ConfigItemsTable({
  focusedConfigItemId,
  projectId,
}: ConfigItemsTableProps) {
  const configItemsQuery = useConfigItems(projectId)
  const configItems = configItemsQuery.data ?? []
  const [configItemPendingRename, setConfigItemPendingRename] =
    useState<ConfigItem | null>(null)
  const [configItemPendingDelete, setConfigItemPendingDelete] =
    useState<ConfigItem | null>(null)

  if (configItemsQuery.isPending) {
    return (
      <div className={styles.state} role="status">
        <p className={styles.stateTitle}>Loading secrets...</p>
        <p className={styles.stateCopy}>
          Config item keys are being prepared.
        </p>
      </div>
    )
  }

  if (configItemsQuery.isError) {
    return (
      <div className={cx(styles.state, styles.stateError)} role="alert">
        <p className={styles.stateTitle}>Failed to load secrets.</p>
        <p className={styles.stateCopy}>
          {getErrorMessage(
            configItemsQuery.error,
            'Something went wrong while loading config items.',
          )}
        </p>
        <button
          className={cx(styles.button, styles.buttonSecondary)}
          onClick={() => configItemsQuery.refetch()}
          type="button"
        >
          Retry
        </button>
      </div>
    )
  }

  if (configItems.length === 0) {
    return (
      <div className={styles.state}>
        <p className={styles.stateTitle}>No secrets yet.</p>
        <p className={styles.stateCopy}>
          Add a secret key to start tracking values across environments.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className={styles.tableWrapper}>
        <table className={styles.configItemsTable}>
          <caption className={styles.visuallyHidden}>
            Project secrets and config items
          </caption>
          <thead>
            <tr>
              <th scope="col">Key</th>
              <th scope="col">Value</th>
              <th className={styles.actionsColumn} scope="col">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {configItems.map((configItem) => (
              <ConfigItemRow
                configItem={configItem}
                key={configItem.id}
                onDelete={setConfigItemPendingDelete}
                onRename={setConfigItemPendingRename}
                shouldFocus={configItem.id === focusedConfigItemId}
              />
            ))}
          </tbody>
        </table>
      </div>

      {configItemPendingRename ? (
        <RenameConfigItemModal
          configItem={configItemPendingRename}
          onCancel={() => setConfigItemPendingRename(null)}
          projectId={projectId}
        />
      ) : null}

      {configItemPendingDelete ? (
        <DeleteConfigItemDialog
          configItem={configItemPendingDelete}
          onCancel={() => setConfigItemPendingDelete(null)}
          projectId={projectId}
        />
      ) : null}
    </>
  )
}

function getErrorMessage(error: unknown, fallbackMessage: string) {
  return error instanceof Error ? error.message : fallbackMessage
}

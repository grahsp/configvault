import { useState } from 'react'
import { useToast } from '../../../shared/components/toast/useToast'
import { cx } from '../../../shared/utils/cx'
import { useConfigItems } from '../hooks/useConfigItems'
import { useRenameConfigItem } from '../hooks/useRenameConfigItem'
import type { ConfigItem } from '../types/ConfigItem'
import { getConfigItemKeyValidationError } from '../validation/configItemValidation'
import { ConfigItemRow } from './ConfigItemRow'
import { DeleteConfigItemDialog } from './DeleteConfigItemDialog'
import styles from './ConfigItemsTable.module.css'

interface ConfigItemsTableProps {
  environmentName: string
  focusedConfigItemId?: string | null
  onAddConfigItem: () => void
  projectId: string
}

export function ConfigItemsTable({
  environmentName,
  focusedConfigItemId,
  onAddConfigItem,
  projectId,
}: ConfigItemsTableProps) {
  const { addToast } = useToast()
  const configItemsQuery = useConfigItems(projectId, environmentName)
  const configItems = configItemsQuery.data ?? []
  const renameConfigItemMutation = useRenameConfigItem(
    projectId,
    environmentName,
  )
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draftKey, setDraftKey] = useState('')
  const [configItemPendingDelete, setConfigItemPendingDelete] =
    useState<ConfigItem | null>(null)

  function handleStartRename(configItem: ConfigItem) {
    renameConfigItemMutation.reset()
    setEditingId(configItem.id)
    setDraftKey(configItem.key)
  }

  function handleCancelRename() {
    renameConfigItemMutation.reset()
    setEditingId(null)
    setDraftKey('')
  }

  async function handleSaveRename(configItem: ConfigItem) {
    const trimmedKey = draftKey.trim()

    if (!trimmedKey || trimmedKey === configItem.key) {
      handleCancelRename()
      return
    }

    if (getConfigItemKeyValidationError(draftKey)) {
      return
    }

    try {
      await renameConfigItemMutation.mutateAsync({
        configItemId: configItem.id,
        key: trimmedKey,
      })
      addToast({ message: 'Secret renamed', type: 'success' })
      handleCancelRename()
    } catch (error) {
      addToast({
        message: getErrorMessage(error, 'Failed to rename secret'),
        type: 'error',
      })
    }
  }

  if (!environmentName || configItemsQuery.isLoading) {
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
        <p className={styles.stateTitle}>No secrets yet</p>
        <p className={styles.stateCopy}>
          Add a secret key to start tracking values across environments.
        </p>
        <button
          className={cx(styles.button, styles.buttonPrimary)}
          onClick={onAddConfigItem}
          type="button"
        >
          Add Secret
        </button>
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
                draftKey={draftKey}
                isEditing={editingId === configItem.id}
                isSaving={
                  editingId === configItem.id && renameConfigItemMutation.isPending
                }
                key={configItem.id}
                onCancelEdit={handleCancelRename}
                onDelete={setConfigItemPendingDelete}
                onDraftKeyChange={(nextDraftKey) => {
                  renameConfigItemMutation.reset()
                  setDraftKey(nextDraftKey)
                }}
                onRename={handleStartRename}
                onSaveEdit={() => handleSaveRename(configItem)}
                shouldFocus={configItem.id === focusedConfigItemId}
                validationError={
                  editingId === configItem.id
                    ? getConfigItemKeyValidationError(draftKey)
                    : undefined
                }
              />
            ))}
          </tbody>
        </table>
      </div>

      {configItemPendingDelete ? (
        <DeleteConfigItemDialog
          configItem={configItemPendingDelete}
          environmentName={environmentName}
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

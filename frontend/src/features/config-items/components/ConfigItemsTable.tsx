import { useEffect, useState } from 'react'
import { useToast } from '../../../shared/components/toast/useToast'
import { cx } from '../../../shared/utils/cx'
import { useConfigItems } from '../hooks/useConfigItems'
import { useRevealConfigItemValue } from '../hooks/useRevealConfigItemValue'
import { useRenameConfigItem } from '../hooks/useRenameConfigItem'
import { useUpsertConfigItemValue } from '../hooks/useUpsertConfigItemValue'
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
  const revealConfigItemValueMutation = useRevealConfigItemValue(
    projectId,
    environmentName,
  )
  const upsertConfigItemValueMutation = useUpsertConfigItemValue(
    projectId,
    environmentName,
  )
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draftKey, setDraftKey] = useState('')
  const [draftValue, setDraftValue] = useState('')
  const [revealedValues, setRevealedValues] = useState<Record<string, string>>(
    {},
  )
  const [visibleRevealedValues, setVisibleRevealedValues] = useState<
    Record<string, boolean>
  >({})
  const [revealingId, setRevealingId] = useState<string | null>(null)
  const [configItemPendingDelete, setConfigItemPendingDelete] =
    useState<ConfigItem | null>(null)
  const resetRevealMutation = revealConfigItemValueMutation.reset
  const resetRenameMutation = renameConfigItemMutation.reset
  const resetUpsertMutation = upsertConfigItemValueMutation.reset

  useEffect(() => {
    setEditingId(null)
    setDraftKey('')
    setDraftValue('')
    setRevealedValues({})
    setVisibleRevealedValues({})
    setRevealingId(null)
    resetRevealMutation()
    resetRenameMutation()
    resetUpsertMutation()
  }, [
    environmentName,
    resetRevealMutation,
    resetRenameMutation,
    resetUpsertMutation,
  ])

  function handleStartEdit(configItem: ConfigItem) {
    resetRenameMutation()
    resetUpsertMutation()
    setEditingId(configItem.id)
    setDraftKey(configItem.key)
    setDraftValue('')
  }

  function handleCancelEdit() {
    resetRenameMutation()
    resetUpsertMutation()
    setEditingId(null)
    setDraftKey('')
    setDraftValue('')
  }

  async function handleReveal(configItem: ConfigItem) {
    if (visibleRevealedValues[configItem.id]) {
      setVisibleRevealedValues((current) => ({
        ...current,
        [configItem.id]: false,
      }))
      return
    }

    if (revealedValues[configItem.id] !== undefined) {
      setVisibleRevealedValues((current) => ({
        ...current,
        [configItem.id]: true,
      }))
      return
    }

    try {
      setRevealingId(configItem.id)
      const configItemValue = await revealConfigItemValueMutation.mutateAsync({
        configItemId: configItem.id,
      })
      setRevealedValues((current) => ({
        ...current,
        [configItem.id]: configItemValue.value,
      }))
      setVisibleRevealedValues((current) => ({
        ...current,
        [configItem.id]: true,
      }))
    } catch (error) {
      addToast({
        message: getErrorMessage(error, 'Failed to reveal secret value'),
        type: 'error',
      })
    } finally {
      setRevealingId(null)
    }
  }

  async function handleSaveEdit(configItem: ConfigItem) {
    const trimmedKey = draftKey.trim()
    const shouldRename = trimmedKey !== configItem.key
    const shouldUpsertValue = draftValue !== ''

    if (!shouldRename && !shouldUpsertValue) {
      handleCancelEdit()
      return
    }

    if (getConfigItemKeyValidationError(draftKey)) {
      return
    }

    try {
      if (shouldRename) {
        await renameConfigItemMutation.mutateAsync({
          configItemId: configItem.id,
          key: trimmedKey,
        })
      }

      if (shouldUpsertValue) {
        await upsertConfigItemValueMutation.mutateAsync({
          configItemId: configItem.id,
          value: draftValue,
        })
        setRevealedValues((current) => {
          const nextValues = { ...current }

          delete nextValues[configItem.id]

          return nextValues
        })
        setVisibleRevealedValues((current) => {
          const nextValues = { ...current }

          delete nextValues[configItem.id]

          return nextValues
        })
      }

      addToast({
        message:
          shouldRename && shouldUpsertValue
            ? 'Secret updated'
            : shouldRename
              ? 'Secret renamed'
              : 'Secret value saved',
        type: 'success',
      })
      handleCancelEdit()
    } catch (error) {
      addToast({
        message: getErrorMessage(error, 'Failed to update secret'),
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
                draftValue={draftValue}
                isEditing={editingId === configItem.id}
                isRevealing={revealingId === configItem.id}
                isSaving={
                  editingId === configItem.id &&
                  (renameConfigItemMutation.isPending ||
                    upsertConfigItemValueMutation.isPending)
                }
                isValueRevealed={Boolean(
                  visibleRevealedValues[configItem.id],
                )}
                key={configItem.id}
                onCancelEdit={handleCancelEdit}
                onDelete={setConfigItemPendingDelete}
                onDraftKeyChange={(nextDraftKey) => {
                  resetRenameMutation()
                  setDraftKey(nextDraftKey)
                }}
                onDraftValueChange={(nextDraftValue) => {
                  resetUpsertMutation()
                  setDraftValue(nextDraftValue)
                }}
                onEdit={handleStartEdit}
                onReveal={handleReveal}
                onSaveEdit={() => handleSaveEdit(configItem)}
                revealedValue={
                  visibleRevealedValues[configItem.id]
                    ? revealedValues[configItem.id]
                    : undefined
                }
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

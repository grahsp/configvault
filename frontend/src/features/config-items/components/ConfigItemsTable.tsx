import { useEffect, useMemo, useState } from 'react'
import { useToast } from '../../../shared/components/toast/useToast'
import { cx } from '../../../shared/utils/cx'
import { useConfigItems } from '../hooks/useConfigItems'
import { useRevealConfigItemValue } from '../hooks/useRevealConfigItemValue'
import { useSaveConfigItems } from '../hooks/useSaveConfigItems'
import type { ConfigItem } from '../types/ConfigItem'
import { getConfigItemKeyValidationError } from '../validation/configItemValidation'
import { ConfigItemRow } from './ConfigItemRow'
import styles from './ConfigItemsTable.module.css'

interface ConfigItemsTableProps {
  environmentName: string
  focusedConfigItemId?: string | null
  onAddConfigItem: () => void
  projectId: string
}

interface ConfigItemDraft {
  key: string
  value: string | null
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
  const revealConfigItemValueMutation = useRevealConfigItemValue(
    projectId,
    environmentName,
  )
  const saveConfigItemsMutation = useSaveConfigItems(projectId, environmentName)
  const [isEditing, setIsEditing] = useState(false)
  const [drafts, setDrafts] = useState<Record<string, ConfigItemDraft>>({})
  const [pendingDeletionIds, setPendingDeletionIds] = useState<string[]>([])
  const [revealedValues, setRevealedValues] = useState<Record<string, string>>(
    {},
  )
  const [visibleRevealedValues, setVisibleRevealedValues] = useState<
    Record<string, boolean>
  >({})
  const [revealingId, setRevealingId] = useState<string | null>(null)
  const resetRevealMutation = revealConfigItemValueMutation.reset
  const resetSaveMutation = saveConfigItemsMutation.reset
  const isSaving = saveConfigItemsMutation.isPending

  const validationErrors = useMemo(
    () =>
      Object.fromEntries(
        configItems.map((configItem) => [
          configItem.id,
          pendingDeletionIds.includes(configItem.id)
            ? undefined
            : getConfigItemKeyValidationError(
                drafts[configItem.id]?.key ?? configItem.key,
              ),
        ]),
      ),
    [configItems, drafts, pendingDeletionIds],
  )

  const hasValidationError = Object.values(validationErrors).some(Boolean)

  useEffect(() => {
    setIsEditing(false)
    setDrafts({})
    setPendingDeletionIds([])
    setRevealedValues({})
    setVisibleRevealedValues({})
    setRevealingId(null)
    resetRevealMutation()
    resetSaveMutation()
  }, [
    environmentName,
    resetRevealMutation,
    resetSaveMutation,
  ])

  function createDrafts(items: ConfigItem[]) {
    return Object.fromEntries(
      items.map((configItem) => [
        configItem.id,
        {
          key: configItem.key,
          value: null,
        },
      ]),
    )
  }

  function handleStartEdit() {
    resetSaveMutation()
    setDrafts(createDrafts(configItems))
    setPendingDeletionIds([])
    setIsEditing(true)
  }

  function handleCancelEdit() {
    resetSaveMutation()
    setDrafts({})
    setPendingDeletionIds([])
    setIsEditing(false)
  }

  function handleDeleteToggle(configItem: ConfigItem) {
    setPendingDeletionIds((current) =>
      current.includes(configItem.id)
        ? current.filter((id) => id !== configItem.id)
        : [...current, configItem.id],
    )
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

  async function handleStartValueEdit(configItem: ConfigItem) {
    if (!configItem.hasValue) {
      return
    }

    const existingDraft = drafts[configItem.id]

    if (existingDraft?.value !== null && existingDraft?.value !== undefined) {
      return
    }

    if (revealedValues[configItem.id] !== undefined) {
      setDrafts((current) => ({
        ...current,
        [configItem.id]: {
          key: current[configItem.id]?.key ?? configItem.key,
          value: revealedValues[configItem.id],
        },
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
      setDrafts((current) => ({
        ...current,
        [configItem.id]: {
          key: current[configItem.id]?.key ?? configItem.key,
          value: configItemValue.value,
        },
      }))
    } catch (error) {
      addToast({
        message: getErrorMessage(error, 'Failed to reveal secret value'),
        type: 'error',
      })
    } finally {
      setRevealingId((current) =>
        current === configItem.id ? null : current,
      )
    }
  }

  async function handleSaveEdit() {
    if (hasValidationError) {
      return
    }

    const pendingDeletionIdSet = new Set(pendingDeletionIds)
    const pendingUpdates = configItems
      .map((configItem) => {
        const draft = drafts[configItem.id]
        const nextKey = draft?.key ?? configItem.key
        const nextValue = draft?.value ?? ''
        const trimmedKey = nextKey.trim()

        return {
          isPendingDelete: pendingDeletionIdSet.has(configItem.id),
          key: trimmedKey !== configItem.key ? trimmedKey : undefined,
          value: nextValue !== '' ? nextValue : undefined,
          configItemId: configItem.id,
        }
      })
      .filter(
        (update) =>
          !update.isPendingDelete &&
          (update.key !== undefined || update.value !== undefined),
      )

    const updates = pendingUpdates.map(({ configItemId, key, value }) => ({
      configItemId,
      ...(key !== undefined ? { key } : {}),
      ...(value !== undefined ? { value } : {}),
    }))
    const deleteConfigItemIds = [...pendingDeletionIdSet]

    if (updates.length === 0 && deleteConfigItemIds.length === 0) {
      handleCancelEdit()
      return
    }

    try {
      await saveConfigItemsMutation.mutateAsync({
        deleteConfigItemIds,
        updates,
      })

      const configItemIdsWithUpdatedValues = updates
        .filter((update) => update.value !== undefined)
        .map((update) => update.configItemId)

      const affectedValueIds = new Set([
        ...configItemIdsWithUpdatedValues,
        ...deleteConfigItemIds,
      ])

      setRevealedValues((current) =>
        Object.fromEntries(
          Object.entries(current).filter(([configItemId]) => !affectedValueIds.has(configItemId)),
        ),
      )
      setVisibleRevealedValues((current) =>
        Object.fromEntries(
          Object.entries(current).filter(([configItemId]) => !affectedValueIds.has(configItemId)),
        ),
      )

      addToast({
        message: getSuccessMessage(updates, deleteConfigItemIds.length),
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

  return (
    <section className={styles.sectionCard}>
      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>Environment Variables</h3>
        <p className={styles.sectionDescription}>
          Set environment-specific config and secrets, then manage key and value
          updates from one edit state.
        </p>

        {!isEditing && environmentName && !configItemsQuery.isLoading && !configItemsQuery.isError && configItems.length > 0 ? (
          <div className={styles.sectionHeaderActions}>
            <button
              className={cx(styles.button, styles.buttonSecondary)}
              onClick={handleStartEdit}
              type="button"
            >
              Edit
            </button>
          </div>
        ) : null}
      </div>

      {!environmentName || configItemsQuery.isLoading ? (
        <div className={styles.state} role="status">
          <p className={styles.stateTitle}>Loading secrets...</p>
          <p className={styles.stateCopy}>
            Config item keys are being prepared.
          </p>
        </div>
      ) : null}

      {environmentName && configItemsQuery.isError ? (
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
      ) : null}

      {environmentName &&
      !configItemsQuery.isLoading &&
      !configItemsQuery.isError &&
      configItems.length === 0 ? (
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
      ) : null}

      {environmentName &&
      !configItemsQuery.isLoading &&
      !configItemsQuery.isError &&
      configItems.length > 0 ? (
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
                  draftKey={drafts[configItem.id]?.key ?? configItem.key}
                  draftValue={drafts[configItem.id]?.value ?? null}
                  isEditing={isEditing}
                    isMarkedForDeletion={pendingDeletionIds.includes(configItem.id)}
                    isRevealing={revealingId === configItem.id}
                    isSaving={isSaving}
                    isValueRevealed={Boolean(
                      visibleRevealedValues[configItem.id],
                    )}
                    key={configItem.id}
                    onCancelEdit={handleCancelEdit}
                    onDeleteToggle={handleDeleteToggle}
                  onDraftKeyChange={(nextDraftKey) => {
                    resetSaveMutation()
                    setDrafts((current) => ({
                      ...current,
                      [configItem.id]: {
                        key: nextDraftKey,
                        value: current[configItem.id]?.value ?? null,
                      },
                    }))
                  }}
                  onDraftValueChange={(nextDraftValue) => {
                    resetSaveMutation()
                    setDrafts((current) => ({
                      ...current,
                      [configItem.id]: {
                        key: current[configItem.id]?.key ?? configItem.key,
                        value: nextDraftValue,
                      },
                    }))
                  }}
                  onReveal={handleReveal}
                  onSaveEdit={handleSaveEdit}
                  onStartValueEdit={handleStartValueEdit}
                  revealedValue={
                    visibleRevealedValues[configItem.id]
                      ? revealedValues[configItem.id]
                        : undefined
                    }
                    shouldFocus={configItem.id === focusedConfigItemId}
                    validationError={isEditing ? validationErrors[configItem.id] : undefined}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {isEditing ? (
            <div className={styles.sectionFooterActions}>
              <div className={styles.sectionFooterPrimaryActions}>
                <button
                  className={cx(styles.button, styles.buttonPrimary)}
                  disabled={isSaving}
                  onClick={onAddConfigItem}
                  type="button"
                >
                  Add Secret
                </button>
              </div>
              <div className={styles.sectionFooterSecondaryActions}>
                <button
                  className={cx(styles.button, styles.buttonPrimary)}
                  disabled={isSaving || hasValidationError}
                  onClick={handleSaveEdit}
                  type="button"
                >
                  {isSaving ? 'Saving' : 'Save Changes'}
                </button>
                <button
                  className={cx(styles.button, styles.buttonSecondary)}
                  disabled={isSaving}
                  onClick={handleCancelEdit}
                  type="button"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : null}
        </>
      ) : null}
    </section>
  )
}

function getSuccessMessage(
  updates: Array<{
    key?: string
    value?: string
  }>,
  deleteCount: number,
) {
  if (deleteCount > 0 && updates.length > 0) {
    return 'Secrets updated'
  }

  if (deleteCount > 1) {
    return 'Secrets deleted'
  }

  if (deleteCount === 1) {
    return 'Secret deleted'
  }

  if (updates.length > 1) {
    return 'Secrets updated'
  }

  const [update] = updates

  if (update.key !== undefined && update.value !== undefined) {
    return 'Secret updated'
  }

  if (update.key !== undefined) {
    return 'Secret renamed'
  }

  return 'Secret value saved'
}

function getErrorMessage(error: unknown, fallbackMessage: string) {
  return error instanceof Error ? error.message : fallbackMessage
}

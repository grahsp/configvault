import { useEffect, useMemo, useState } from 'react'
import { useToast } from '../../../shared/components/toast/useToast'
import { cx } from '../../../shared/utils/cx'
import type { ConfigItemBatchOperation } from '../api/configItemsApi'
import { useConfigItems } from '../hooks/useConfigItems'
import { useRevealConfigItemValue } from '../hooks/useRevealConfigItemValue'
import { useSaveConfigItems } from '../hooks/useSaveConfigItems'
import type { ConfigItem } from '../types/ConfigItem'
import { getConfigItemKeyValidationError } from '../validation/configItemValidation'
import { ConfigItemRow } from './ConfigItemRow'
import { ImportConfigItemsModal } from './ImportConfigItemsModal'
import styles from './ConfigItemsTable.module.css'

interface ConfigItemsTableProps {
  environmentName: string
  focusedConfigItemId?: string | null
  onFocusConfigItem: (configItemId: string | null) => void
  projectId: string
}

interface ConfigItemDraft {
  key: string
  value: string | null
}

interface NewConfigItemDraft {
  id: string
  key: string
  value: string
}

export function ConfigItemsTable({
  environmentName,
  focusedConfigItemId,
  onFocusConfigItem,
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
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [drafts, setDrafts] = useState<Record<string, ConfigItemDraft>>({})
  const [newConfigItems, setNewConfigItems] = useState<NewConfigItemDraft[]>([])
  const [highlightedValidationIds, setHighlightedValidationIds] = useState<
    string[]
  >([])
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
  const tableConfigItems = useMemo(
    () => [...configItems, ...newConfigItems.map(toLocalConfigItem)],
    [configItems, newConfigItems],
  )

  const validationErrors = useMemo(
    () =>
      Object.fromEntries(
        tableConfigItems.map((configItem) => [
          configItem.id,
          pendingDeletionIds.includes(configItem.id)
            ? undefined
            : getConfigItemKeyValidationError(
                getDraftKey(configItem, drafts, newConfigItems),
              ),
        ]),
      ),
    [drafts, newConfigItems, pendingDeletionIds, tableConfigItems],
  )

  useEffect(() => {
    setIsEditing(false)
    setDrafts({})
    setNewConfigItems([])
    setHighlightedValidationIds([])
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
    setHighlightedValidationIds([])
    setPendingDeletionIds([])
    setIsEditing(true)
  }

  function handleOpenAddConfigItem() {
    if (!isEditing) {
      resetSaveMutation()
      setDrafts(createDrafts(configItems))
      setHighlightedValidationIds([])
      setPendingDeletionIds([])
      setIsEditing(true)
    }

    const id = createLocalConfigItemId()

    resetSaveMutation()
    setNewConfigItems((current) => [
      ...current,
      {
        id,
        key: '',
        value: '',
      },
    ])
    onFocusConfigItem(id)
  }

  function handleCancelEdit() {
    resetSaveMutation()
    setDrafts({})
    setNewConfigItems([])
    setHighlightedValidationIds([])
    setPendingDeletionIds([])
    setIsEditing(false)
    onFocusConfigItem(null)
  }

  function handleImported() {
    if (isEditing) {
      handleCancelEdit()
    }
  }

  function handleDeleteToggle(configItem: ConfigItem) {
    if (isLocalConfigItemId(configItem.id)) {
      setNewConfigItems((current) =>
        current.filter((item) => item.id !== configItem.id),
      )
      setHighlightedValidationIds((current) =>
        current.filter((id) => id !== configItem.id),
      )
      return
    }

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
    const invalidConfigItemIds = Object.entries(validationErrors)
      .filter(([, error]) => Boolean(error))
      .map(([configItemId]) => configItemId)

    if (invalidConfigItemIds.length > 0) {
      setHighlightedValidationIds(invalidConfigItemIds)
      return
    }

    const pendingDeletionIdSet = new Set(pendingDeletionIds)
    const existingOperations: ConfigItemBatchOperation[] = []

    for (const configItem of configItems) {
      const draft = drafts[configItem.id]
      const nextKey = draft?.key ?? configItem.key
      const nextValue = draft?.value ?? ''
      const trimmedKey = nextKey.trim()

      if (pendingDeletionIdSet.has(configItem.id)) {
        existingOperations.push({
          type: 'delete',
          configItemId: configItem.id,
        })
        continue
      }

      if (trimmedKey !== configItem.key) {
        existingOperations.push({
          type: 'rename',
          configItemId: configItem.id,
          key: trimmedKey,
        })
      }

      if (nextValue !== '') {
        existingOperations.push({
          type: 'set-value',
          configItemId: configItem.id,
          value: nextValue,
        })
      }
    }

    const createOperations: ConfigItemBatchOperation[] = newConfigItems.map(
      (configItem) => ({
        type: 'create',
        key: configItem.key.trim(),
        ...(configItem.value !== ''
          ? { initialValue: configItem.value }
          : {}),
      }),
    )

    const operations = [...existingOperations, ...createOperations]

    if (operations.length === 0) {
      handleCancelEdit()
      return
    }

    try {
      await saveConfigItemsMutation.mutateAsync({ operations })

      const configItemIdsWithUpdatedValues = existingOperations
        .filter(
          (
            operation,
          ): operation is Extract<
            ConfigItemBatchOperation,
            { type: 'set-value' }
          > => operation.type === 'set-value',
        )
        .map((operation) => operation.configItemId)
      const deleteConfigItemIds = existingOperations
        .filter(
          (
            operation,
          ): operation is Extract<ConfigItemBatchOperation, { type: 'delete' }> =>
            operation.type === 'delete',
        )
        .map((operation) => operation.configItemId)

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
        message: getSuccessMessage(operations),
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

        {!isEditing &&
        environmentName &&
        !configItemsQuery.isLoading &&
        !configItemsQuery.isError &&
        configItems.length > 0 ? (
          <div className={styles.sectionHeaderActions}>
          <button
            className={cx(styles.button, styles.buttonSecondary)}
            onClick={() => setIsImportModalOpen(true)}
            type="button"
          >
            Import .env
          </button>
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
      tableConfigItems.length === 0 ? (
        <div className={styles.state}>
          <p className={styles.stateTitle}>No secrets yet</p>
          <p className={styles.stateCopy}>
            Add a secret key to start tracking values across environments.
          </p>
          <button
            className={cx(styles.button, styles.buttonPrimary)}
            onClick={handleOpenAddConfigItem}
            type="button"
          >
            Add Secret
          </button>
          <button
            className={cx(styles.button, styles.buttonSecondary)}
            onClick={() => setIsImportModalOpen(true)}
            type="button"
          >
            Import .env
          </button>
        </div>
      ) : null}

      {environmentName &&
      !configItemsQuery.isLoading &&
      !configItemsQuery.isError &&
      tableConfigItems.length > 0 ? (
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
                {tableConfigItems.map((configItem) => (
                  <ConfigItemRow
                    configItem={configItem}
                    draftKey={getDraftKey(configItem, drafts, newConfigItems)}
                    draftValue={getDraftValue(configItem, drafts, newConfigItems)}
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

                      if (isLocalConfigItemId(configItem.id)) {
                        setNewConfigItems((current) =>
                          current.map((item) =>
                            item.id === configItem.id
                              ? { ...item, key: nextDraftKey }
                              : item,
                          ),
                        )
                        setHighlightedValidationIds((current) =>
                          getConfigItemKeyValidationError(nextDraftKey)
                            ? current.includes(configItem.id)
                              ? current
                              : [...current, configItem.id]
                            : current.filter((id) => id !== configItem.id),
                        )
                        return
                      }

                      setDrafts((current) => ({
                        ...current,
                        [configItem.id]: {
                          key: nextDraftKey,
                          value: current[configItem.id]?.value ?? null,
                        },
                      }))
                      setHighlightedValidationIds((current) =>
                        getConfigItemKeyValidationError(nextDraftKey)
                          ? current.includes(configItem.id)
                            ? current
                            : [...current, configItem.id]
                          : current.filter((id) => id !== configItem.id),
                      )
                    }}
                    onDraftValueChange={(nextDraftValue) => {
                      resetSaveMutation()

                      if (isLocalConfigItemId(configItem.id)) {
                        setNewConfigItems((current) =>
                          current.map((item) =>
                            item.id === configItem.id
                              ? { ...item, value: nextDraftValue }
                              : item,
                          ),
                        )
                        return
                      }

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
                    validationError={
                      isEditing &&
                      highlightedValidationIds.includes(configItem.id)
                        ? validationErrors[configItem.id]
                        : undefined
                    }
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
                  onClick={handleOpenAddConfigItem}
                  type="button"
                >
                  Add Secret
                </button>
                <button
                  className={cx(styles.button, styles.buttonSecondary)}
                  disabled={isSaving}
                  onClick={() => setIsImportModalOpen(true)}
                  type="button"
                >
                  Import .env
                </button>
              </div>
              <div className={styles.sectionFooterSecondaryActions}>
                <button
                  className={cx(styles.button, styles.buttonPrimary)}
                  disabled={isSaving}
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

      {isImportModalOpen ? (
        <ImportConfigItemsModal
          environmentName={environmentName}
          isEditing={isEditing}
          onCancel={() => setIsImportModalOpen(false)}
          onImported={handleImported}
          projectId={projectId}
        />
      ) : null}
    </section>
  )
}

function getSuccessMessage(operations: ConfigItemBatchOperation[]) {
  const createCount = operations.filter(
    (operation) => operation.type === 'create',
  ).length
  const renameCount = operations.filter(
    (operation) => operation.type === 'rename',
  ).length
  const valueCount = operations.filter(
    (operation) => operation.type === 'set-value',
  ).length
  const deleteCount = operations.filter(
    (operation) => operation.type === 'delete',
  ).length
  const updateCount = createCount + renameCount + valueCount

  if (deleteCount > 0 && updateCount > 0) {
    return 'Secrets updated'
  }

  if (deleteCount > 1) {
    return 'Secrets deleted'
  }

  if (deleteCount === 1) {
    return 'Secret deleted'
  }

  if (createCount > 0 && renameCount === 0 && valueCount === 0) {
    return createCount > 1 ? 'Secrets created' : 'Secret created'
  }

  if (updateCount > 1) {
    return 'Secrets updated'
  }

  if (renameCount === 1) {
    return 'Secret renamed'
  }

  if (createCount === 1) {
    return 'Secret created'
  }

  return 'Secret value saved'
}

function isLocalConfigItemId(configItemId: string) {
  return configItemId.startsWith('local-config-item-')
}

function createLocalConfigItemId() {
  return `local-config-item-${crypto.randomUUID()}`
}

function toLocalConfigItem(configItem: NewConfigItemDraft): ConfigItem {
  return {
    id: configItem.id,
    key: configItem.key,
    hasValue: false,
  }
}

function getDraftKey(
  configItem: ConfigItem,
  drafts: Record<string, ConfigItemDraft>,
  newConfigItems: NewConfigItemDraft[],
) {
  if (isLocalConfigItemId(configItem.id)) {
    return newConfigItems.find((item) => item.id === configItem.id)?.key ?? configItem.key
  }

  return drafts[configItem.id]?.key ?? configItem.key
}

function getDraftValue(
  configItem: ConfigItem,
  drafts: Record<string, ConfigItemDraft>,
  newConfigItems: NewConfigItemDraft[],
) {
  if (isLocalConfigItemId(configItem.id)) {
    return newConfigItems.find((item) => item.id === configItem.id)?.value ?? ''
  }

  return drafts[configItem.id]?.value ?? null
}

function getErrorMessage(error: unknown, fallbackMessage: string) {
  return error instanceof Error ? error.message : fallbackMessage
}

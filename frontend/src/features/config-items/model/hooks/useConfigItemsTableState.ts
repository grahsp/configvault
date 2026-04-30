import { useEffect, useMemo, useState } from 'react'
import { useToast } from '../../../../shared/components/toast/useToast.ts'
import { type ConfigItemBatchOperation } from '../../api'
import type { ConfigItem } from '../configItem.types.ts'
import { getConfigItemKeyValidationError } from '../configItemValidation.ts'
import { useConfigItems } from './useConfigItems.ts'
import { useImportConfigItems } from './useImportConfigItems.ts'
import { useRevealConfigItemValue } from './useRevealConfigItemValue.ts'
import { useSaveConfigItems } from './useSaveConfigItems.ts'

interface ConfigItemDraft {
  key: string
  value: string | null
}

interface NewConfigItemDraft {
  id: string
  key: string
  value: string
}

export interface ConfigItemsTableRowState {
  configItem: ConfigItem
  draftKey: string
  draftValue: string | null
  isMarkedForDeletion: boolean
  isRevealing: boolean
  isValueRevealed: boolean
  revealedValue?: string
  shouldFocus: boolean
  validationError?: string
}

interface UseConfigItemsTableStateOptions {
  environmentName: string
  focusedConfigItemId?: string | null
  onFocusConfigItem: (configItemId: string | null) => void
  projectId: string
}

export function useConfigItemsTableState({
  environmentName,
  focusedConfigItemId,
  onFocusConfigItem,
  projectId,
}: UseConfigItemsTableStateOptions) {
  const { addToast } = useToast()
  const configItemsQuery = useConfigItems(projectId, environmentName)
  const importConfigItemsMutation = useImportConfigItems(
    projectId,
    environmentName,
  )
  const revealConfigItemValueMutation = useRevealConfigItemValue(
    projectId,
    environmentName,
  )
  const saveConfigItemsMutation = useSaveConfigItems(projectId, environmentName)
  const configItems = configItemsQuery.data ?? []
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
  const resetImportMutation = importConfigItemsMutation.reset
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
    setIsImportModalOpen(false)
    setDrafts({})
    setNewConfigItems([])
    setHighlightedValidationIds([])
    setPendingDeletionIds([])
    setRevealedValues({})
    setVisibleRevealedValues({})
    setRevealingId(null)
    resetImportMutation()
    resetRevealMutation()
    resetSaveMutation()
  }, [environmentName, resetImportMutation, resetRevealMutation, resetSaveMutation])

  const rows = useMemo<ConfigItemsTableRowState[]>(
    () =>
      tableConfigItems.map((configItem) => ({
        configItem,
        draftKey: getDraftKey(configItem, drafts, newConfigItems),
        draftValue: getDraftValue(configItem, drafts, newConfigItems),
        isMarkedForDeletion: pendingDeletionIds.includes(configItem.id),
        isRevealing: revealingId === configItem.id,
        isValueRevealed: Boolean(visibleRevealedValues[configItem.id]),
        revealedValue: visibleRevealedValues[configItem.id]
          ? revealedValues[configItem.id]
          : undefined,
        shouldFocus: configItem.id === focusedConfigItemId,
        validationError:
          isEditing && highlightedValidationIds.includes(configItem.id)
            ? validationErrors[configItem.id]
            : undefined,
      })),
    [
      drafts,
      focusedConfigItemId,
      highlightedValidationIds,
      isEditing,
      newConfigItems,
      pendingDeletionIds,
      revealedValues,
      revealingId,
      tableConfigItems,
      validationErrors,
      visibleRevealedValues,
    ],
  )

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

  function handleOpenImportModal() {
    resetImportMutation()
    setIsImportModalOpen(true)
  }

  function handleCloseImportModal() {
    resetImportMutation()
    setIsImportModalOpen(false)
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
      setRevealingId((current) => (current === configItem.id ? null : current))
    }
  }

  function handleDraftKeyChange(configItem: ConfigItem, nextDraftKey: string) {
    resetSaveMutation()

    if (isLocalConfigItemId(configItem.id)) {
      setNewConfigItems((current) =>
        current.map((item) =>
          item.id === configItem.id ? { ...item, key: nextDraftKey } : item,
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
  }

  function handleDraftValueChange(
    configItem: ConfigItem,
    nextDraftValue: string,
  ) {
    resetSaveMutation()

    if (isLocalConfigItemId(configItem.id)) {
      setNewConfigItems((current) =>
        current.map((item) =>
          item.id === configItem.id ? { ...item, value: nextDraftValue } : item,
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
          Object.entries(current).filter(
            ([configItemId]) => !affectedValueIds.has(configItemId),
          ),
        ),
      )
      setVisibleRevealedValues((current) =>
        Object.fromEntries(
          Object.entries(current).filter(
            ([configItemId]) => !affectedValueIds.has(configItemId),
          ),
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

  async function handleImport(content: string) {
    try {
      await importConfigItemsMutation.mutateAsync(content)
      addToast({
        message: 'Secrets imported',
        type: 'success',
      })
      if (isEditing) {
        handleCancelEdit()
      }
      handleCloseImportModal()
    } catch (error) {
      addToast({
        message: getErrorMessage(error, 'Failed to import secrets'),
        type: 'error',
      })
      throw error
    }
  }

  return {
    environmentName,
    isEditing,
    isError: configItemsQuery.isError,
    isImportModalOpen,
    isImporting: importConfigItemsMutation.isPending,
    isLoading: !environmentName || configItemsQuery.isLoading,
    isSaving,
    loadErrorMessage: configItemsQuery.isError
      ? getErrorMessage(
          configItemsQuery.error,
          'Something went wrong while loading config items.',
        )
      : undefined,
    rows,
    onCancelEdit: handleCancelEdit,
    onCloseImportModal: handleCloseImportModal,
    onDraftKeyChange: handleDraftKeyChange,
    onDraftValueChange: handleDraftValueChange,
    onImport: handleImport,
    onOpenAddConfigItem: handleOpenAddConfigItem,
    onOpenImportModal: handleOpenImportModal,
    onReveal: handleReveal,
    onRetry: () => configItemsQuery.refetch(),
    onSaveEdit: handleSaveEdit,
    onStartEdit: handleStartEdit,
    onStartValueEdit: handleStartValueEdit,
    onToggleDelete: handleDeleteToggle,
  }
}

export type ConfigItemsTableState = ReturnType<typeof useConfigItemsTableState>

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
    return (
      newConfigItems.find((item) => item.id === configItem.id)?.key ??
      configItem.key
    )
  }

  return drafts[configItem.id]?.key ?? configItem.key
}

function getDraftValue(
  configItem: ConfigItem,
  drafts: Record<string, ConfigItemDraft>,
  newConfigItems: NewConfigItemDraft[],
) {
  if (isLocalConfigItemId(configItem.id)) {
    return (
      newConfigItems.find((item) => item.id === configItem.id)?.value ?? ''
    )
  }

  return drafts[configItem.id]?.value ?? null
}

function getErrorMessage(error: unknown, fallbackMessage: string) {
  return error instanceof Error ? error.message : fallbackMessage
}

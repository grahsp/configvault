import { useCallback, useMemo } from 'react'
import { useToast } from '../../../shared/components/toast/useToast.ts'
import type { SecretBatchOperation } from '../api'
import type { Secret } from '../domain'
import { getSecretKeyValidationError } from '../domain'
import {
  buildSecretRows,
  buildSaveOperations,
  createDrafts,
  createLocalSecretId,
  getErrorMessage,
  getSuccessMessage,
  isLocalSecretId,
  omitRevealedValues,
  toLocalSecret,
} from './secretsEditor.utils'
import type { SecretRowViewModel } from './secretsEditor.types'
import { useSecretsEditorState } from './useSecretsEditorState'
import { useSecretsMutations } from './useSecretsMutations'
import { useSecretsQuery } from './useSecretsQuery'

interface UseSecretsEditorOptions {
  environmentName: string
  projectId: string
}

export function useSecretsEditor({
  environmentName,
  projectId,
}: UseSecretsEditorOptions) {
  const { addToast } = useToast()
  const secretsQuery = useSecretsQuery(projectId, environmentName)
  const mutations = useSecretsMutations(projectId, environmentName)
  const secrets = secretsQuery.data ?? []
  const resetImportMutation = mutations.importSecrets.reset
  const resetRevealMutation = mutations.revealSecretValue.reset
  const resetSaveMutation = mutations.saveSecrets.reset
  const resetMutations = useCallback(() => {
    resetImportMutation()
    resetRevealMutation()
    resetSaveMutation()
  }, [resetImportMutation, resetRevealMutation, resetSaveMutation])
  const {
    drafts,
    focusedSecretId,
    highlightedValidationIds,
    isEditing,
    isImportModalOpen,
    newSecrets,
    pendingDeletionIds,
    revealedValues,
    revealingId,
    setDrafts,
    setFocusedSecretId,
    setHighlightedValidationIds,
    setIsEditing,
    setIsImportModalOpen,
    setNewSecrets,
    setPendingDeletionIds,
    setRevealedValues,
    setRevealingId,
    setVisibleRevealedValues,
    visibleRevealedValues,
  } = useSecretsEditorState(environmentName, resetMutations)

  const tableSecrets = useMemo(
    () => [...secrets, ...newSecrets.map(toLocalSecret)],
    [secrets, newSecrets],
  )

  const rows = useMemo<SecretRowViewModel[]>(
    () =>
      buildSecretRows({
        drafts,
        focusedSecretId,
        highlightedValidationIds,
        isEditing,
        newSecrets,
        pendingDeletionIds,
        revealedValues,
        revealingId,
        tableSecrets,
        visibleRevealedValues,
      }),
    [
      drafts,
      focusedSecretId,
      highlightedValidationIds,
      isEditing,
      newSecrets,
      pendingDeletionIds,
      revealedValues,
      revealingId,
      tableSecrets,
      visibleRevealedValues,
    ],
  )

  function handleStartEdit() {
    resetSaveMutation()
    setDrafts(createDrafts(secrets))
    setHighlightedValidationIds([])
    setPendingDeletionIds([])
    setIsEditing(true)
  }

  function handleOpenAddSecret() {
    if (!isEditing) {
      resetSaveMutation()
      setDrafts(createDrafts(secrets))
      setHighlightedValidationIds([])
      setPendingDeletionIds([])
      setIsEditing(true)
    }

    const id = createLocalSecretId()

    resetSaveMutation()
    setNewSecrets((current) => [
      ...current,
      {
        id,
        key: '',
        value: '',
      },
    ])
    setFocusedSecretId(id)
  }

  function handleCancelEdit() {
    resetSaveMutation()
    setDrafts({})
    setNewSecrets([])
    setHighlightedValidationIds([])
    setPendingDeletionIds([])
    setIsEditing(false)
    setFocusedSecretId(null)
  }

  function handleOpenImportModal() {
    resetImportMutation()
    setIsImportModalOpen(true)
  }

  function handleCloseImportModal() {
    resetImportMutation()
    setIsImportModalOpen(false)
  }

  function handleDeleteToggle(secret: Secret) {
    if (isLocalSecretId(secret.id)) {
      setNewSecrets((current) =>
        current.filter((item) => item.id !== secret.id),
      )
      setHighlightedValidationIds((current) =>
        current.filter((id) => id !== secret.id),
      )
      return
    }

    setPendingDeletionIds((current) =>
      current.includes(secret.id)
        ? current.filter((id) => id !== secret.id)
        : [...current, secret.id],
    )
  }

  async function handleReveal(secret: Secret) {
    if (visibleRevealedValues[secret.id]) {
      setVisibleRevealedValues((current) => ({
        ...current,
        [secret.id]: false,
      }))
      return
    }

    if (revealedValues[secret.id] !== undefined) {
      setVisibleRevealedValues((current) => ({
        ...current,
        [secret.id]: true,
      }))
      return
    }

    try {
      setRevealingId(secret.id)
      const secretValue = await mutations.revealSecretValue.mutateAsync({
        secretId: secret.id,
        })
      setRevealedValues((current) => ({
        ...current,
        [secret.id]: secretValue.value,
      }))
      setVisibleRevealedValues((current) => ({
        ...current,
        [secret.id]: true,
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

  async function handleStartValueEdit(secret: Secret) {
    if (!secret.hasValue) {
      return
    }

    const existingDraft = drafts[secret.id]

    if (existingDraft?.value !== null && existingDraft?.value !== undefined) {
      return
    }

    if (revealedValues[secret.id] !== undefined) {
      setDrafts((current) => ({
        ...current,
        [secret.id]: {
          key: current[secret.id]?.key ?? secret.key,
          value: revealedValues[secret.id],
        },
      }))
      return
    }

    try {
      setRevealingId(secret.id)
      const secretValue = await mutations.revealSecretValue.mutateAsync({
          secretId: secret.id,
        })
      setRevealedValues((current) => ({
        ...current,
        [secret.id]: secretValue.value,
      }))
      setDrafts((current) => ({
        ...current,
        [secret.id]: {
          key: current[secret.id]?.key ?? secret.key,
          value: secretValue.value,
        },
      }))
    } catch (error) {
      addToast({
        message: getErrorMessage(error, 'Failed to reveal secret value'),
        type: 'error',
      })
    } finally {
      setRevealingId((current) => (current === secret.id ? null : current))
    }
  }

  function handleDraftKeyChange(secret: Secret, nextDraftKey: string) {
    resetSaveMutation()

    if (isLocalSecretId(secret.id)) {
      setNewSecrets((current) =>
        current.map((item) =>
          item.id === secret.id ? { ...item, key: nextDraftKey } : item,
        ),
      )
      setHighlightedValidationIds((current) =>
        getSecretKeyValidationError(nextDraftKey)
          ? current.includes(secret.id)
            ? current
            : [...current, secret.id]
          : current.filter((id) => id !== secret.id),
      )
      return
    }

    setDrafts((current) => ({
      ...current,
      [secret.id]: {
        key: nextDraftKey,
        value: current[secret.id]?.value ?? null,
      },
    }))
    setHighlightedValidationIds((current) =>
      getSecretKeyValidationError(nextDraftKey)
        ? current.includes(secret.id)
          ? current
          : [...current, secret.id]
        : current.filter((id) => id !== secret.id),
    )
  }

  function handleDraftValueChange(secret: Secret, nextDraftValue: string) {
    resetSaveMutation()

    if (isLocalSecretId(secret.id)) {
      setNewSecrets((current) =>
        current.map((item) =>
          item.id === secret.id ? { ...item, value: nextDraftValue } : item,
        ),
      )
      return
    }

    setDrafts((current) => ({
      ...current,
      [secret.id]: {
        key: current[secret.id]?.key ?? secret.key,
        value: nextDraftValue,
      },
    }))
  }

  async function handleSaveEdit() {
    const { invalidSecretIds, operations } = buildSaveOperations({
      secrets,
      drafts,
      newSecrets,
      pendingDeletionIds,
    })

    if (invalidSecretIds.length > 0) {
      setHighlightedValidationIds(invalidSecretIds)
      return
    }

    if (operations.length === 0) {
      handleCancelEdit()
      return
    }

    try {
      await mutations.saveSecrets.mutateAsync({ operations })

      const secretIdsWithUpdatedValues = operations
        .filter(
          (
            operation,
          ): operation is Extract<
            SecretBatchOperation,
            { type: 'set-value' }
          > => operation.type === 'set-value',
        )
        .map((operation) => operation.secretId)
      const deletedSecretIds = operations
        .filter(
          (
            operation,
          ): operation is Extract<SecretBatchOperation, { type: 'delete' }> =>
            operation.type === 'delete',
        )
        .map((operation) => operation.secretId)

      const affectedValueIds = [
        ...secretIdsWithUpdatedValues,
        ...deletedSecretIds,
      ]

      setRevealedValues((current) =>
        omitRevealedValues(current, affectedValueIds),
      )
      setVisibleRevealedValues((current) =>
        omitRevealedValues(current, affectedValueIds),
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
      await mutations.importSecrets.mutateAsync(content)
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

  async function handleCopyExport() {
    try {
      const exportedSecrets = await mutations.exportSecrets.mutateAsync()
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

  return {
    canCopyExport: Boolean(environmentName),
    environmentName,
    isCopyingExport: mutations.exportSecrets.isPending,
    isEditing,
    isError: secretsQuery.isError,
    isImportModalOpen,
    isImporting: mutations.importSecrets.isPending,
    isLoading: !environmentName || secretsQuery.isLoading,
    isSaving: mutations.saveSecrets.isPending,
    loadErrorMessage: secretsQuery.isError
      ? getErrorMessage(
          secretsQuery.error,
          'Something went wrong while loading config items.',
        )
      : undefined,
    onCancelEdit: handleCancelEdit,
    onCloseImportModal: handleCloseImportModal,
    onCopyExport: handleCopyExport,
    onDraftKeyChange: handleDraftKeyChange,
    onDraftValueChange: handleDraftValueChange,
    onImport: handleImport,
    onOpenAddSecret: handleOpenAddSecret,
    onOpenImportModal: handleOpenImportModal,
    onReveal: handleReveal,
    onRetry: () => secretsQuery.refetch(),
    onSaveEdit: handleSaveEdit,
    onStartEdit: handleStartEdit,
    onStartValueEdit: handleStartValueEdit,
    onToggleDelete: handleDeleteToggle,
    rows,
  }
}

export type SecretsEditorState = ReturnType<typeof useSecretsEditor>

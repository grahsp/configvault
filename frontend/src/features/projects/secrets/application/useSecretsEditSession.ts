import type { Secret } from '../domain'
import {
  createLocalSecretId,
  getUpdatedValidationIds,
  isLocalSecretId,
} from './secretsEditorDrafts.ts'
import type { SecretsEditSessionController } from './secretsEditor.types.ts'

interface UseSecretsEditSessionOptions {
  resetImportMutation: () => void
  resetSaveMutation: () => void
  state: SecretsEditSessionController
}

export function useSecretsEditSession({
  resetImportMutation,
  resetSaveMutation,
  state,
}: UseSecretsEditSessionOptions) {
  function handleOpenAddSecret() {
    const id = createLocalSecretId()

    resetSaveMutation()
    state.setNewSecrets((current) => [
      ...current,
      {
        id,
        key: '',
        value: '',
      },
    ])
    state.setFocusedSecretId(id)
  }

  function handleCancelEdit() {
    resetSaveMutation()
    state.setDrafts({})
    state.setNewSecrets([])
    state.setHighlightedValidationIds([])
    state.setPendingDeletionIds([])
    state.setFocusedSecretId(null)
  }

  function handleOpenImportModal() {
    resetImportMutation()
    state.setIsImportModalOpen(true)
  }

  function handleCloseImportModal() {
    resetImportMutation()
    state.setIsImportModalOpen(false)
  }

  function handleDeleteToggle(secret: Secret) {
    resetSaveMutation()

    if (isLocalSecretId(secret.id)) {
      state.setNewSecrets((current) =>
        current.filter((item) => item.id !== secret.id),
      )
      state.setHighlightedValidationIds((current) =>
        current.filter((id) => id !== secret.id),
      )
      return
    }

    state.setPendingDeletionIds((current) =>
      current.includes(secret.id)
        ? current.filter((id) => id !== secret.id)
        : [...current, secret.id],
    )
  }

  function handleDraftKeyChange(secret: Secret, nextDraftKey: string) {
    resetSaveMutation()

    if (isLocalSecretId(secret.id)) {
      state.setNewSecrets((current) =>
        current.map((item) =>
          item.id === secret.id ? { ...item, key: nextDraftKey } : item,
        ),
      )
      state.setHighlightedValidationIds((current) =>
        getUpdatedValidationIds(current, secret.id, nextDraftKey),
      )
      return
    }

    state.setDrafts((current) => ({
      ...current,
      [secret.id]: {
        key: nextDraftKey,
        value: current[secret.id]?.value ?? null,
      },
    }))
    state.setHighlightedValidationIds((current) =>
      getUpdatedValidationIds(current, secret.id, nextDraftKey),
    )
  }

  function handleDraftValueChange(secret: Secret, nextDraftValue: string) {
    resetSaveMutation()

    if (isLocalSecretId(secret.id)) {
      state.setNewSecrets((current) =>
        current.map((item) =>
          item.id === secret.id ? { ...item, value: nextDraftValue } : item,
        ),
      )
      return
    }

    state.setDrafts((current) => ({
      ...current,
      [secret.id]: {
        key: current[secret.id]?.key ?? secret.key,
        value: nextDraftValue,
      },
    }))
  }

  return {
    onCancelEdit: handleCancelEdit,
    onCloseImportModal: handleCloseImportModal,
    onDraftKeyChange: handleDraftKeyChange,
    onDraftValueChange: handleDraftValueChange,
    onOpenAddSecret: handleOpenAddSecret,
    onOpenImportModal: handleOpenImportModal,
    onToggleDelete: handleDeleteToggle,
  }
}

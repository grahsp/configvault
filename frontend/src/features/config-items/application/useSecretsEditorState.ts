import { useEffect, useReducer } from 'react'
import type { NewSecretDraft, SecretDraft } from './secretsEditor.types'

interface SecretsEditorState {
  drafts: Record<string, SecretDraft>
  environmentName: string
  focusedSecretId: string | null
  highlightedValidationIds: string[]
  isEditing: boolean
  isImportModalOpen: boolean
  newSecrets: NewSecretDraft[]
  pendingDeletionIds: string[]
  revealedValues: Record<string, string>
  revealingId: string | null
  visibleRevealedValues: Record<string, boolean>
}

type SecretsEditorAction =
  | {
      type: 'set-focused-secret-id'
      environmentName: string
      value: string | null
    }
  | {
      type: 'set-is-editing'
      environmentName: string
      value: boolean
    }
  | {
      type: 'set-is-import-modal-open'
      environmentName: string
      value: boolean
    }
  | {
      type: 'set-drafts'
      environmentName: string
      updater:
        | Record<string, SecretDraft>
        | ((current: Record<string, SecretDraft>) => Record<string, SecretDraft>)
    }
  | {
      type: 'set-new-secrets'
      environmentName: string
      updater:
        | NewSecretDraft[]
        | ((current: NewSecretDraft[]) => NewSecretDraft[])
    }
  | {
      type: 'set-highlighted-validation-ids'
      environmentName: string
      updater: string[] | ((current: string[]) => string[])
    }
  | {
      type: 'set-pending-deletion-ids'
      environmentName: string
      updater: string[] | ((current: string[]) => string[])
    }
  | {
      type: 'set-revealed-values'
      environmentName: string
      updater:
        | Record<string, string>
        | ((current: Record<string, string>) => Record<string, string>)
    }
  | {
      type: 'set-visible-revealed-values'
      environmentName: string
      updater:
        | Record<string, boolean>
        | ((
            current: Record<string, boolean>,
          ) => Record<string, boolean>)
    }
  | {
      type: 'set-revealing-id'
      environmentName: string
      updater: string | null | ((current: string | null) => string | null)
    }

export function useSecretsEditorState(
  environmentName: string,
  resetMutations: () => void,
) {
  const [state, dispatch] = useReducer(
    reducer,
    environmentName,
    createInitialState,
  )

  useEffect(() => {
    resetMutations()
  }, [environmentName, resetMutations])

  const currentState =
    state.environmentName === environmentName
      ? state
      : createInitialState(environmentName)

  return {
    drafts: currentState.drafts,
    focusedSecretId: currentState.focusedSecretId,
    highlightedValidationIds: currentState.highlightedValidationIds,
    isEditing: currentState.isEditing,
    isImportModalOpen: currentState.isImportModalOpen,
    newSecrets: currentState.newSecrets,
    pendingDeletionIds: currentState.pendingDeletionIds,
    revealedValues: currentState.revealedValues,
    revealingId: currentState.revealingId,
    setDrafts: (
      updater:
        | Record<string, SecretDraft>
        | ((current: Record<string, SecretDraft>) => Record<string, SecretDraft>),
    ) => {
      dispatch({ type: 'set-drafts', environmentName, updater })
    },
    setFocusedSecretId: (value: string | null) => {
      dispatch({ type: 'set-focused-secret-id', environmentName, value })
    },
    setHighlightedValidationIds: (
      updater: string[] | ((current: string[]) => string[]),
    ) => {
      dispatch({
        type: 'set-highlighted-validation-ids',
        environmentName,
        updater,
      })
    },
    setIsEditing: (value: boolean) => {
      dispatch({ type: 'set-is-editing', environmentName, value })
    },
    setIsImportModalOpen: (value: boolean) => {
      dispatch({ type: 'set-is-import-modal-open', environmentName, value })
    },
    setNewSecrets: (
      updater:
        | NewSecretDraft[]
        | ((current: NewSecretDraft[]) => NewSecretDraft[]),
    ) => {
      dispatch({ type: 'set-new-secrets', environmentName, updater })
    },
    setPendingDeletionIds: (
      updater: string[] | ((current: string[]) => string[]),
    ) => {
      dispatch({ type: 'set-pending-deletion-ids', environmentName, updater })
    },
    setRevealedValues: (
      updater:
        | Record<string, string>
        | ((current: Record<string, string>) => Record<string, string>),
    ) => {
      dispatch({ type: 'set-revealed-values', environmentName, updater })
    },
    setRevealingId: (
      updater: string | null | ((current: string | null) => string | null),
    ) => {
      dispatch({ type: 'set-revealing-id', environmentName, updater })
    },
    setVisibleRevealedValues: (
      updater:
        | Record<string, boolean>
        | ((
            current: Record<string, boolean>,
          ) => Record<string, boolean>),
    ) => {
      dispatch({
        type: 'set-visible-revealed-values',
        environmentName,
        updater,
      })
    },
    visibleRevealedValues: currentState.visibleRevealedValues,
  }
}

function reducer(
  state: SecretsEditorState,
  action: SecretsEditorAction,
) {
  const currentState = ensureCurrentEnvironment(state, action.environmentName)

  switch (action.type) {
    case 'set-focused-secret-id':
      return {
        ...currentState,
        focusedSecretId: action.value,
      }
    case 'set-is-editing':
      return {
        ...currentState,
        isEditing: action.value,
      }
    case 'set-is-import-modal-open':
      return {
        ...currentState,
        isImportModalOpen: action.value,
      }
    case 'set-drafts':
      return {
        ...currentState,
        drafts: resolveUpdater(currentState.drafts, action.updater),
      }
    case 'set-new-secrets':
      return {
        ...currentState,
        newSecrets: resolveUpdater(currentState.newSecrets, action.updater),
      }
    case 'set-highlighted-validation-ids':
      return {
        ...currentState,
        highlightedValidationIds: resolveUpdater(
          currentState.highlightedValidationIds,
          action.updater,
        ),
      }
    case 'set-pending-deletion-ids':
      return {
        ...currentState,
        pendingDeletionIds: resolveUpdater(
          currentState.pendingDeletionIds,
          action.updater,
        ),
      }
    case 'set-revealed-values':
      return {
        ...currentState,
        revealedValues: resolveUpdater(currentState.revealedValues, action.updater),
      }
    case 'set-visible-revealed-values':
      return {
        ...currentState,
        visibleRevealedValues: resolveUpdater(
          currentState.visibleRevealedValues,
          action.updater,
        ),
      }
    case 'set-revealing-id':
      return {
        ...currentState,
        revealingId: resolveUpdater(currentState.revealingId, action.updater),
      }
  }
}

function createInitialState(environmentName: string): SecretsEditorState {
  return {
    drafts: {},
    environmentName,
    focusedSecretId: null,
    highlightedValidationIds: [],
    isEditing: false,
    isImportModalOpen: false,
    newSecrets: [],
    pendingDeletionIds: [],
    revealedValues: {},
    revealingId: null,
    visibleRevealedValues: {},
  }
}

function ensureCurrentEnvironment(
  state: SecretsEditorState,
  environmentName: string,
) {
  if (state.environmentName === environmentName) {
    return state
  }

  return createInitialState(environmentName)
}

function resolveUpdater<T>(current: T, updater: T | ((current: T) => T)) {
  return typeof updater === 'function'
    ? (updater as (current: T) => T)(current)
    : updater
}

import { useEffect, useReducer } from 'react'
import type { Secret } from '../domain'
import type {
  NewSecretDraft,
  RevealedSecretValues,
  SecretDraftMap,
  SecretsEditorStateResult,
  SecretDraftMapUpdater,
  NewSecretsUpdater,
  PendingDeletionIdsUpdater,
  RevealedSecretValueRevisions,
  RevealedSecretValueRevisionsUpdater,
  Updater,
  ValidationIdsUpdater,
  VisibleRevealedSecretValues,
  VisibleRevealedSecretValuesUpdater,
  RevealedSecretValuesUpdater,
  RevealingIdUpdater,
} from './secretsEditor.types.ts'

interface EditSessionState {
  environmentName: string
  focusedSecretId: string | null
}

interface DraftState {
  drafts: SecretDraftMap
  highlightedValidationIds: string[]
  newSecrets: NewSecretDraft[]
  pendingDeletionIds: string[]
}

interface ModalState {
  historySecret: Secret | null
  isImportModalOpen: boolean
}

interface RevealState {
  revealedValueRevisions: RevealedSecretValueRevisions
  revealedValues: RevealedSecretValues
  revealingId: string | null
  visibleRevealedValues: VisibleRevealedSecretValues
}

interface SecretsEditorState
  extends EditSessionState,
    DraftState,
    ModalState,
    RevealState {}

type EnvironmentAction = {
  environmentName: string
}

type EditSessionAction =
  {
    type: 'set-focused-secret-id'
    value: string | null
  } & EnvironmentAction

type DraftAction =
  | ({
      type: 'set-drafts'
      updater: Updater<SecretDraftMap>
    } & EnvironmentAction)
  | ({
      type: 'set-new-secrets'
      updater: Updater<NewSecretDraft[]>
    } & EnvironmentAction)
  | ({
      type: 'set-highlighted-validation-ids'
      updater: Updater<string[]>
    } & EnvironmentAction)
  | ({
      type: 'set-pending-deletion-ids'
      updater: Updater<string[]>
    } & EnvironmentAction)

type ModalAction = {
  environmentName: string
} & (
  | {
      type: 'set-is-import-modal-open'
      value: boolean
    }
  | {
      type: 'set-history-secret'
      value: Secret | null
    }
)

type RevealAction =
  | ({
      type: 'set-revealed-value-revisions'
      updater: Updater<RevealedSecretValueRevisions>
    } & EnvironmentAction)
  | ({
      type: 'set-revealed-values'
      updater: Updater<RevealedSecretValues>
    } & EnvironmentAction)
  | ({
      type: 'set-visible-revealed-values'
      updater: Updater<VisibleRevealedSecretValues>
    } & EnvironmentAction)
  | ({
      type: 'set-revealing-id'
      updater: Updater<string | null>
    } & EnvironmentAction)

type SecretsEditorAction =
  | EditSessionAction
  | DraftAction
  | ModalAction
  | RevealAction

export function useSecretsEditorState(
  environmentName: string,
  resetMutations: () => void,
): SecretsEditorStateResult {
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
    historySecret: currentState.historySecret,
    highlightedValidationIds: currentState.highlightedValidationIds,
    isImportModalOpen: currentState.isImportModalOpen,
    newSecrets: currentState.newSecrets,
    pendingDeletionIds: currentState.pendingDeletionIds,
    revealedValueRevisions: currentState.revealedValueRevisions,
    revealedValues: currentState.revealedValues,
    revealingId: currentState.revealingId,
    setDrafts: (updater: SecretDraftMapUpdater) => {
      dispatch({ type: 'set-drafts', environmentName, updater })
    },
    setFocusedSecretId: (value: string | null) => {
      dispatch({ type: 'set-focused-secret-id', environmentName, value })
    },
    setHistorySecret: (value: Secret | null) => {
      dispatch({ type: 'set-history-secret', environmentName, value })
    },
    setHighlightedValidationIds: (updater: ValidationIdsUpdater) => {
      dispatch({
        type: 'set-highlighted-validation-ids',
        environmentName,
        updater,
      })
    },
    setIsImportModalOpen: (value: boolean) => {
      dispatch({ type: 'set-is-import-modal-open', environmentName, value })
    },
    setNewSecrets: (updater: NewSecretsUpdater) => {
      dispatch({ type: 'set-new-secrets', environmentName, updater })
    },
    setPendingDeletionIds: (updater: PendingDeletionIdsUpdater) => {
      dispatch({ type: 'set-pending-deletion-ids', environmentName, updater })
    },
    setRevealedValueRevisions: (
      updater: RevealedSecretValueRevisionsUpdater,
    ) => {
      dispatch({ type: 'set-revealed-value-revisions', environmentName, updater })
    },
    setRevealedValues: (updater: RevealedSecretValuesUpdater) => {
      dispatch({ type: 'set-revealed-values', environmentName, updater })
    },
    setRevealingId: (updater: RevealingIdUpdater) => {
      dispatch({ type: 'set-revealing-id', environmentName, updater })
    },
    setVisibleRevealedValues: (
      updater: VisibleRevealedSecretValuesUpdater,
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

  if (isEditSessionAction(action)) {
    return reduceEditSessionState(currentState, action)
  }

  if (isDraftAction(action)) {
    return reduceDraftState(currentState, action)
  }

  if (isRevealAction(action)) {
    return reduceRevealState(currentState, action)
  }

  return reduceModalState(currentState, action)
}

function createInitialState(environmentName: string): SecretsEditorState {
  return {
    drafts: {},
    environmentName,
    focusedSecretId: null,
    historySecret: null,
    highlightedValidationIds: [],
    isImportModalOpen: false,
    newSecrets: [],
    pendingDeletionIds: [],
    revealedValueRevisions: {},
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

function isEditSessionAction(
  action: SecretsEditorAction,
): action is EditSessionAction {
  return action.type === 'set-focused-secret-id'
}

function isDraftAction(action: SecretsEditorAction): action is DraftAction {
  return (
    action.type === 'set-drafts' ||
    action.type === 'set-new-secrets' ||
    action.type === 'set-highlighted-validation-ids' ||
    action.type === 'set-pending-deletion-ids'
  )
}

function isRevealAction(action: SecretsEditorAction): action is RevealAction {
  return (
    action.type === 'set-revealed-value-revisions' ||
    action.type === 'set-revealed-values' ||
    action.type === 'set-visible-revealed-values' ||
    action.type === 'set-revealing-id'
  )
}

function reduceEditSessionState(
  state: SecretsEditorState,
  action: EditSessionAction,
) {
  switch (action.type) {
    case 'set-focused-secret-id':
      return setStateValue(state, 'focusedSecretId', action.value)
  }
}

function reduceDraftState(
  state: SecretsEditorState,
  action: DraftAction,
) {
  switch (action.type) {
    case 'set-drafts':
      return updateStateValue(state, 'drafts', action.updater)
    case 'set-new-secrets':
      return updateStateValue(state, 'newSecrets', action.updater)
    case 'set-highlighted-validation-ids':
      return updateStateValue(state, 'highlightedValidationIds', action.updater)
    case 'set-pending-deletion-ids':
      return updateStateValue(state, 'pendingDeletionIds', action.updater)
  }
}

function reduceRevealState(
  state: SecretsEditorState,
  action: RevealAction,
) {
  switch (action.type) {
    case 'set-revealed-value-revisions':
      return updateStateValue(state, 'revealedValueRevisions', action.updater)
    case 'set-revealed-values':
      return updateStateValue(state, 'revealedValues', action.updater)
    case 'set-visible-revealed-values':
      return updateStateValue(state, 'visibleRevealedValues', action.updater)
    case 'set-revealing-id':
      return updateStateValue(state, 'revealingId', action.updater)
  }
}

function reduceModalState(
  state: SecretsEditorState,
  action: ModalAction,
) {
  switch (action.type) {
    case 'set-history-secret':
      return setStateValue(state, 'historySecret', action.value)
    case 'set-is-import-modal-open':
      return setStateValue(state, 'isImportModalOpen', action.value)
  }
}

function setStateValue<K extends keyof SecretsEditorState>(
  state: SecretsEditorState,
  key: K,
  value: SecretsEditorState[K],
) {
  return {
    ...state,
    [key]: value,
  }
}

function updateStateValue<K extends keyof SecretsEditorState>(
  state: SecretsEditorState,
  key: K,
  updater: Updater<SecretsEditorState[K]>,
) {
  return setStateValue(state, key, resolveUpdater(state[key], updater))
}

function resolveUpdater<T>(current: T, updater: Updater<T>) {
  return typeof updater === 'function'
    ? (updater as (current: T) => T)(current)
    : updater
}

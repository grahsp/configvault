import type { Secret } from '../domain'

export interface SecretDraft {
  key: string
  value: string | null
}

export interface NewSecretDraft {
  id: string
  key: string
  value: string
}

export type SecretDraftMap = Record<string, SecretDraft>

export type RevealedSecretValues = Record<string, string>

export type RevealedSecretValueRevisions = Record<string, number>

export type VisibleRevealedSecretValues = Record<string, boolean>

export type Updater<T> = T | ((current: T) => T)

export type SecretDraftMapUpdater = Updater<SecretDraftMap>

export type NewSecretsUpdater = Updater<NewSecretDraft[]>

export type ValidationIdsUpdater = Updater<string[]>

export type PendingDeletionIdsUpdater = Updater<string[]>

export type RevealedSecretValuesUpdater = Updater<RevealedSecretValues>

export type RevealedSecretValueRevisionsUpdater =
  Updater<RevealedSecretValueRevisions>

export type VisibleRevealedSecretValuesUpdater =
  Updater<VisibleRevealedSecretValues>

export type RevealingIdUpdater = Updater<string | null>

export interface SecretsEditorStateResult {
  drafts: SecretDraftMap
  focusedSecretId: string | null
  historySecret: Secret | null
  highlightedValidationIds: string[]
  isImportModalOpen: boolean
  newSecrets: NewSecretDraft[]
  pendingDeletionIds: string[]
  revealedValueRevisions: RevealedSecretValueRevisions
  revealedValues: RevealedSecretValues
  revealingId: string | null
  setDrafts: (updater: SecretDraftMapUpdater) => void
  setFocusedSecretId: (value: string | null) => void
  setHistorySecret: (value: Secret | null) => void
  setHighlightedValidationIds: (updater: ValidationIdsUpdater) => void
  setIsImportModalOpen: (value: boolean) => void
  setNewSecrets: (updater: NewSecretsUpdater) => void
  setPendingDeletionIds: (updater: PendingDeletionIdsUpdater) => void
  setRevealedValueRevisions: (
    updater: RevealedSecretValueRevisionsUpdater,
  ) => void
  setRevealedValues: (updater: RevealedSecretValuesUpdater) => void
  setRevealingId: (updater: RevealingIdUpdater) => void
  setVisibleRevealedValues: (
    updater: VisibleRevealedSecretValuesUpdater,
  ) => void
  visibleRevealedValues: VisibleRevealedSecretValues
}

export interface SecretsEditSessionController {
  setDrafts: (updater: SecretDraftMapUpdater) => void
  setFocusedSecretId: (value: string | null) => void
  setHistorySecret: (value: Secret | null) => void
  setHighlightedValidationIds: (updater: ValidationIdsUpdater) => void
  setIsImportModalOpen: (value: boolean) => void
  setNewSecrets: (updater: NewSecretsUpdater) => void
  setPendingDeletionIds: (updater: PendingDeletionIdsUpdater) => void
}

export interface SecretsRevealController {
  drafts: SecretDraftMap
  revealedValueRevisions: RevealedSecretValueRevisions
  revealedValues: RevealedSecretValues
  setDrafts: (updater: SecretDraftMapUpdater) => void
  setRevealedValueRevisions: (
    updater: RevealedSecretValueRevisionsUpdater,
  ) => void
  setRevealedValues: (updater: RevealedSecretValuesUpdater) => void
  setRevealingId: (updater: RevealingIdUpdater) => void
  setVisibleRevealedValues: (
    updater: VisibleRevealedSecretValuesUpdater,
  ) => void
  visibleRevealedValues: VisibleRevealedSecretValues
}

export interface SecretsSaveController {
  drafts: SecretDraftMap
  newSecrets: NewSecretDraft[]
  pendingDeletionIds: string[]
  revealedValueRevisions: RevealedSecretValueRevisions
  setHighlightedValidationIds: (updater: ValidationIdsUpdater) => void
  setRevealedValueRevisions: (
    updater: RevealedSecretValueRevisionsUpdater,
  ) => void
  setRevealedValues: (updater: RevealedSecretValuesUpdater) => void
  setVisibleRevealedValues: (
    updater: VisibleRevealedSecretValuesUpdater,
  ) => void
}

export interface SecretRowViewModel {
  secret: Secret
  draftKey: string
  draftValue: string | null
  isMarkedForDeletion: boolean
  isRevealing: boolean
  isValueRevealed: boolean
  revealedValue?: string
  shouldFocus: boolean
  validationError?: string
}

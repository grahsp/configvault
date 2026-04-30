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

export type VisibleRevealedSecretValues = Record<string, boolean>

export type Updater<T> = T | ((current: T) => T)

export type SecretDraftMapUpdater = Updater<SecretDraftMap>

export type NewSecretsUpdater = Updater<NewSecretDraft[]>

export type ValidationIdsUpdater = Updater<string[]>

export type PendingDeletionIdsUpdater = Updater<string[]>

export type RevealedSecretValuesUpdater = Updater<RevealedSecretValues>

export type VisibleRevealedSecretValuesUpdater =
  Updater<VisibleRevealedSecretValues>

export type RevealingIdUpdater = Updater<string | null>

export interface SecretsEditorStateResult {
  drafts: SecretDraftMap
  focusedSecretId: string | null
  highlightedValidationIds: string[]
  isEditing: boolean
  isImportModalOpen: boolean
  newSecrets: NewSecretDraft[]
  pendingDeletionIds: string[]
  revealedValues: RevealedSecretValues
  revealingId: string | null
  setDrafts: (updater: SecretDraftMapUpdater) => void
  setFocusedSecretId: (value: string | null) => void
  setHighlightedValidationIds: (updater: ValidationIdsUpdater) => void
  setIsEditing: (value: boolean) => void
  setIsImportModalOpen: (value: boolean) => void
  setNewSecrets: (updater: NewSecretsUpdater) => void
  setPendingDeletionIds: (updater: PendingDeletionIdsUpdater) => void
  setRevealedValues: (updater: RevealedSecretValuesUpdater) => void
  setRevealingId: (updater: RevealingIdUpdater) => void
  setVisibleRevealedValues: (
    updater: VisibleRevealedSecretValuesUpdater,
  ) => void
  visibleRevealedValues: VisibleRevealedSecretValues
}

export interface SecretsEditSessionController {
  isEditing: boolean
  setDrafts: (updater: SecretDraftMapUpdater) => void
  setFocusedSecretId: (value: string | null) => void
  setHighlightedValidationIds: (updater: ValidationIdsUpdater) => void
  setIsEditing: (value: boolean) => void
  setIsImportModalOpen: (value: boolean) => void
  setNewSecrets: (updater: NewSecretsUpdater) => void
  setPendingDeletionIds: (updater: PendingDeletionIdsUpdater) => void
}

export interface SecretsRevealController {
  drafts: SecretDraftMap
  revealedValues: RevealedSecretValues
  setDrafts: (updater: SecretDraftMapUpdater) => void
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
  setHighlightedValidationIds: (updater: ValidationIdsUpdater) => void
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

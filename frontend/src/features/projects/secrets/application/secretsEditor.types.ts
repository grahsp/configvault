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

import type { Secret } from '../domain'
import { getSecretKeyValidationError } from '../domain'
import type {
  NewSecretDraft,
  SecretDraft,
  SecretRowViewModel,
} from './secretsEditor.types.ts'
import { isLocalSecretId } from './secretsEditorDrafts.ts'

export function buildSecretRows({
  drafts,
  focusedSecretId,
  highlightedValidationIds,
  newSecrets,
  pendingDeletionIds,
  revealedValues,
  revealingId,
  tableSecrets,
  visibleRevealedValues,
}: {
  drafts: Record<string, SecretDraft>
  focusedSecretId: string | null
  highlightedValidationIds: string[]
  newSecrets: NewSecretDraft[]
  pendingDeletionIds: string[]
  revealedValues: Record<string, string>
  revealingId: string | null
  tableSecrets: Secret[]
  visibleRevealedValues: Record<string, boolean>
}) {
  const validationErrors = getSecretValidationErrorMap(
    tableSecrets,
    drafts,
    newSecrets,
    pendingDeletionIds,
  )

  return tableSecrets.map<SecretRowViewModel>((secret) => ({
    secret,
    draftKey: getDraftKey(secret, drafts, newSecrets),
    draftValue: getDraftValue(secret, drafts, newSecrets),
    isMarkedForDeletion: pendingDeletionIds.includes(secret.id),
    isRevealing: revealingId === secret.id,
    isValueRevealed: Boolean(visibleRevealedValues[secret.id]),
    revealedValue: visibleRevealedValues[secret.id]
      ? revealedValues[secret.id]
      : undefined,
    shouldFocus: secret.id === focusedSecretId,
    validationError: highlightedValidationIds.includes(secret.id)
      ? validationErrors[secret.id]
      : undefined,
  }))
}

export function getSecretValidationErrorMap(
  tableSecrets: Secret[],
  drafts: Record<string, SecretDraft>,
  newSecrets: NewSecretDraft[],
  pendingDeletionIds: string[],
) {
  return Object.fromEntries(
    tableSecrets.map((secret) => [
      secret.id,
      getValidationError(
        secret,
        tableSecrets,
        drafts,
        newSecrets,
        pendingDeletionIds,
      ),
    ]),
  )
}

function getValidationError(
  secret: Secret,
  tableSecrets: Secret[],
  drafts: Record<string, SecretDraft>,
  newSecrets: NewSecretDraft[],
  pendingDeletionIds: string[],
) {
  if (pendingDeletionIds.includes(secret.id)) {
    return undefined
  }

  const draftKey = getDraftKey(secret, drafts, newSecrets)
  const keyError = getSecretKeyValidationError(draftKey)

  if (keyError) {
    return keyError
  }

  const trimmedDraftKey = draftKey.trim()

  if (trimmedDraftKey === '') {
    return undefined
  }

  const duplicateSecret = getComparableSecrets(
    secret,
    tableSecrets,
    drafts,
    newSecrets,
    pendingDeletionIds,
  ).find((candidate) => candidate.key.trim() === trimmedDraftKey)

  return duplicateSecret ? 'Secret key must be unique' : undefined
}

function getComparableSecrets(
  currentSecret: Secret,
  tableSecrets: Secret[],
  drafts: Record<string, SecretDraft>,
  newSecrets: NewSecretDraft[],
  pendingDeletionIds: string[],
) {
  const pendingDeletionIdSet = new Set(pendingDeletionIds)

  return tableSecrets
    .filter((secret) => !pendingDeletionIdSet.has(secret.id))
    .map((secret) => ({
      id: secret.id,
      key: getDraftKey(secret, drafts, newSecrets),
    }))
    .filter((secret) => secret.id !== currentSecret.id)
}

function getDraftKey(
  secret: Secret,
  drafts: Record<string, SecretDraft>,
  newSecrets: NewSecretDraft[],
) {
  if (isLocalSecretId(secret.id)) {
    return newSecrets.find((item) => item.id === secret.id)?.key ?? secret.key
  }

  return drafts[secret.id]?.key ?? secret.key
}

function getDraftValue(
  secret: Secret,
  drafts: Record<string, SecretDraft>,
  newSecrets: NewSecretDraft[],
) {
  if (isLocalSecretId(secret.id)) {
    return newSecrets.find((item) => item.id === secret.id)?.value ?? ''
  }

  return drafts[secret.id]?.value ?? null
}

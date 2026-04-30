import { type SecretBatchOperation } from '../api'
import type { Secret } from '../domain'
import { getSecretKeyValidationError } from '../domain'
import type {
  NewSecretDraft,
  SecretDraft,
  SecretRowViewModel,
} from './secretsEditor.types.ts'

export function buildSecretRows({
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
}: {
  drafts: Record<string, SecretDraft>
  focusedSecretId: string | null
  highlightedValidationIds: string[]
  isEditing: boolean
  newSecrets: NewSecretDraft[]
  pendingDeletionIds: string[]
  revealedValues: Record<string, string>
  revealingId: string | null
  tableSecrets: Secret[]
  visibleRevealedValues: Record<string, boolean>
}) {
  const validationErrors = getValidationErrors(
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
    validationError:
      isEditing && highlightedValidationIds.includes(secret.id)
        ? validationErrors[secret.id]
        : undefined,
  }))
}

export function buildSaveOperations({
  secrets,
  drafts,
  newSecrets,
  pendingDeletionIds,
}: {
  secrets: Secret[]
  drafts: Record<string, SecretDraft>
  newSecrets: NewSecretDraft[]
  pendingDeletionIds: string[]
}) {
  const tableSecrets = [...secrets, ...newSecrets.map(toLocalSecret)]
  const invalidSecretIds = Object.entries(
    getValidationErrors(
      tableSecrets,
      drafts,
      newSecrets,
      pendingDeletionIds,
    ),
  )
    .filter(([, error]) => Boolean(error))
    .map(([secretId]) => secretId)

  if (invalidSecretIds.length > 0) {
    return { invalidSecretIds, operations: [] as SecretBatchOperation[] }
  }

  const pendingDeletionIdSet = new Set(pendingDeletionIds)
  const existingOperations: SecretBatchOperation[] = []

  for (const secret of secrets) {
    const draft = drafts[secret.id]
    const nextKey = draft?.key ?? secret.key
    const nextValue = draft?.value ?? ''
    const trimmedKey = nextKey.trim()

    if (pendingDeletionIdSet.has(secret.id)) {
      existingOperations.push({
        type: 'delete',
        secretId: secret.id,
      })
      continue
    }

    if (trimmedKey !== secret.key) {
      existingOperations.push({
        type: 'rename',
        secretId: secret.id,
        key: trimmedKey,
      })
    }

    if (nextValue !== '') {
      existingOperations.push({
        type: 'set-value',
        secretId: secret.id,
        value: nextValue,
      })
    }
  }

  const createOperations: SecretBatchOperation[] = newSecrets.map((secret) => ({
      type: 'create',
      key: secret.key.trim(),
      ...(secret.value !== '' ? { initialValue: secret.value } : {}),
    }))

  return {
    invalidSecretIds,
    operations: [...existingOperations, ...createOperations],
  }
}

export function createDrafts(items: Secret[]) {
  return Object.fromEntries(
    items.map((secret) => [
      secret.id,
      {
        key: secret.key,
        value: null,
      },
    ]),
  )
}

export function createLocalSecretId() {
  return `local-config-item-${crypto.randomUUID()}`
}

export function getErrorMessage(error: unknown, fallbackMessage: string) {
  return error instanceof Error ? error.message : fallbackMessage
}

export function getSuccessMessage(operations: SecretBatchOperation[]) {
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

export function getUpdatedValidationIds(
  currentIds: string[],
  secretId: string,
  nextDraftKey: string,
) {
  return getSecretKeyValidationError(nextDraftKey)
    ? currentIds.includes(secretId)
      ? currentIds
      : [...currentIds, secretId]
    : currentIds.filter((id) => id !== secretId)
}

export function getAffectedValueIds(operations: SecretBatchOperation[]) {
  const secretIdsWithUpdatedValues = operations
    .filter(
      (
        operation,
      ): operation is Extract<SecretBatchOperation, { type: 'set-value' }> =>
        operation.type === 'set-value',
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

  return [...secretIdsWithUpdatedValues, ...deletedSecretIds]
}

export function isLocalSecretId(secretId: string) {
  return secretId.startsWith('local-config-item-')
}

export function omitRevealedValues<T extends string | boolean>(
  values: Record<string, T>,
  secretIds: string[],
) {
  const hiddenIds = new Set(secretIds)

  return Object.fromEntries(
    Object.entries(values).filter(([secretId]) => !hiddenIds.has(secretId)),
  ) as Record<string, T>
}

export function toLocalSecret(secret: NewSecretDraft): Secret {
  return {
    id: secret.id,
    key: secret.key,
    hasValue: false,
  }
}

function getValidationErrors(
  tableSecrets: Secret[],
  drafts: Record<string, SecretDraft>,
  newSecrets: NewSecretDraft[],
  pendingDeletionIds: string[],
) {
  return Object.fromEntries(
    tableSecrets.map((secret) => [
      secret.id,
      pendingDeletionIds.includes(secret.id)
        ? undefined
        : getSecretKeyValidationError(
            getDraftKey(secret, drafts, newSecrets),
          ),
    ]),
  )
}

function getDraftKey(
  secret: Secret,
  drafts: Record<string, SecretDraft>,
  newSecrets: NewSecretDraft[],
) {
  if (isLocalSecretId(secret.id)) {
    return (
      newSecrets.find((item) => item.id === secret.id)?.key ?? secret.key
    )
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

import { type SecretBatchOperation } from '../api'
import type { Secret } from '../domain'
import type { NewSecretDraft, SecretDraft } from './secretsEditor.types.ts'
import { toLocalSecret } from './secretsEditorDrafts.ts'
import { getSecretValidationErrorMap } from './secretRowViewModels.ts'

export function buildSaveOperations({
  secrets,
  drafts,
  newSecrets,
  pendingDeletionIds,
  revealedValueRevisions,
}: {
  secrets: Secret[]
  drafts: Record<string, SecretDraft>
  newSecrets: NewSecretDraft[]
  pendingDeletionIds: string[]
  revealedValueRevisions: Record<string, number>
}) {
  const tableSecrets = [...secrets, ...newSecrets.map(toLocalSecret)]
  const invalidSecretIds = Object.entries(
    getSecretValidationErrorMap(
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
        expectedRevision: revealedValueRevisions[secret.id] ?? secret.revision,
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

export function omitRevealedValues<T extends string | boolean | number>(
  values: Record<string, T>,
  secretIds: string[],
) {
  const hiddenIds = new Set(secretIds)

  return Object.fromEntries(
    Object.entries(values).filter(([secretId]) => !hiddenIds.has(secretId)),
  ) as Record<string, T>
}

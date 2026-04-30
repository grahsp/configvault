import { type SecretBatchOperation } from '../api'

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

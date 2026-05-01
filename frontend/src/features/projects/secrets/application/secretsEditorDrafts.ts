import type { Secret } from '../domain'
import { getSecretKeyValidationError } from '../domain'

export function createLocalSecretId() {
  return `local-config-item-${crypto.randomUUID()}`
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

export function isLocalSecretId(secretId: string) {
  return secretId.startsWith('local-config-item-')
}

export function toLocalSecret(secret: {
  id: string
  key: string
}): Secret {
  return {
    id: secret.id,
    key: secret.key,
    hasValue: false,
  }
}

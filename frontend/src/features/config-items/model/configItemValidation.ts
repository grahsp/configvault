export function getConfigItemKeyValidationError(key: string) {
  const trimmedKey = key.trim()

  if (!trimmedKey) {
    return 'Key is required.'
  }

  if (/\s/.test(trimmedKey)) {
    return 'Key cannot contain spaces.'
  }

  if (/[^A-Za-z0-9_]/.test(trimmedKey)) {
    return 'Key can only contain letters, numbers, and underscores.'
  }

  return undefined
}

export function getUppercaseConfigItemKeySuggestion(key: string) {
  const trimmedKey = key.trim()
  const uppercaseKey = trimmedKey.toUpperCase()

  return trimmedKey && trimmedKey !== uppercaseKey ? uppercaseKey : undefined
}

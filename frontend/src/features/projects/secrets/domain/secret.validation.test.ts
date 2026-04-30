import { describe, expect, it } from 'vitest'
import { getSecretKeyValidationError } from './secret.validation.ts'

describe('secret validation', () => {
  it('accepts letters, numbers, and underscores', () => {
    expect(getSecretKeyValidationError('API_KEY_1')).toBeUndefined()
    expect(getSecretKeyValidationError('api_key_1')).toBeUndefined()
  })

  it('rejects symbols other than underscores', () => {
    expect(getSecretKeyValidationError('API-KEY')).toBe(
      'Key can only contain letters, numbers, and underscores.',
    )
    expect(getSecretKeyValidationError('API.KEY')).toBe(
      'Key can only contain letters, numbers, and underscores.',
    )
  })
})

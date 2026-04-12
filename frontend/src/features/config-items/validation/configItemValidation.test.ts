import { describe, expect, it } from 'vitest'
import { getConfigItemKeyValidationError } from './configItemValidation'

describe('config item validation', () => {
  it('accepts letters, numbers, and underscores', () => {
    expect(getConfigItemKeyValidationError('API_KEY_1')).toBeUndefined()
    expect(getConfigItemKeyValidationError('api_key_1')).toBeUndefined()
  })

  it('rejects symbols other than underscores', () => {
    expect(getConfigItemKeyValidationError('API-KEY')).toBe(
      'Key can only contain letters, numbers, and underscores.',
    )
    expect(getConfigItemKeyValidationError('API.KEY')).toBe(
      'Key can only contain letters, numbers, and underscores.',
    )
  })
})

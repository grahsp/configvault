import { describe, expect, it } from 'vitest'
import type { Secret } from '../domain'
import { buildSaveOperations } from './secretsSavePlan.ts'

describe('buildSaveOperations', () => {
  it('includes the current revision when updating an existing secret value', () => {
    const secrets: Secret[] = [
      {
        id: 'config-1',
        key: 'API_KEY',
        hasValue: true,
        revision: 4,
      },
    ]

    const result = buildSaveOperations({
      secrets,
      drafts: {
        'config-1': {
          key: 'API_KEY',
          value: 'next-secret',
        },
      },
      newSecrets: [],
      pendingDeletionIds: [],
      revealedValueRevisions: {},
    })

    expect(result.invalidSecretIds).toEqual([])
    expect(result.operations).toEqual([
      {
        type: 'set-value',
        secretId: 'config-1',
        value: 'next-secret',
        expectedRevision: 4,
      },
    ])
  })

  it('prefers the revealed current revision when the list revision is stale', () => {
    const secrets: Secret[] = [
      {
        id: 'config-1',
        key: 'API_KEY',
        hasValue: true,
        revision: 0,
      },
    ]

    const result = buildSaveOperations({
      secrets,
      drafts: {
        'config-1': {
          key: 'API_KEY',
          value: 'next-secret',
        },
      },
      newSecrets: [],
      pendingDeletionIds: [],
      revealedValueRevisions: {
        'config-1': 1,
      },
    })

    expect(result.operations).toEqual([
      {
        type: 'set-value',
        secretId: 'config-1',
        value: 'next-secret',
        expectedRevision: 1,
      },
    ])
  })
})

import { describe, expect, it, vi } from 'vitest'
import type { ApiClient } from '../../../../api/apiClient.ts'
import {
  exportSecrets,
  getSecretValueRevision,
  getSecretValueRevisions,
  getSecretValue,
  getSecrets,
  importSecrets,
  saveSecrets,
  upsertSecretValue,
} from './secretsApi.ts'

function createMockClient() {
  return {
    request: vi.fn(),
    requestText: vi.fn(),
  } as unknown as ApiClient
}

describe('secrets api', () => {
  it('loads environment secrets with encoded project and environment values', async () => {
    const client = createMockClient()
    const secrets = [
      {
        id: 'config-1',
        key: 'API_KEY',
        hasValue: true,
        revision: 3,
      },
    ]
    vi.mocked(client.request).mockResolvedValue(secrets)

    await expect(
      getSecrets(client, 'project/with space', 'prod/eu west'),
    ).resolves.toEqual(secrets)

    expect(client.request).toHaveBeenCalledWith(
      '/projects/project%2Fwith%20space/secrets?environment=prod%2Feu%20west',
    )
  })

  it('saves secret operations with the environment name', async () => {
    const client = createMockClient()
    vi.mocked(client.request).mockResolvedValue(undefined)

    await expect(
      saveSecrets(
        client,
        'project/with space',
        'prod/eu west',
        [
          { type: 'create', key: 'NEW_KEY', initialValue: 'secret-value' },
          { type: 'rename', secretId: 'config-1', key: 'API_KEY' },
          {
            type: 'set-value',
            secretId: 'config-1',
            value: 'secret-value',
            expectedRevision: 3,
          },
          { type: 'delete', secretId: 'config-2' },
        ],
      ),
    ).resolves.toBeUndefined()

    expect(client.request).toHaveBeenCalledWith(
      '/projects/project%2Fwith%20space/secrets/operations',
      {
        method: 'POST',
        body: JSON.stringify({
          environment: 'prod/eu west',
          operations: [
            { type: 'create', key: 'NEW_KEY', initialValue: 'secret-value' },
            { type: 'rename', secretId: 'config-1', key: 'API_KEY' },
            {
              type: 'set-value',
              secretId: 'config-1',
              value: 'secret-value',
              expectedRevision: 3,
            },
            { type: 'delete', secretId: 'config-2' },
          ],
        }),
      },
    )
  })

  it('loads a secret value with encoded path and environment values', async () => {
    const client = createMockClient()
    const secretValue = { value: 'secret-value' }
    vi.mocked(client.request).mockResolvedValue(secretValue)

    await expect(
      getSecretValue(
        client,
        'project/with space',
        'config/with space',
        'prod/eu west',
      ),
    ).resolves.toEqual(secretValue)

    expect(client.request).toHaveBeenCalledWith(
      '/projects/project%2Fwith%20space/secrets/config%2Fwith%20space/value?environment=prod%2Feu%20west',
    )
  })

  it('loads secret revision summaries with encoded path and environment values', async () => {
    const client = createMockClient()
    const revisions = [
      {
        revision: 3,
        modifiedByDisplayName: 'User 123',
        modifiedAt: '2025-02-01T10:00:00Z',
        isCurrent: true,
      },
    ]
    vi.mocked(client.request).mockResolvedValue(revisions)

    await expect(
      getSecretValueRevisions(
        client,
        'project/with space',
        'config/with space',
        'prod/eu west',
      ),
    ).resolves.toEqual(revisions)

    expect(client.request).toHaveBeenCalledWith(
      '/projects/project%2Fwith%20space/secrets/config%2Fwith%20space/value/revisions?environment=prod%2Feu%20west',
    )
  })

  it('loads a specific secret revision with encoded path and environment values', async () => {
    const client = createMockClient()
    const revision = {
      revision: 2,
      modifiedByDisplayName: 'User 123',
      modifiedAt: '2025-02-01T10:00:00Z',
      isCurrent: false,
      value: 'secret-value-v2',
    }
    vi.mocked(client.request).mockResolvedValue(revision)

    await expect(
      getSecretValueRevision(
        client,
        'project/with space',
        'config/with space',
        'prod/eu west',
        2,
      ),
    ).resolves.toEqual(revision)

    expect(client.request).toHaveBeenCalledWith(
      '/projects/project%2Fwith%20space/secrets/config%2Fwith%20space/value/revisions/2?environment=prod%2Feu%20west',
    )
  })

  it('exports secrets with encoded project and environment values', async () => {
    const client = createMockClient()
    vi.mocked(client.requestText).mockResolvedValue('API_KEY=secret-value')

    await expect(
      exportSecrets(client, 'project/with space', 'prod/eu west'),
    ).resolves.toBe('API_KEY=secret-value')

    expect(client.requestText).toHaveBeenCalledWith(
      '/projects/project%2Fwith%20space/export?environment=prod%2Feu%20west',
    )
  })

  it('imports secrets with a plain text body and encoded project and environment values', async () => {
    const client = createMockClient()
    vi.mocked(client.request).mockResolvedValue(undefined)

    await expect(
      importSecrets(
        client,
        'project/with space',
        'prod/eu west',
        'API_KEY=secret-value\nDATABASE_URL=postgres://localhost',
      ),
    ).resolves.toBeUndefined()

    expect(client.request).toHaveBeenCalledWith(
      '/projects/project%2Fwith%20space/import?environment=prod%2Feu%20west',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: 'API_KEY=secret-value\nDATABASE_URL=postgres://localhost',
      },
    )
  })

  it('upserts a secret value through the batch operations endpoint', async () => {
    const client = createMockClient()
    vi.mocked(client.request).mockResolvedValue(undefined)

    await expect(
      upsertSecretValue(
        client,
        'project/with space',
        'config/with space',
        'prod/eu west',
        'secret-value',
        7,
      ),
    ).resolves.toBeUndefined()

    expect(client.request).toHaveBeenCalledWith(
      '/projects/project%2Fwith%20space/secrets/operations',
      {
        method: 'POST',
        body: JSON.stringify({
          environment: 'prod/eu west',
          operations: [
            {
              type: 'set-value',
              secretId: 'config/with space',
              value: 'secret-value',
              expectedRevision: 7,
            },
          ],
        }),
      },
    )
  })
})

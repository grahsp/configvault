import { describe, expect, it, vi } from 'vitest'
import type { ApiClient } from '../../../api/apiClient'
import {
  deleteConfigItem,
  exportConfigItems,
  getConfigItemValue,
  getConfigItems,
  importConfigItems,
  renameConfigItem,
  saveConfigItems,
  upsertConfigItemValue,
} from './configItemsApi'

function createMockClient() {
  return {
    request: vi.fn(),
    requestText: vi.fn(),
  } as unknown as ApiClient
}

describe('config items api', () => {
  it('loads environment config items with encoded project and environment values', async () => {
    const client = createMockClient()
    const configItems = [
      {
        id: 'config-1',
        key: 'API_KEY',
        hasValue: true,
      },
    ]
    vi.mocked(client.request).mockResolvedValue(configItems)

    await expect(
      getConfigItems(client, 'project/with space', 'prod/eu west'),
    ).resolves.toEqual(configItems)

    expect(client.request).toHaveBeenCalledWith(
      '/projects/project%2Fwith%20space/config-items?environment=prod%2Feu%20west',
    )
  })

  it('saves config item operations with the environment name', async () => {
    const client = createMockClient()
    vi.mocked(client.request).mockResolvedValue(undefined)

    await expect(
      saveConfigItems(
        client,
        'project/with space',
        'prod/eu west',
        [
          { type: 'create', key: 'NEW_KEY', initialValue: 'secret-value' },
          { type: 'rename', configItemId: 'config-1', key: 'API_KEY' },
          { type: 'set-value', configItemId: 'config-1', value: 'secret-value' },
          { type: 'delete', configItemId: 'config-2' },
        ],
      ),
    ).resolves.toBeUndefined()

    expect(client.request).toHaveBeenCalledWith(
      '/projects/project%2Fwith%20space/config-items/operations',
      {
        method: 'POST',
        body: JSON.stringify({
          environment: 'prod/eu west',
          operations: [
            { type: 'create', key: 'NEW_KEY', initialValue: 'secret-value' },
            { type: 'rename', configItemId: 'config-1', key: 'API_KEY' },
            { type: 'set-value', configItemId: 'config-1', value: 'secret-value' },
            { type: 'delete', configItemId: 'config-2' },
          ],
        }),
      },
    )
  })

  it('renames a config item with encoded project and config item ids', async () => {
    const client = createMockClient()
    vi.mocked(client.request).mockResolvedValue(undefined)

    await expect(
      renameConfigItem(
        client,
        'project/with space',
        'config/with space',
        'RENAMED_KEY',
      ),
    ).resolves.toBeUndefined()

    expect(client.request).toHaveBeenCalledWith(
      '/projects/project%2Fwith%20space/config-items/config%2Fwith%20space',
      {
        method: 'PATCH',
        body: JSON.stringify({ key: 'RENAMED_KEY' }),
      },
    )
  })

  it('deletes a config item with encoded project and config item ids', async () => {
    const client = createMockClient()
    vi.mocked(client.request).mockResolvedValue(undefined)

    await deleteConfigItem(client, 'project/with space', 'config/with space')

    expect(client.request).toHaveBeenCalledWith(
      '/projects/project%2Fwith%20space/config-items/config%2Fwith%20space',
      {
        method: 'DELETE',
      },
    )
  })

  it('loads a config item value with encoded path and environment values', async () => {
    const client = createMockClient()
    const configItemValue = { value: 'secret-value' }
    vi.mocked(client.request).mockResolvedValue(configItemValue)

    await expect(
      getConfigItemValue(
        client,
        'project/with space',
        'config/with space',
        'prod/eu west',
      ),
    ).resolves.toEqual(configItemValue)

    expect(client.request).toHaveBeenCalledWith(
      '/projects/project%2Fwith%20space/config-items/config%2Fwith%20space/value?environment=prod%2Feu%20west',
    )
  })

  it('exports config items with encoded project and environment values', async () => {
    const client = createMockClient()
    vi.mocked(client.requestText).mockResolvedValue('API_KEY=secret-value')

    await expect(
      exportConfigItems(client, 'project/with space', 'prod/eu west'),
    ).resolves.toBe('API_KEY=secret-value')

    expect(client.requestText).toHaveBeenCalledWith(
      '/projects/project%2Fwith%20space/export?environment=prod%2Feu%20west',
    )
  })

  it('imports config items with a plain text body and encoded project and environment values', async () => {
    const client = createMockClient()
    vi.mocked(client.request).mockResolvedValue(undefined)

    await expect(
      importConfigItems(
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

  it('upserts a config item value with encoded path and environment values', async () => {
    const client = createMockClient()
    vi.mocked(client.request).mockResolvedValue(undefined)

    await expect(
      upsertConfigItemValue(
        client,
        'project/with space',
        'config/with space',
        'prod/eu west',
        'secret-value',
      ),
    ).resolves.toBeUndefined()

    expect(client.request).toHaveBeenCalledWith(
      '/projects/project%2Fwith%20space/config-items/config%2Fwith%20space/value?environment=prod%2Feu%20west',
      {
        method: 'PUT',
        body: JSON.stringify({ value: 'secret-value' }),
      },
    )
  })
})

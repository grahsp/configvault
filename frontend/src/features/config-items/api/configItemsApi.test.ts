import { describe, expect, it, vi } from 'vitest'
import type { ApiClient } from '../../../api/apiClient'
import {
  createConfigItem,
  deleteConfigItem,
  getConfigItems,
  renameConfigItem,
} from './configItemsApi'

function createMockClient() {
  return {
    request: vi.fn(),
  } as unknown as ApiClient
}

describe('config items api', () => {
  it('loads project config items with an encoded project id', async () => {
    const client = createMockClient()
    const configItems = [
      {
        id: 'config-1',
        key: 'API_KEY',
        createdAt: '2026-04-12T10:00:00.000Z',
      },
    ]
    vi.mocked(client.request).mockResolvedValue(configItems)

    await expect(
      getConfigItems(client, 'project/with space'),
    ).resolves.toEqual(configItems)

    expect(client.request).toHaveBeenCalledWith(
      '/projects/project%2Fwith%20space/config-items',
    )
  })

  it('creates a config item with an encoded project id and requested key', async () => {
    const client = createMockClient()
    const configItem = {
      id: 'config-1',
      key: 'API_KEY',
      createdAt: '2026-04-12T10:00:00.000Z',
    }
    vi.mocked(client.request).mockResolvedValue(configItem)

    await expect(
      createConfigItem(client, 'project/with space', 'API_KEY'),
    ).resolves.toEqual(configItem)

    expect(client.request).toHaveBeenCalledWith(
      '/projects/project%2Fwith%20space/config-items',
      {
        method: 'POST',
        body: JSON.stringify({ key: 'API_KEY' }),
      },
    )
  })

  it('renames a config item with encoded project and config item ids', async () => {
    const client = createMockClient()
    const configItem = {
      id: 'config/1',
      key: 'RENAMED_KEY',
      createdAt: '2026-04-12T10:00:00.000Z',
    }
    vi.mocked(client.request).mockResolvedValue(configItem)

    await expect(
      renameConfigItem(
        client,
        'project/with space',
        'config/with space',
        'RENAMED_KEY',
      ),
    ).resolves.toEqual(configItem)

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
})

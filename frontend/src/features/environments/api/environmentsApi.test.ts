import { describe, expect, it, vi } from 'vitest'
import type { ApiClient } from '../../../api/apiClient'
import {
  createEnvironment,
  deleteEnvironment,
  getEnvironments,
} from './environmentsApi'

function createMockClient() {
  return {
    request: vi.fn(),
  } as unknown as ApiClient
}

describe('environment api', () => {
  it('loads project environments and maps API responses', async () => {
    const client = createMockClient()
    vi.mocked(client.request).mockResolvedValue([
      {
        id: 'env-development',
        environmentName: 'Development',
      },
      {
        id: 'env-production',
        environmentName: 'Production',
      },
    ])

    await expect(
      getEnvironments(client, 'project/with space'),
    ).resolves.toEqual([
      {
        id: 'env-development',
        environmentName: 'Development',
      },
      {
        id: 'env-production',
        environmentName: 'Production',
      },
    ])

    expect(client.request).toHaveBeenCalledWith(
      '/projects/project%2Fwith%20space/environments',
    )
  })

  it('creates a project environment with a trimmed request body', async () => {
    const client = createMockClient()
    vi.mocked(client.request).mockResolvedValue({
      id: 'env-staging',
      environmentName: 'Staging',
    })

    await expect(
      createEnvironment(client, 'project-1', '  Staging  '),
    ).resolves.toEqual({
      id: 'env-staging',
      environmentName: 'Staging',
    })

    expect(client.request).toHaveBeenCalledWith(
      '/projects/project-1/environments',
      {
        method: 'POST',
        body: JSON.stringify({
          environmentName: 'Staging',
        }),
      },
    )
  })

  it('deletes an environment scoped to its project', async () => {
    const client = createMockClient()
    vi.mocked(client.request).mockResolvedValue(undefined)

    await deleteEnvironment(client, 'project/1', 'env/production')

    expect(client.request).toHaveBeenCalledWith(
      '/projects/project%2F1/environments/env%2Fproduction',
      {
        method: 'DELETE',
      },
    )
  })
})

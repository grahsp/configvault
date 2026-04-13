import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { ConfigItem } from '../types/ConfigItem'
import { configItemQueryKeys } from './configItemQueryKeys'
import { useConfigItems } from './useConfigItems'
import { useCreateConfigItem } from './useCreateConfigItem'
import { useDeleteConfigItem } from './useDeleteConfigItem'
import { useRenameConfigItem } from './useRenameConfigItem'

const apiMocks = vi.hoisted(() => ({
  createConfigItem: vi.fn(),
  deleteConfigItem: vi.fn(),
  getConfigItems: vi.fn(),
  renameConfigItem: vi.fn(),
}))

vi.mock('../api/configItemsApi', () => apiMocks)

vi.mock('../../../shared/hooks/useAuth', () => ({
  useAuth: () => ({
    getAccessTokenSilently: vi.fn().mockResolvedValue('test-token'),
  }),
}))

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  })
}

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
  }
}

function createDeferred<T>() {
  let resolve: (value: T) => void = () => undefined
  let reject: (error: Error) => void = () => undefined
  const promise = new Promise<T>((nextResolve, nextReject) => {
    resolve = nextResolve
    reject = nextReject
  })

  return { promise, reject, resolve }
}

function getCachedConfigItems(
  queryClient: QueryClient,
  projectId: string,
  environmentName: string,
) {
  return queryClient.getQueryData<ConfigItem[]>(
    configItemQueryKeys.list(projectId, environmentName),
  )
}

describe('config item hooks', () => {
  const projectId = 'project-1'
  const environmentName = 'production'
  const existingConfigItems: ConfigItem[] = [
    {
      id: 'config-1',
      key: 'API_KEY',
      hasValue: true,
    },
    {
      id: 'config-2',
      key: 'DATABASE_URL',
      hasValue: false,
    },
  ]

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('does not fetch config items when the project id is empty', async () => {
    const queryClient = createTestQueryClient()

    renderHook(() => useConfigItems('', environmentName), {
      wrapper: createWrapper(queryClient),
    })

    await waitFor(() => expect(apiMocks.getConfigItems).not.toHaveBeenCalled())
  })

  it('does not fetch config items when the environment name is empty', async () => {
    const queryClient = createTestQueryClient()

    renderHook(() => useConfigItems(projectId, ''), {
      wrapper: createWrapper(queryClient),
    })

    await waitFor(() => expect(apiMocks.getConfigItems).not.toHaveBeenCalled())
  })

  it('fetches config items for a project environment', async () => {
    const queryClient = createTestQueryClient()
    apiMocks.getConfigItems.mockResolvedValue(existingConfigItems)

    const { result } = renderHook(
      () => useConfigItems(projectId, environmentName),
      {
        wrapper: createWrapper(queryClient),
      },
    )

    await waitFor(() => expect(result.current.data).toEqual(existingConfigItems))
    expect(apiMocks.getConfigItems).toHaveBeenCalledWith(
      expect.any(Object),
      projectId,
      environmentName,
    )
  })

  it('uses separate cache entries for each environment', async () => {
    const queryClient = createTestQueryClient()
    apiMocks.getConfigItems.mockResolvedValue(existingConfigItems)

    const { rerender } = renderHook(
      ({ nextEnvironmentName }) =>
        useConfigItems(projectId, nextEnvironmentName),
      {
        initialProps: { nextEnvironmentName: environmentName },
        wrapper: createWrapper(queryClient),
      },
    )

    await waitFor(() => expect(apiMocks.getConfigItems).toHaveBeenCalledTimes(1))

    const stagingConfigItems: ConfigItem[] = [
      {
        id: 'config-3',
        key: 'STRIPE_KEY',
        hasValue: true,
      },
    ]
    apiMocks.getConfigItems.mockResolvedValue(stagingConfigItems)
    rerender({ nextEnvironmentName: 'staging' })

    await waitFor(() => expect(apiMocks.getConfigItems).toHaveBeenCalledTimes(2))
    expect(
      getCachedConfigItems(queryClient, projectId, environmentName),
    ).toEqual(existingConfigItems)
    expect(getCachedConfigItems(queryClient, projectId, 'staging')).toEqual(
      stagingConfigItems,
    )
  })

  it('optimistically adds a config item and refetches the list', async () => {
    const queryClient = createTestQueryClient()
    const deferredCreate = createDeferred<void>()
    apiMocks.createConfigItem.mockReturnValue(deferredCreate.promise)
    queryClient.setQueryData(
      configItemQueryKeys.list(projectId, environmentName),
      existingConfigItems,
    )

    const { result } = renderHook(
      () => useCreateConfigItem(projectId, environmentName),
      {
        wrapper: createWrapper(queryClient),
      },
    )

    act(() => result.current.mutate('NEW_KEY'))

    await waitFor(() =>
      expect(
        getCachedConfigItems(queryClient, projectId, environmentName),
      ).toEqual([
        ...existingConfigItems,
        expect.objectContaining({ hasValue: false, key: 'NEW_KEY' }),
      ]),
    )

    await act(async () => {
      deferredCreate.resolve(undefined)
      await deferredCreate.promise
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })

  it('restores the previous list when create fails', async () => {
    const queryClient = createTestQueryClient()
    const deferredCreate = createDeferred<void>()
    apiMocks.createConfigItem.mockReturnValue(deferredCreate.promise)
    queryClient.setQueryData(
      configItemQueryKeys.list(projectId, environmentName),
      existingConfigItems,
    )

    const { result } = renderHook(
      () => useCreateConfigItem(projectId, environmentName),
      {
        wrapper: createWrapper(queryClient),
      },
    )

    act(() => result.current.mutate('NEW_KEY'))

    await waitFor(() =>
      expect(
        getCachedConfigItems(queryClient, projectId, environmentName),
      ).toHaveLength(3),
    )

    await act(async () => {
      deferredCreate.reject(new Error('Create failed'))
      await deferredCreate.promise.catch(() => undefined)
    })

    await waitFor(() =>
      expect(
        getCachedConfigItems(queryClient, projectId, environmentName),
      ).toEqual(existingConfigItems),
    )
  })

  it('optimistically renames a config item and refetches the list', async () => {
    const queryClient = createTestQueryClient()
    apiMocks.renameConfigItem.mockResolvedValue(undefined)
    queryClient.setQueryData(
      configItemQueryKeys.list(projectId, environmentName),
      existingConfigItems,
    )

    const { result } = renderHook(
      () => useRenameConfigItem(projectId, environmentName),
      {
        wrapper: createWrapper(queryClient),
      },
    )

    act(() =>
      result.current.mutate({
        configItemId: 'config-1',
        key: 'RENAMED_KEY',
      }),
    )

    await waitFor(() =>
      expect(
        getCachedConfigItems(queryClient, projectId, environmentName),
      ).toContainEqual({
        ...existingConfigItems[0],
        key: 'RENAMED_KEY',
      }),
    )
    expect(apiMocks.renameConfigItem).toHaveBeenCalledWith(
      expect.any(Object),
      projectId,
      'config-1',
      'RENAMED_KEY',
    )
  })

  it('restores the previous list when rename fails', async () => {
    const queryClient = createTestQueryClient()
    const deferredRename = createDeferred<void>()
    apiMocks.renameConfigItem.mockReturnValue(deferredRename.promise)
    queryClient.setQueryData(
      configItemQueryKeys.list(projectId, environmentName),
      existingConfigItems,
    )

    const { result } = renderHook(
      () => useRenameConfigItem(projectId, environmentName),
      {
        wrapper: createWrapper(queryClient),
      },
    )

    act(() =>
      result.current.mutate({
        configItemId: 'config-1',
        key: 'RENAMED_KEY',
      }),
    )

    await waitFor(() =>
      expect(
        getCachedConfigItems(queryClient, projectId, environmentName)?.[0].key,
      ).toBe('RENAMED_KEY'),
    )

    await act(async () => {
      deferredRename.reject(new Error('Rename failed'))
      await deferredRename.promise.catch(() => undefined)
    })

    await waitFor(() =>
      expect(
        getCachedConfigItems(queryClient, projectId, environmentName),
      ).toEqual(existingConfigItems),
    )
  })

  it('optimistically removes a config item', async () => {
    const queryClient = createTestQueryClient()
    apiMocks.deleteConfigItem.mockResolvedValue(undefined)
    queryClient.setQueryData(
      configItemQueryKeys.list(projectId, environmentName),
      existingConfigItems,
    )

    const { result } = renderHook(
      () => useDeleteConfigItem(projectId, environmentName),
      {
        wrapper: createWrapper(queryClient),
      },
    )

    act(() => result.current.mutate('config-1'))

    await waitFor(() =>
      expect(
        getCachedConfigItems(queryClient, projectId, environmentName),
      ).toEqual([existingConfigItems[1]]),
    )
    expect(apiMocks.deleteConfigItem).toHaveBeenCalledWith(
      expect.any(Object),
      projectId,
      'config-1',
    )
  })

  it('restores the previous list when delete fails', async () => {
    const queryClient = createTestQueryClient()
    const deferredDelete = createDeferred<void>()
    apiMocks.deleteConfigItem.mockReturnValue(deferredDelete.promise)
    queryClient.setQueryData(
      configItemQueryKeys.list(projectId, environmentName),
      existingConfigItems,
    )

    const { result } = renderHook(
      () => useDeleteConfigItem(projectId, environmentName),
      {
        wrapper: createWrapper(queryClient),
      },
    )

    act(() => result.current.mutate('config-1'))

    await waitFor(() =>
      expect(
        getCachedConfigItems(queryClient, projectId, environmentName),
      ).toEqual([existingConfigItems[1]]),
    )

    await act(async () => {
      deferredDelete.reject(new Error('Delete failed'))
      await deferredDelete.promise.catch(() => undefined)
    })

    await waitFor(() =>
      expect(
        getCachedConfigItems(queryClient, projectId, environmentName),
      ).toEqual(existingConfigItems),
    )
  })
})

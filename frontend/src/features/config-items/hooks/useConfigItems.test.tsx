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

function getCachedConfigItems(queryClient: QueryClient, projectId: string) {
  return queryClient.getQueryData<ConfigItem[]>(
    configItemQueryKeys.list(projectId),
  )
}

describe('config item hooks', () => {
  const projectId = 'project-1'
  const existingConfigItems: ConfigItem[] = [
    {
      id: 'config-1',
      key: 'API_KEY',
      createdAt: '2026-04-12T10:00:00.000Z',
    },
    {
      id: 'config-2',
      key: 'DATABASE_URL',
      createdAt: '2026-04-12T11:00:00.000Z',
    },
  ]

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('does not fetch config items when the project id is empty', async () => {
    const queryClient = createTestQueryClient()

    renderHook(() => useConfigItems(''), {
      wrapper: createWrapper(queryClient),
    })

    await waitFor(() => expect(apiMocks.getConfigItems).not.toHaveBeenCalled())
  })

  it('fetches config items for a project', async () => {
    const queryClient = createTestQueryClient()
    apiMocks.getConfigItems.mockResolvedValue(existingConfigItems)

    const { result } = renderHook(() => useConfigItems(projectId), {
      wrapper: createWrapper(queryClient),
    })

    await waitFor(() => expect(result.current.data).toEqual(existingConfigItems))
    expect(apiMocks.getConfigItems).toHaveBeenCalledWith(
      expect.any(Object),
      projectId,
    )
  })

  it('optimistically adds a config item and replaces it with the created item', async () => {
    const queryClient = createTestQueryClient()
    const deferredCreate = createDeferred<ConfigItem>()
    const createdConfigItem: ConfigItem = {
      id: 'config-3',
      key: 'NEW_KEY',
      createdAt: '2026-04-12T12:00:00.000Z',
    }
    apiMocks.createConfigItem.mockReturnValue(deferredCreate.promise)
    queryClient.setQueryData(
      configItemQueryKeys.list(projectId),
      existingConfigItems,
    )

    const { result } = renderHook(() => useCreateConfigItem(projectId), {
      wrapper: createWrapper(queryClient),
    })

    act(() => result.current.mutate('NEW_KEY'))

    await waitFor(() =>
      expect(getCachedConfigItems(queryClient, projectId)).toEqual([
        ...existingConfigItems,
        expect.objectContaining({ key: 'NEW_KEY' }),
      ]),
    )

    await act(async () => {
      deferredCreate.resolve(createdConfigItem)
      await deferredCreate.promise
    })

    await waitFor(() =>
      expect(getCachedConfigItems(queryClient, projectId)).toContainEqual(
        createdConfigItem,
      ),
    )
  })

  it('restores the previous list when create fails', async () => {
    const queryClient = createTestQueryClient()
    const deferredCreate = createDeferred<ConfigItem>()
    apiMocks.createConfigItem.mockReturnValue(deferredCreate.promise)
    queryClient.setQueryData(
      configItemQueryKeys.list(projectId),
      existingConfigItems,
    )

    const { result } = renderHook(() => useCreateConfigItem(projectId), {
      wrapper: createWrapper(queryClient),
    })

    act(() => result.current.mutate('NEW_KEY'))

    await waitFor(() =>
      expect(getCachedConfigItems(queryClient, projectId)).toHaveLength(3),
    )

    await act(async () => {
      deferredCreate.reject(new Error('Create failed'))
      await deferredCreate.promise.catch(() => undefined)
    })

    await waitFor(() =>
      expect(getCachedConfigItems(queryClient, projectId)).toEqual(
        existingConfigItems,
      ),
    )
  })

  it('optimistically renames a config item and stores the server result', async () => {
    const queryClient = createTestQueryClient()
    const renamedConfigItem: ConfigItem = {
      ...existingConfigItems[0],
      key: 'RENAMED_KEY',
    }
    apiMocks.renameConfigItem.mockResolvedValue(renamedConfigItem)
    queryClient.setQueryData(
      configItemQueryKeys.list(projectId),
      existingConfigItems,
    )

    const { result } = renderHook(() => useRenameConfigItem(projectId), {
      wrapper: createWrapper(queryClient),
    })

    act(() =>
      result.current.mutate({
        configItemId: 'config-1',
        key: 'RENAMED_KEY',
      }),
    )

    await waitFor(() =>
      expect(getCachedConfigItems(queryClient, projectId)).toContainEqual(
        renamedConfigItem,
      ),
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
    const deferredRename = createDeferred<ConfigItem>()
    apiMocks.renameConfigItem.mockReturnValue(deferredRename.promise)
    queryClient.setQueryData(
      configItemQueryKeys.list(projectId),
      existingConfigItems,
    )

    const { result } = renderHook(() => useRenameConfigItem(projectId), {
      wrapper: createWrapper(queryClient),
    })

    act(() =>
      result.current.mutate({
        configItemId: 'config-1',
        key: 'RENAMED_KEY',
      }),
    )

    await waitFor(() =>
      expect(getCachedConfigItems(queryClient, projectId)?.[0].key).toBe(
        'RENAMED_KEY',
      ),
    )

    await act(async () => {
      deferredRename.reject(new Error('Rename failed'))
      await deferredRename.promise.catch(() => undefined)
    })

    await waitFor(() =>
      expect(getCachedConfigItems(queryClient, projectId)).toEqual(
        existingConfigItems,
      ),
    )
  })

  it('optimistically removes a config item', async () => {
    const queryClient = createTestQueryClient()
    apiMocks.deleteConfigItem.mockResolvedValue(undefined)
    queryClient.setQueryData(
      configItemQueryKeys.list(projectId),
      existingConfigItems,
    )

    const { result } = renderHook(() => useDeleteConfigItem(projectId), {
      wrapper: createWrapper(queryClient),
    })

    act(() => result.current.mutate('config-1'))

    await waitFor(() =>
      expect(getCachedConfigItems(queryClient, projectId)).toEqual([
        existingConfigItems[1],
      ]),
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
      configItemQueryKeys.list(projectId),
      existingConfigItems,
    )

    const { result } = renderHook(() => useDeleteConfigItem(projectId), {
      wrapper: createWrapper(queryClient),
    })

    act(() => result.current.mutate('config-1'))

    await waitFor(() =>
      expect(getCachedConfigItems(queryClient, projectId)).toEqual([
        existingConfigItems[1],
      ]),
    )

    await act(async () => {
      deferredDelete.reject(new Error('Delete failed'))
      await deferredDelete.promise.catch(() => undefined)
    })

    await waitFor(() =>
      expect(getCachedConfigItems(queryClient, projectId)).toEqual(
        existingConfigItems,
      ),
    )
  })
})

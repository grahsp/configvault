import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Environment } from './environment.ts'
import { environmentQueryKeys } from './environmentQueryKeys.ts'
import { useCreateEnvironment } from './useCreateEnvironment.ts'
import { useDeleteEnvironment } from './useDeleteEnvironment.ts'
import { useEnvironments } from './useEnvironments.ts'

const apiMocks = vi.hoisted(() => ({
  createEnvironment: vi.fn(),
  deleteEnvironment: vi.fn(),
  getEnvironments: vi.fn(),
}))

vi.mock('../api/environmentsApi', () => apiMocks)

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

describe('environment hooks', () => {
  const projectId = 'project-1'
  const existingEnvironments: Environment[] = [
    {
      id: 'env-development',
      environmentName: 'Development',
    },
    {
      id: 'env-production',
      environmentName: 'Production',
    },
  ]

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('does not fetch environments when the project id is empty', async () => {
    const queryClient = createTestQueryClient()

    renderHook(() => useEnvironments(''), {
      wrapper: createWrapper(queryClient),
    })

    await waitFor(() => expect(apiMocks.getEnvironments).not.toHaveBeenCalled())
  })

  it('fetches environments for the selected project', async () => {
    const queryClient = createTestQueryClient()
    apiMocks.getEnvironments.mockResolvedValue(existingEnvironments)

    const { result } = renderHook(() => useEnvironments(projectId), {
      wrapper: createWrapper(queryClient),
    })

    await waitFor(() =>
      expect(result.current.data).toEqual(existingEnvironments),
    )
    expect(apiMocks.getEnvironments).toHaveBeenCalledWith(
      expect.any(Object),
      projectId,
    )
  })

  it('adds a created environment to the cached list', async () => {
    const queryClient = createTestQueryClient()
    const createdEnvironment: Environment = {
      id: 'env-staging',
      environmentName: 'Staging',
    }
    apiMocks.createEnvironment.mockResolvedValue(createdEnvironment)
    queryClient.setQueryData(
      environmentQueryKeys.list(projectId),
      existingEnvironments,
    )

    const { result } = renderHook(() => useCreateEnvironment(projectId), {
      wrapper: createWrapper(queryClient),
    })

    await act(async () => {
      await result.current.mutateAsync('Staging')
    })

    expect(
      queryClient.getQueryData(environmentQueryKeys.list(projectId)),
    ).toEqual([...existingEnvironments, createdEnvironment])
  })

  it('removes a deleted environment from the cached list', async () => {
    const queryClient = createTestQueryClient()
    apiMocks.deleteEnvironment.mockResolvedValue(undefined)
    queryClient.setQueryData(
      environmentQueryKeys.list(projectId),
      existingEnvironments,
    )

    const { result } = renderHook(() => useDeleteEnvironment(projectId), {
      wrapper: createWrapper(queryClient),
    })

    await act(async () => {
      await result.current.mutateAsync('env-production')
    })

    expect(
      queryClient.getQueryData(environmentQueryKeys.list(projectId)),
    ).toEqual([
      {
        id: 'env-development',
        environmentName: 'Development',
      },
    ])
  })
})

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Secret } from '../domain'
import { secretsQueryKeys } from './secretsQueryKeys.ts'
import { useSecretsMutations } from './useSecretsMutations.ts'
import { useSecretsQuery } from './useSecretsQuery.ts'

const apiMocks = vi.hoisted(() => ({
  exportSecrets: vi.fn(),
  getSecretValue: vi.fn(),
  getSecrets: vi.fn(),
  importSecrets: vi.fn(),
  saveSecrets: vi.fn(),
}))

vi.mock('../api', () => apiMocks)

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

function getCachedSecrets(
  queryClient: QueryClient,
  projectId: string,
  environmentName: string,
) {
  return queryClient.getQueryData<Secret[]>(
    secretsQueryKeys.list(projectId, environmentName),
  )
}

describe('secrets application hooks', () => {
  const projectId = 'project-1'
  const environmentName = 'production'
  const existingSecrets: Secret[] = [
    {
      id: 'config-1',
      key: 'API_KEY',
      hasValue: true,
      revision: 4,
    },
    {
      id: 'config-2',
      key: 'DATABASE_URL',
      hasValue: false,
      revision: 0,
    },
  ]

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('does not fetch secrets when the project id is empty', async () => {
    const queryClient = createTestQueryClient()

    renderHook(() => useSecretsQuery('', environmentName), {
      wrapper: createWrapper(queryClient),
    })

    await waitFor(() => expect(apiMocks.getSecrets).not.toHaveBeenCalled())
  })

  it('does not fetch secrets when the environment name is empty', async () => {
    const queryClient = createTestQueryClient()

    renderHook(() => useSecretsQuery(projectId, ''), {
      wrapper: createWrapper(queryClient),
    })

    await waitFor(() => expect(apiMocks.getSecrets).not.toHaveBeenCalled())
  })

  it('fetches secrets for a project environment', async () => {
    const queryClient = createTestQueryClient()
    apiMocks.getSecrets.mockResolvedValue(existingSecrets)

    const { result } = renderHook(() => useSecretsQuery(projectId, environmentName), {
      wrapper: createWrapper(queryClient),
    })

    await waitFor(() => expect(result.current.data).toEqual(existingSecrets))
    expect(apiMocks.getSecrets).toHaveBeenCalledWith(
      expect.any(Object),
      projectId,
      environmentName,
    )
  })

  it('uses separate cache entries for each environment', async () => {
    const queryClient = createTestQueryClient()
    apiMocks.getSecrets.mockResolvedValue(existingSecrets)

    const { rerender } = renderHook(
      ({ nextEnvironmentName }) => useSecretsQuery(projectId, nextEnvironmentName),
      {
        initialProps: { nextEnvironmentName: environmentName },
        wrapper: createWrapper(queryClient),
      },
    )

    await waitFor(() => expect(apiMocks.getSecrets).toHaveBeenCalledTimes(1))

    const stagingSecrets: Secret[] = [
      {
        id: 'config-3',
        key: 'STRIPE_KEY',
        hasValue: true,
        revision: 2,
      },
    ]
    apiMocks.getSecrets.mockResolvedValue(stagingSecrets)
    rerender({ nextEnvironmentName: 'staging' })

    await waitFor(() => expect(apiMocks.getSecrets).toHaveBeenCalledTimes(2))
    expect(getCachedSecrets(queryClient, projectId, environmentName)).toEqual(
      existingSecrets,
    )
    expect(getCachedSecrets(queryClient, projectId, 'staging')).toEqual(
      stagingSecrets,
    )
  })

  it('reveals a secret value for the selected environment', async () => {
    const queryClient = createTestQueryClient()
    apiMocks.getSecretValue.mockResolvedValue({ value: 'secret-value', revision: 4 })

    const { result } = renderHook(
      () => useSecretsMutations(projectId, environmentName),
      {
        wrapper: createWrapper(queryClient),
      },
    )

    let revealedValue

    await act(async () => {
      revealedValue = await result.current.revealSecretValue.mutateAsync({
        secretId: 'config-1',
      })
    })

    expect(revealedValue).toEqual({ value: 'secret-value', revision: 4 })
    expect(apiMocks.getSecretValue).toHaveBeenCalledWith(
      expect.any(Object),
      projectId,
      'config-1',
      environmentName,
    )
  })

  it('imports secrets and invalidates the list query', async () => {
    const queryClient = createTestQueryClient()
    apiMocks.importSecrets.mockResolvedValue(undefined)
    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(
      () => useSecretsMutations(projectId, environmentName),
      {
        wrapper: createWrapper(queryClient),
      },
    )

    await act(async () => {
      await result.current.importSecrets.mutateAsync('API_KEY=value')
    })

    expect(apiMocks.importSecrets).toHaveBeenCalledWith(
      expect.any(Object),
      projectId,
      environmentName,
      'API_KEY=value',
    )
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: secretsQueryKeys.list(projectId, environmentName),
    })
  })

  it('saves secret operations and invalidates the list query without mutating cache', async () => {
    const queryClient = createTestQueryClient()
    apiMocks.saveSecrets.mockResolvedValue(undefined)
    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')
    queryClient.setQueryData(
      secretsQueryKeys.list(projectId, environmentName),
      existingSecrets,
    )

    const { result } = renderHook(
      () => useSecretsMutations(projectId, environmentName),
      {
        wrapper: createWrapper(queryClient),
      },
    )

    const operations = [
      {
        type: 'set-value' as const,
        secretId: 'config-1',
        value: 'updated-secret',
        expectedRevision: 4,
      },
      { type: 'create' as const, key: 'NEW_KEY' },
    ]

    await act(async () => {
      await result.current.saveSecrets.mutateAsync({ operations })
    })

    expect(apiMocks.saveSecrets).toHaveBeenCalledWith(
      expect.any(Object),
      projectId,
      environmentName,
      operations,
    )
    expect(getCachedSecrets(queryClient, projectId, environmentName)).toEqual(
      existingSecrets,
    )
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: secretsQueryKeys.list(projectId, environmentName),
    })
  })

  it('upserts a secret value and invalidates the list query without mutating cache', async () => {
    const queryClient = createTestQueryClient()
    apiMocks.saveSecrets.mockResolvedValue(undefined)
    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')
    queryClient.setQueryData(
      secretsQueryKeys.list(projectId, environmentName),
      existingSecrets,
    )

    const { result } = renderHook(
      () => useSecretsMutations(projectId, environmentName),
      {
        wrapper: createWrapper(queryClient),
      },
    )

    await act(async () => {
      await result.current.upsertSecretValue.mutateAsync({
        expectedRevision: 0,
        secretId: 'config-2',
        value: 'new-secret-value',
      })
    })

    expect(getCachedSecrets(queryClient, projectId, environmentName)).toEqual(
      existingSecrets,
    )
    expect(apiMocks.saveSecrets).toHaveBeenCalledWith(
      expect.any(Object),
      projectId,
      environmentName,
      [
        {
          type: 'set-value',
          expectedRevision: 0,
          secretId: 'config-2',
          value: 'new-secret-value',
        },
      ],
    )
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: secretsQueryKeys.list(projectId, environmentName),
    })
  })
})

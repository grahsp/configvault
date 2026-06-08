import {
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { useState } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { EnvironmentDropdown } from './EnvironmentDropdown.tsx'

const getAccessTokenSilently = vi.fn().mockResolvedValue('test-token')

vi.mock('@/features/auth/hooks', () => ({
  useAuth: () => ({
    getAccessTokenSilently,
  }),
}))

afterEach(() => {
  vi.clearAllMocks()
  vi.unstubAllGlobals()
})

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

function renderWithQueryClient(ui: ReactNode) {
  const queryClient = createTestQueryClient()

  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  )
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: {
      'Content-Type': 'application/json',
    },
    status,
  })
}

function mockEnvironmentFetch(body: unknown, status = 200) {
  const fetchMock = vi.fn(
    async (...args: [RequestInfo | URL, RequestInit?]) => {
      void args

      return jsonResponse(body, status)
    },
  )

  vi.stubGlobal('fetch', fetchMock)

  return fetchMock
}

function createDeferredResponse() {
  let resolve: (response: Response) => void = () => undefined
  const response = new Promise<Response>((next) => {
    resolve = next
  })

  return { response, resolve }
}

function ControlledEnvironmentDropdown({
  initialEnvironmentId = '',
  onEnvironmentChange = () => undefined,
}: {
  initialEnvironmentId?: string
  onEnvironmentChange?: (environmentId: string) => void
}) {
  const [selectedEnvironmentId, setSelectedEnvironmentId] =
    useState(initialEnvironmentId)

  return (
    <EnvironmentDropdown
      onEnvironmentChange={(environmentId) => {
        setSelectedEnvironmentId(environmentId)
        onEnvironmentChange(environmentId)
      }}
      projectId="project-1"
      selectedEnvironmentId={selectedEnvironmentId}
    />
  )
}

describe('EnvironmentDropdown container', () => {
  it('shows the loading state while environments load', async () => {
    const environmentsResponse = createDeferredResponse()
    vi.stubGlobal('fetch', vi.fn(() => environmentsResponse.response))

    renderWithQueryClient(
      <EnvironmentDropdown
        onEnvironmentChange={vi.fn()}
        projectId="project-1"
        selectedEnvironmentId=""
      />,
    )

    await waitFor(() => {
      expect(
        screen.getByRole('button', {
          name: /^Loading\.\.\.$/,
        }),
      ).toBeDisabled()
    })

    environmentsResponse.resolve(jsonResponse([]))
  })

  it('loads environments and auto-selects the first option when none is selected', async () => {
    const handleEnvironmentChange = vi.fn()
    const fetchMock = mockEnvironmentFetch([
      {
        id: 'env-development',
        environmentName: 'Development',
      },
      {
        id: 'env-production',
        environmentName: 'Production',
      },
    ])

    renderWithQueryClient(
      <ControlledEnvironmentDropdown
        onEnvironmentChange={handleEnvironmentChange}
      />,
    )

    expect(
      await screen.findByRole('button', {
        name: /^Development$/,
      }),
    ).toBeInTheDocument()
    expect(handleEnvironmentChange).toHaveBeenCalledWith('env-development')

    const requestedUrl = fetchMock.mock.calls[0][0]?.toString()

    expect(new URL(requestedUrl ?? '', 'http://localhost').pathname).toBe(
      '/projects/project-1/environments',
    )
  })

  it('creates, appends, selects, and closes for a valid environment', async () => {
    const user = userEvent.setup()
    const handleEnvironmentChange = vi.fn()
    const fetchMock = vi.fn(
      async (...args: [RequestInfo | URL, RequestInit?]) => {
        const [, init] = args

        if (init?.method === 'POST') {
          return jsonResponse({
            id: 'env-staging',
            environmentName: 'Staging',
          })
        }

        return jsonResponse([
          {
            id: 'env-development',
            environmentName: 'Development',
          },
        ])
      },
    )
    vi.stubGlobal('fetch', fetchMock)

    renderWithQueryClient(
      <ControlledEnvironmentDropdown
        initialEnvironmentId="env-development"
        onEnvironmentChange={handleEnvironmentChange}
      />,
    )

    await user.click(
      await screen.findByRole('button', {
        name: /^Development$/,
      }),
    )
    await user.click(screen.getByRole('button', { name: '+ Add environment' }))
    await user.type(
      screen.getByRole('textbox', { name: 'Environment name' }),
      '  Staging  ',
    )
    await user.click(screen.getByRole('button', { name: 'Create' }))

    expect(
      await screen.findByRole('button', {
        name: /^Staging$/,
      }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(handleEnvironmentChange).toHaveBeenCalledWith('env-staging')

    const createCall = fetchMock.mock.calls.find(
      ([, init]) => init?.method === 'POST',
    )

    expect(createCall?.[1]).toEqual(
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          environmentName: 'Staging',
        }),
      }),
    )
  })

  it('recovers when the environment is persisted but the create response cannot be parsed', async () => {
    const user = userEvent.setup()
    const handleEnvironmentChange = vi.fn()
    const fetchMock = vi.fn(
      async (...args: [RequestInfo | URL, RequestInit?]) => {
        const [, init] = args

        if (init?.method === 'POST') {
          return new Response('created', { status: 201 })
        }

        if (fetchMock.mock.calls.length > 2) {
          return jsonResponse([
            {
              id: 'env-development',
              environmentName: 'Development',
            },
            {
              id: 'env-staging',
              environmentName: 'Staging',
            },
          ])
        }

        return jsonResponse([
          {
            id: 'env-development',
            environmentName: 'Development',
          },
        ])
      },
    )
    vi.stubGlobal('fetch', fetchMock)

    renderWithQueryClient(
      <ControlledEnvironmentDropdown
        initialEnvironmentId="env-development"
        onEnvironmentChange={handleEnvironmentChange}
      />,
    )

    await user.click(
      await screen.findByRole('button', {
        name: /^Development$/,
      }),
    )
    await user.click(screen.getByRole('button', { name: '+ Add environment' }))
    await user.type(
      screen.getByRole('textbox', { name: 'Environment name' }),
      'Staging',
    )
    await user.click(screen.getByRole('button', { name: 'Create' }))

    expect(
      await screen.findByRole('button', {
        name: /^Staging$/,
      }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(handleEnvironmentChange).toHaveBeenCalledWith('env-staging')
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })

  it('supports keyboard open, navigation, selection, and close', async () => {
    const user = userEvent.setup()
    mockEnvironmentFetch([
      {
        id: 'env-development',
        environmentName: 'Development',
      },
      {
        id: 'env-production',
        environmentName: 'Production',
      },
    ])

    renderWithQueryClient(
      <ControlledEnvironmentDropdown initialEnvironmentId="env-development" />,
    )

    const trigger = await screen.findByRole('button', {
      name: /^Development$/,
    })

    trigger.focus()
    await user.keyboard('{Enter}')
    expect(screen.getByRole('listbox')).toBeInTheDocument()

    await user.keyboard('{ArrowDown}{Enter}')
    expect(
      screen.getByRole('button', {
        name: /^Production$/,
      }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()

    await user.keyboard('{Enter}')
    expect(screen.getByRole('listbox')).toBeInTheDocument()

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('deletes a non-selected environment after confirmation without changing selection', async () => {
    const user = userEvent.setup()
    const handleEnvironmentChange = vi.fn()
    const fetchMock = vi.fn(
      async (...args: [RequestInfo | URL, RequestInit?]) => {
        const [, init] = args

        if (init?.method === 'DELETE') {
          return new Response(null, { status: 204 })
        }

        return jsonResponse([
          {
            id: 'env-development',
            environmentName: 'Development',
          },
          {
            id: 'env-staging',
            environmentName: 'Staging',
          },
        ])
      },
    )
    vi.stubGlobal('fetch', fetchMock)

    renderWithQueryClient(
      <ControlledEnvironmentDropdown
        initialEnvironmentId="env-development"
        onEnvironmentChange={handleEnvironmentChange}
      />,
    )

    await user.click(
      await screen.findByRole('button', {
        name: /^Development$/,
      }),
    )
    await user.click(screen.getByRole('button', { name: 'Delete Staging' }))
    await user.click(
      within(
        screen.getByRole('alertdialog', { name: 'Delete environment' }),
      ).getByRole('button', { name: 'Delete' }),
    )

    await waitFor(() => {
      expect(
        fetchMock.mock.calls.find(([, init]) => init?.method === 'DELETE'),
      ).toBeDefined()
    })
    expect(handleEnvironmentChange).not.toHaveBeenCalled()
    expect(
      screen.queryByRole('option', { name: 'Staging' }),
    ).not.toBeInTheDocument()
  })
})

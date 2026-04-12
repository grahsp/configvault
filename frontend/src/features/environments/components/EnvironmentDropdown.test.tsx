import {
  fireEvent,  render,  screen,  waitFor,  within,} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useState } from 'react'
import { EnvironmentDropdown } from './EnvironmentDropdown'

const getAccessTokenSilently = vi.fn().mockResolvedValue('test-token')

vi.mock('../../../shared/hooks/useAuth', () => ({
  useAuth: () => ({
    getAccessTokenSilently,  }),}))

afterEach(() => {
  vi.clearAllMocks()
  vi.unstubAllGlobals()
})

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: {
      'Content-Type': 'application/json',    },    status,  })
}

function mockEnvironmentFetch(body: unknown, status = 200) {
  const fetchMock = vi.fn(
    async (...args: [RequestInfo | URL, RequestInit?]) => {
      void args

      return jsonResponse(body, status)
    },  )

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
  initialEnvironmentId = '',  onEnvironmentChange = () => undefined,}: {
  initialEnvironmentId?: string
  onEnvironmentChange?: (environmentId: string) => void
}) {
  const [selectedEnvironmentId, setSelectedEnvironmentId] = useState(
    initialEnvironmentId,  )

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

describe('EnvironmentDropdown', () => {
  it('shows the loading state while environments load', async () => {
    const environmentsResponse = createDeferredResponse()
    vi.stubGlobal('fetch', vi.fn(() => environmentsResponse.response))

    render(
      <EnvironmentDropdown
        onEnvironmentChange={vi.fn()}
        projectId="project-1"
        selectedEnvironmentId=""
      />,    )

    await waitFor(() => {
      expect(
        screen.getByRole('button', {
          name: /^Loading\.\.\.$/,        }),      ).toBeDisabled()
    })

    environmentsResponse.resolve(jsonResponse([]))
  })

  it('loads environments and auto-selects the first option when none is selected', async () => {
    const handleEnvironmentChange = vi.fn()
    const fetchMock = mockEnvironmentFetch([
      {
        id: 'env-development',        environmentName: 'Development',      },      {
        id: 'env-production',        environmentName: 'Production',      },    ])

    render(
      <ControlledEnvironmentDropdown
        onEnvironmentChange={handleEnvironmentChange}
      />,    )

    expect(
      await screen.findByRole('button', {
        name: /^Development$/,      }),    ).toBeInTheDocument()
    expect(handleEnvironmentChange).toHaveBeenCalledWith('env-development')
    const requestedUrl = fetchMock.mock.calls[0][0]?.toString()

    expect(new URL(requestedUrl ?? '').pathname).toBe(
      '/projects/project-1/environments',    )
    expect(fetchMock.mock.calls[0][1]).toEqual(
      expect.objectContaining({
        headers: expect.any(Headers),      }),    )
  })

  it('renders loaded environment options and the add action', async () => {
    const user = userEvent.setup()
    mockEnvironmentFetch([
      {
        id: 'env-development',        environmentName: 'Development',      },      {
        id: 'env-production',        environmentName: 'Production',      },    ])

    render(
      <ControlledEnvironmentDropdown initialEnvironmentId="env-development" />,    )

    await user.click(
      await screen.findByRole('button', {
        name: /^Development$/,      }),    )

    const listbox = screen.getByRole('listbox')

    expect(
      within(listbox).getByRole('option', { name: 'Development' }),    ).toHaveAttribute('aria-selected', 'true')
    expect(
      within(listbox).getByRole('option', { name: 'Production' }),    ).toHaveAttribute('aria-selected', 'false')
    expect(
      within(listbox).getByRole('button', { name: '+ Add environment' }),    ).toBeInTheDocument()
  })

  it('renders an empty state and create action when no environments exist', async () => {
    const user = userEvent.setup()
    mockEnvironmentFetch([])

    render(<ControlledEnvironmentDropdown />)

    await user.click(
      await screen.findByRole('button', {
        name: /^Select environment$/,      }),    )

    expect(screen.getByText('No environments found')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: '+ Add environment' }),    ).toBeInTheDocument()
  })

  it('shows inline create controls from the add action', async () => {
    const user = userEvent.setup()
    mockEnvironmentFetch([])

    render(<ControlledEnvironmentDropdown />)

    await user.click(
      await screen.findByRole('button', {
        name: /^Select environment$/,      }),    )
    await user.click(screen.getByRole('button', { name: '+ Add environment' }))

    expect(
      screen.getByRole('textbox', { name: 'Environment name' }),    ).toHaveFocus()
    expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })

  it('rejects whitespace-only environment names before creating', async () => {
    const user = userEvent.setup()
    const fetchMock = mockEnvironmentFetch([])

    render(<ControlledEnvironmentDropdown />)

    await user.click(
      await screen.findByRole('button', {
        name: /^Select environment$/,      }),    )
    await user.click(screen.getByRole('button', { name: '+ Add environment' }))
    await user.type(screen.getByRole('textbox', { name: 'Environment name' }), '   ')
    await user.click(screen.getByRole('button', { name: 'Create' }))

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Enter an environment name.',    )
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('rejects duplicate environment names before creating', async () => {
    const user = userEvent.setup()
    const fetchMock = mockEnvironmentFetch([
      {
        id: 'env-development',        environmentName: 'Development',      },    ])

    render(
      <ControlledEnvironmentDropdown initialEnvironmentId="env-development" />,    )

    await user.click(
      await screen.findByRole('button', {
        name: /^Development$/,      }),    )
    await user.click(screen.getByRole('button', { name: '+ Add environment' }))
    await user.type(
      screen.getByRole('textbox', { name: 'Environment name' }),      'development',    )
    await user.click(screen.getByRole('button', { name: 'Create' }))

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Environment already exists.',    )
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('creates, appends, selects, and closes for a valid environment', async () => {
    const user = userEvent.setup()
    const handleEnvironmentChange = vi.fn()
    const fetchMock = vi.fn(
      async (...args: [RequestInfo | URL, RequestInit?]) => {
        const [, init] = args

        if (init?.method === 'POST') {
          return jsonResponse({
            id: 'env-staging',            environmentName: 'Staging',          })
        }

        return jsonResponse([
          {
            id: 'env-development',            environmentName: 'Development',          },        ])
      },    )
    vi.stubGlobal('fetch', fetchMock)

    render(
      <ControlledEnvironmentDropdown
        initialEnvironmentId="env-development"
        onEnvironmentChange={handleEnvironmentChange}
      />,    )

    await user.click(
      await screen.findByRole('button', {
        name: /^Development$/,      }),    )
    await user.click(screen.getByRole('button', { name: '+ Add environment' }))
    await user.type(
      screen.getByRole('textbox', { name: 'Environment name' }),      '  Staging  ',    )
    await user.click(screen.getByRole('button', { name: 'Create' }))

    expect(
      await screen.findByRole('button', {
        name: /^Staging$/,      }),    ).toBeInTheDocument()
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(handleEnvironmentChange).toHaveBeenCalledWith('env-staging')

    const createCall = fetchMock.mock.calls.find(
      ([, init]) => init?.method === 'POST',    )

    expect(createCall?.[0]?.toString()).toContain(
      '/projects/project-1/environments',    )
    expect(createCall?.[1]).toEqual(
      expect.objectContaining({
        method: 'POST',        body: JSON.stringify({
          environmentName: 'Staging',        }),      }),    )

    await user.click(screen.getByRole('button', { name: /^Staging$/ }))
    expect(screen.getByRole('option', { name: 'Staging' })).toBeInTheDocument()
  })

  it('ignores duplicate create submits while the request is pending', async () => {
    const user = userEvent.setup()
    const createResponse = createDeferredResponse()
    const fetchMock = vi.fn(
      async (...args: [RequestInfo | URL, RequestInit?]) => {
        const [, init] = args

        if (init?.method === 'POST') {
          return createResponse.response
        }

        return jsonResponse([
          {
            id: 'env-development',            environmentName: 'Development',          },        ])
      },    )
    vi.stubGlobal('fetch', fetchMock)

    render(
      <ControlledEnvironmentDropdown initialEnvironmentId="env-development" />,    )

    await user.click(
      await screen.findByRole('button', {
        name: /^Development$/,      }),    )
    await user.click(screen.getByRole('button', { name: '+ Add environment' }))
    await user.type(
      screen.getByRole('textbox', { name: 'Environment name' }),      'Staging',    )

    const createForm = screen
      .getByRole('textbox', { name: 'Environment name' })
      .closest('form')

    expect(createForm).not.toBeNull()

    fireEvent.submit(createForm as HTMLFormElement)
    fireEvent.submit(createForm as HTMLFormElement)

    await waitFor(() => {
      const createCalls = fetchMock.mock.calls.filter(
        ([, init]) => init?.method === 'POST',      )

      expect(createCalls).toHaveLength(1)
    })

    createResponse.resolve(
      jsonResponse({
        id: 'env-staging',        environmentName: 'Staging',      }),    )

    expect(
      await screen.findByRole('button', {
        name: /^Staging$/,      }),    ).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
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
              id: 'env-development',              environmentName: 'Development',            },            {
              id: 'env-staging',              environmentName: 'Staging',            },          ])
        }

        return jsonResponse([
          {
            id: 'env-development',            environmentName: 'Development',          },        ])
      },    )
    vi.stubGlobal('fetch', fetchMock)

    render(
      <ControlledEnvironmentDropdown
        initialEnvironmentId="env-development"
        onEnvironmentChange={handleEnvironmentChange}
      />,    )

    await user.click(
      await screen.findByRole('button', {
        name: /^Development$/,      }),    )
    await user.click(screen.getByRole('button', { name: '+ Add environment' }))
    await user.type(
      screen.getByRole('textbox', { name: 'Environment name' }),      'Staging',    )
    await user.click(screen.getByRole('button', { name: 'Create' }))

    expect(
      await screen.findByRole('button', {
        name: /^Staging$/,      }),    ).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(handleEnvironmentChange).toHaveBeenCalledWith('env-staging')
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })

  it('keeps create controls open and shows an error when creation fails', async () => {
    const user = userEvent.setup()
    const fetchMock = vi.fn(
      async (...args: [RequestInfo | URL, RequestInit?]) => {
        const [, init] = args

        if (init?.method === 'POST') {
          return jsonResponse({ message: 'Server error' }, 500)
        }

        return jsonResponse([])
      },    )
    vi.stubGlobal('fetch', fetchMock)

    render(<ControlledEnvironmentDropdown />)

    await user.click(
      await screen.findByRole('button', {
        name: /^Select environment$/,      }),    )
    await user.click(screen.getByRole('button', { name: '+ Add environment' }))
    await user.type(
      screen.getByRole('textbox', { name: 'Environment name' }),      'Staging',    )
    await user.click(screen.getByRole('button', { name: 'Create' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Environment could not be created.',    )
    expect(
      screen.getByRole('textbox', { name: 'Environment name' }),    ).toHaveValue('Staging')
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })

  it('selects an environment and closes after click selection', async () => {
    const user = userEvent.setup()
    const handleEnvironmentChange = vi.fn()
    mockEnvironmentFetch([
      {
        id: 'env-development',        environmentName: 'Development',      },      {
        id: 'env-production',        environmentName: 'Production',      },    ])

    render(
      <ControlledEnvironmentDropdown
        initialEnvironmentId="env-development"
        onEnvironmentChange={handleEnvironmentChange}
      />,    )

    await user.click(
      await screen.findByRole('button', {
        name: /^Development$/,      }),    )
    await user.click(screen.getByRole('option', { name: 'Production' }))

    expect(handleEnvironmentChange).toHaveBeenCalledWith('env-production')
    expect(
      screen.getByRole('button', {
        name: /^Production$/,      }),    ).toBeInTheDocument()
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('closes when clicking outside', async () => {
    const user = userEvent.setup()
    mockEnvironmentFetch([
      {
        id: 'env-development',        environmentName: 'Development',      },    ])

    render(
      <div>
        <ControlledEnvironmentDropdown initialEnvironmentId="env-development" />
        <button type="button">Outside</button>
      </div>,    )

    await user.click(
      await screen.findByRole('button', {
        name: /^Development$/,      }),    )
    expect(screen.getByRole('listbox')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Outside' }))

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('supports keyboard open, navigation, selection, and close', async () => {
    const user = userEvent.setup()
    mockEnvironmentFetch([
      {
        id: 'env-development',        environmentName: 'Development',      },      {
        id: 'env-production',        environmentName: 'Production',      },    ])

    render(
      <ControlledEnvironmentDropdown initialEnvironmentId="env-development" />,    )

    const trigger = await screen.findByRole('button', {
      name: /^Development$/,    })

    trigger.focus()
    await user.keyboard('{Enter}')
    expect(screen.getByRole('listbox')).toBeInTheDocument()

    await user.keyboard('{ArrowDown}{Enter}')
    expect(
      screen.getByRole('button', {
        name: /^Production$/,      }),    ).toBeInTheDocument()
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()

    await user.keyboard('{Enter}')
    expect(screen.getByRole('listbox')).toBeInTheDocument()

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('creates with Enter and cancels with Escape from the create input', async () => {
    const user = userEvent.setup()
    const fetchMock = vi.fn(
      async (...args: [RequestInfo | URL, RequestInit?]) => {
        const [, init] = args

        if (init?.method === 'POST') {
          return jsonResponse({
            id: 'env-staging',            environmentName: 'Staging',          })
        }

        return jsonResponse([])
      },    )
    vi.stubGlobal('fetch', fetchMock)

    render(<ControlledEnvironmentDropdown />)

    await user.click(
      await screen.findByRole('button', {
        name: /^Select environment$/,      }),    )
    await user.click(screen.getByRole('button', { name: '+ Add environment' }))
    await user.keyboard('Sandbox{Escape}')

    expect(
      screen.getByRole('button', { name: '+ Add environment' }),    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '+ Add environment' }))
    await user.keyboard('Staging{Enter}')

    expect(
      await screen.findByRole('button', {
        name: /^Staging$/,      }),    ).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('does not allow deleting the only environment', async () => {
    const user = userEvent.setup()
    const fetchMock = mockEnvironmentFetch([
      {
        id: 'env-development',        environmentName: 'Development',      },    ])

    render(
      <ControlledEnvironmentDropdown initialEnvironmentId="env-development" />,    )

    await user.click(
      await screen.findByRole('button', {
        name: /^Development$/,      }),    )

    expect(
      screen.getByRole('button', {
        name: 'Cannot delete Development because it is the only environment',      }),    ).toBeDisabled()
    expect(
      screen.queryByRole('dialog', { name: 'Delete environment' }),    ).not.toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('opens and cancels the delete environment confirmation', async () => {
    const user = userEvent.setup()
    const fetchMock = mockEnvironmentFetch([
      {
        id: 'env-development',        environmentName: 'Development',      },      {
        id: 'env-staging',        environmentName: 'Staging',      },    ])

    render(
      <ControlledEnvironmentDropdown initialEnvironmentId="env-development" />,    )

    await user.click(
      await screen.findByRole('button', {
        name: /^Development$/,      }),    )
    await user.click(screen.getByRole('button', { name: 'Delete Staging' }))

    const dialog = screen.getByRole('dialog', {
      name: 'Delete environment',    })

    expect(
      within(dialog).getByText('Delete this environment from the project?'),    ).toBeInTheDocument()
    expect(
      within(dialog).getByText(
        'Staging and its associated configuration values will be removed.',      ),    ).toBeInTheDocument()

    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }))

    expect(
      screen.queryByRole('dialog', { name: 'Delete environment' }),    ).not.toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('option', { name: 'Staging' })).toBeInTheDocument()
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
            id: 'env-development',            environmentName: 'Development',          },          {
            id: 'env-staging',            environmentName: 'Staging',          },        ])
      },    )
    vi.stubGlobal('fetch', fetchMock)

    render(
      <ControlledEnvironmentDropdown
        initialEnvironmentId="env-development"
        onEnvironmentChange={handleEnvironmentChange}
      />,    )

    await user.click(
      await screen.findByRole('button', {
        name: /^Development$/,      }),    )
    await user.click(screen.getByRole('button', { name: 'Delete Staging' }))
    await user.click(
      within(
        screen.getByRole('dialog', { name: 'Delete environment' }),      ).getByRole('button', { name: 'Delete' }),    )

    await waitFor(() => {
      expect(
        screen.queryByRole('option', { name: 'Staging' }),      ).not.toBeInTheDocument()
    })
    expect(
      screen.queryByRole('dialog', { name: 'Delete environment' }),    ).not.toBeInTheDocument()
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(
      screen.getByRole('button', {
        name: /^Development$/,      }),    ).toBeInTheDocument()
    expect(handleEnvironmentChange).not.toHaveBeenCalled()

    const deleteCall = fetchMock.mock.calls.find(
      ([, init]) => init?.method === 'DELETE',    )

    expect(deleteCall?.[0]?.toString()).toContain(
      '/projects/project-1/environments/env-staging',    )
  })

  it('selects the first remaining environment after deleting the selected environment', async () => {
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
            id: 'env-development',            environmentName: 'Development',          },          {
            id: 'env-staging',            environmentName: 'Staging',          },        ])
      },    )
    vi.stubGlobal('fetch', fetchMock)

    render(
      <ControlledEnvironmentDropdown
        initialEnvironmentId="env-staging"
        onEnvironmentChange={handleEnvironmentChange}
      />,    )

    await user.click(
      await screen.findByRole('button', {
        name: /^Staging$/,      }),    )
    await user.click(screen.getByRole('button', { name: 'Delete Staging' }))
    await user.click(
      within(
        screen.getByRole('dialog', { name: 'Delete environment' }),      ).getByRole('button', { name: 'Delete' }),    )

    expect(
      await screen.findByRole('button', {
        name: /^Development$/,      }),    ).toBeInTheDocument()
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(handleEnvironmentChange).toHaveBeenCalledWith('env-development')
  })

  it('keeps the environment and shows an error when deletion fails', async () => {
    const user = userEvent.setup()
    const fetchMock = vi.fn(
      async (...args: [RequestInfo | URL, RequestInit?]) => {
        const [, init] = args

        if (init?.method === 'DELETE') {
          return jsonResponse({ message: 'Server error' }, 500)
        }

        return jsonResponse([
          {
            id: 'env-development',            environmentName: 'Development',          },          {
            id: 'env-staging',            environmentName: 'Staging',          },        ])
      },    )
    vi.stubGlobal('fetch', fetchMock)

    render(
      <ControlledEnvironmentDropdown initialEnvironmentId="env-development" />,    )

    await user.click(
      await screen.findByRole('button', {
        name: /^Development$/,      }),    )
    await user.click(screen.getByRole('button', { name: 'Delete Staging' }))
    await user.click(
      within(
        screen.getByRole('dialog', { name: 'Delete environment' }),      ).getByRole('button', { name: 'Delete' }),    )

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Environment could not be deleted.',    )
    expect(
      screen.getByRole('dialog', { name: 'Delete environment' }),    ).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Staging' })).toBeInTheDocument()
  })
})

import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  mockFetchSequence,
  renderProjectDetail,
} from '../../projects/pages/testUtils/projectPageTestUtils'

const authMocks = vi.hoisted(() => ({
  getAccessTokenSilently: vi.fn().mockResolvedValue('test-token'),
}))

vi.mock('../../../shared/hooks/useAuth', () => ({
  useAuth: () => ({
    getAccessTokenSilently: authMocks.getAccessTokenSilently,
  }),
}))

afterEach(() => {
  vi.unstubAllGlobals()
})

function createDeferredResponse() {
  let resolve: (response: Response) => void = () => undefined
  const response = new Promise<Response>((next) => {
    resolve = next
  })

  return { response, resolve }
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: {
      'Content-Type': 'application/json',
    },
    status,
  })
}

const projectDetails = {
  id: 'project-1',
  name: 'Production secrets',
  role: 'owner',
  description: 'Credentials for production services',
  createdAt: '2025-02-01T10:00:00Z',
}

const environmentsRoute = {
  path: '/projects/project-1/environments',
  body: [],
}

describe('ProjectSecretsPage', () => {
  it('renders on the project secrets route', async () => {
    mockFetchSequence([
      {
        path: '/projects/project-1',
        body: projectDetails,
      },
      environmentsRoute,
      {
        path: '/projects/project-1/config-items',
        body: [],
      },
    ])

    renderProjectDetail('/projects/project-1/secrets')

    expect(
      await screen.findByRole('heading', { name: 'Secrets' }),
    ).toBeInTheDocument()
    expect(await screen.findByText('No secrets yet')).toBeInTheDocument()
  })

  it('shows the secrets loading state while config items load', async () => {
    const configItemsResponse = createDeferredResponse()

    mockFetchSequence([
      {
        path: '/projects/project-1',
        body: projectDetails,
      },
      environmentsRoute,
      {
        path: '/projects/project-1/config-items',
        response: configItemsResponse.response,
      },
    ])

    renderProjectDetail('/projects/project-1/secrets')

    expect(await screen.findByText('Loading secrets...')).toBeInTheDocument()
    expect(
      screen.getByText('Config item keys are being prepared.'),
    ).toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()

    configItemsResponse.resolve(jsonResponse([]))
  })

  it('opens the add secret dialog from the empty state action', async () => {
    const user = userEvent.setup()

    mockFetchSequence([
      {
        path: '/projects/project-1',
        body: projectDetails,
      },
      environmentsRoute,
      {
        path: '/projects/project-1/config-items',
        body: [],
      },
    ])

    renderProjectDetail('/projects/project-1/secrets')

    expect(await screen.findByText('No secrets yet')).toBeInTheDocument()

    await user.click(screen.getAllByRole('button', { name: 'Add Secret' })[1])

    expect(
      screen.getByRole('dialog', { name: 'Add secret' }),
    ).toBeInTheDocument()
  })

  it('shows loaded config item rows with a masked value column', async () => {
    mockFetchSequence([
      {
        path: '/projects/project-1',
        body: projectDetails,
      },
      environmentsRoute,
      {
        path: '/projects/project-1/config-items',
        body: [
          {
            id: 'config-1',
            key: 'API_KEY',
            createdAt: '2026-04-12T10:00:00.000Z',
          },
          {
            id: 'config-2',
            key: 'DATABASE_URL',
            createdAt: '2026-04-12T10:01:00.000Z',
          },
        ],
      },
    ])

    renderProjectDetail('/projects/project-1/secrets')

    const table = await screen.findByRole('table', {
      name: 'Project secrets and config items',
    })

    expect(
      within(table).getByRole('columnheader', { name: 'Key' }),
    ).toBeInTheDocument()
    expect(
      within(table).getByRole('columnheader', { name: 'Value' }),
    ).toBeInTheDocument()

    const apiKeyRow = within(table).getByRole('row', {
      name: /API_KEY \*{6} Rename Delete/,
    })
    const databaseRow = within(table).getByRole('row', {
      name: /DATABASE_URL \*{6} Rename Delete/,
    })

    expect(apiKeyRow).toBeInTheDocument()
    expect(databaseRow).toBeInTheDocument()
  })

  it('validates the create form before submitting', async () => {
    const user = userEvent.setup()

    mockFetchSequence([
      {
        path: '/projects/project-1',
        body: projectDetails,
      },
      environmentsRoute,
      {
        path: '/projects/project-1/config-items',
        body: [],
      },
    ])

    renderProjectDetail('/projects/project-1/secrets')

    await user.click(await screen.findByRole('button', { name: 'Add Secret' }))
    await user.type(screen.getByRole('textbox', { name: 'Key' }), 'API KEY')

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Key cannot contain spaces.',
    )
    expect(screen.getByRole('button', { name: 'Create' })).toBeDisabled()
  })

  it('creates a config item successfully', async () => {
    const user = userEvent.setup()
    const fetchMock = mockFetchSequence([
      {
        path: '/projects/project-1',
        body: projectDetails,
      },
      environmentsRoute,
      {
        path: '/projects/project-1/config-items',
        body: [],
      },
      {
        path: '/projects/project-1/config-items',
        method: 'POST',
        body: {
          id: 'config-1',
          key: 'API_KEY',
          createdAt: '2026-04-12T10:00:00.000Z',
        },
      },
      {
        path: '/projects/project-1/config-items',
        body: [
          {
            id: 'config-1',
            key: 'API_KEY',
            createdAt: '2026-04-12T10:00:00.000Z',
          },
        ],
      },
    ])

    renderProjectDetail('/projects/project-1/secrets')

    await user.click(await screen.findByRole('button', { name: 'Add Secret' }))
    await user.type(screen.getByRole('textbox', { name: 'Key' }), 'API_KEY')
    await user.click(screen.getByRole('button', { name: 'Create' }))

    expect(await screen.findByText('Secret created')).toBeInTheDocument()
    expect(await screen.findByRole('row', { name: /API_KEY/ })).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/projects/project-1/config-items'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ key: 'API_KEY' }),
      }),
    )
  })

  it('renames a config item successfully', async () => {
    const user = userEvent.setup()
    const fetchMock = mockFetchSequence([
      {
        path: '/projects/project-1',
        body: projectDetails,
      },
      environmentsRoute,
      {
        path: '/projects/project-1/config-items',
        body: [
          {
            id: 'config-1',
            key: 'API_KEY',
            createdAt: '2026-04-12T10:00:00.000Z',
          },
        ],
      },
      {
        path: '/projects/project-1/config-items/config-1',
        method: 'PUT',
        body: {
          id: 'config-1',
          key: 'PUBLIC_KEY',
          createdAt: '2026-04-12T10:00:00.000Z',
        },
      },
      {
        path: '/projects/project-1/config-items',
        body: [
          {
            id: 'config-1',
            key: 'PUBLIC_KEY',
            createdAt: '2026-04-12T10:00:00.000Z',
          },
        ],
      },
    ])

    renderProjectDetail('/projects/project-1/secrets')

    await user.click(
      await screen.findByRole('button', { name: 'Rename API_KEY' }),
    )
    await user.clear(screen.getByRole('textbox', { name: 'Key' }))
    await user.type(screen.getByRole('textbox', { name: 'Key' }), 'PUBLIC_KEY')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(await screen.findByText('Secret renamed')).toBeInTheDocument()
    expect(
      await screen.findByRole('row', { name: /PUBLIC_KEY/ }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('row', { name: /API_KEY/ })).not.toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/projects/project-1/config-items/config-1'),
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify({ key: 'PUBLIC_KEY' }),
      }),
    )
  })

  it('deletes a config item after confirmation', async () => {
    const user = userEvent.setup()
    const fetchMock = mockFetchSequence([
      {
        path: '/projects/project-1',
        body: projectDetails,
      },
      environmentsRoute,
      {
        path: '/projects/project-1/config-items',
        body: [
          {
            id: 'config-1',
            key: 'API_KEY',
            createdAt: '2026-04-12T10:00:00.000Z',
          },
        ],
      },
      {
        path: '/projects/project-1/config-items/config-1',
        method: 'DELETE',
        status: 204,
      },
      {
        path: '/projects/project-1/config-items',
        body: [],
      },
    ])

    renderProjectDetail('/projects/project-1/secrets')

    await user.click(
      await screen.findByRole('button', { name: 'Delete API_KEY' }),
    )

    expect(
      screen.getByRole('dialog', { name: 'Delete secret?' }),
    ).toHaveTextContent('API_KEY')

    await user.click(screen.getByRole('button', { name: 'Delete' }))

    expect(await screen.findByText('Secret deleted')).toBeInTheDocument()
    expect(await screen.findByText('No secrets yet')).toBeInTheDocument()
    expect(screen.queryByRole('row', { name: /API_KEY/ })).not.toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/projects/project-1/config-items/config-1'),
      expect.objectContaining({
        method: 'DELETE',
      }),
    )
  })

  it('shows mutation error feedback', async () => {
    const user = userEvent.setup()

    mockFetchSequence([
      {
        path: '/projects/project-1',
        body: projectDetails,
      },
      environmentsRoute,
      {
        path: '/projects/project-1/config-items',
        body: [],
      },
      {
        path: '/projects/project-1/config-items',
        method: 'POST',
        body: { message: 'Create rejected.' },
        status: 500,
      },
    ])

    renderProjectDetail('/projects/project-1/secrets')

    await user.click(await screen.findByRole('button', { name: 'Add Secret' }))
    await user.type(screen.getByRole('textbox', { name: 'Key' }), 'API_KEY')
    await user.click(screen.getByRole('button', { name: 'Create' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Create rejected.',
    )
    expect(
      screen.getByRole('dialog', { name: 'Add secret' }),
    ).toBeInTheDocument()
  })
})

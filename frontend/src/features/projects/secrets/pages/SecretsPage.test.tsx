import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  mockFetchSequence,
  renderProjectDetail,
} from '../../pages/ProjectDetailPage/ProjectDetailPage.testUtils.tsx'

const authMocks = vi.hoisted(() => ({
  getAccessTokenSilently: vi.fn().mockResolvedValue('test-token'),
}))

vi.mock('../../../../shared/hooks/useAuth', () => ({
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

function getBulkSaveCalls(fetchMock: ReturnType<typeof vi.fn>) {
  return fetchMock.mock.calls.filter(
    ([input, init]) =>
      input.toString().includes('/config-items/operations') &&
      !input.toString().includes('/value') &&
      init?.method === 'POST',
  )
}

function getValueEndpointCalls(fetchMock: ReturnType<typeof vi.fn>) {
  return fetchMock.mock.calls.filter(([input]) =>
    input.toString().includes('/value?'),
  )
}

function getImportCalls(fetchMock: ReturnType<typeof vi.fn>) {
  return fetchMock.mock.calls.filter(
    ([input, init]) =>
      input.toString().includes('/import?') && init?.method === 'POST',
  )
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
  body: [
    {
      id: 'environment-1',
      environmentName: 'production',
    },
  ],
}

const apiKeySecret = {
  id: 'config-1',
  key: 'API_KEY',
  hasValue: true,
}

const publicKeySecret = {
  ...apiKeySecret,
  key: 'PUBLIC_KEY',
}

describe('SecretsPage', () => {
  it('renders on the project secrets route', async () => {
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
    ])

    renderProjectDetail('/projects/project-1/secrets')

    expect(
      await screen.findByRole('heading', { name: 'Environment Variables' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Environment', { selector: 'span' }),
    ).toBeInTheDocument()
    expect(
      screen
        .getByRole('heading', { name: 'Environment Variables' })
        .closest('section'),
    ).not.toContainElement(screen.getByText('Environment', { selector: 'span' }))
    expect(await screen.findByText('No secrets yet')).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining(
        '/projects/project-1/config-items?environment=production',
      ),
      expect.any(Object),
    )
  })

  it('shows the secrets loading state while secrets load', async () => {
    const secretsResponse = createDeferredResponse()

    mockFetchSequence([
      {
        path: '/projects/project-1',
        body: projectDetails,
      },
      environmentsRoute,
      {
        path: '/projects/project-1/config-items',
        response: secretsResponse.response,
      },
    ])

    renderProjectDetail('/projects/project-1/secrets')

    expect(await screen.findByText('Loading secrets...')).toBeInTheDocument()
    expect(
      screen.getByText('Config item keys are being prepared.'),
    ).toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()

    secretsResponse.resolve(jsonResponse([]))
  })

  it('adds an empty editable secret row from the empty state action', async () => {
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

    await user.click(screen.getByRole('button', { name: 'Add Secret' }))

    expect(screen.getByRole('textbox', { name: 'Key' })).toHaveValue('')
    expect(screen.getByRole('textbox', { name: 'Key' })).toHaveFocus()
    expect(screen.getByRole('button', { name: 'Save Changes' })).toBeInTheDocument()
  })

  it('imports pasted .env data from the empty state', async () => {
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
        method: 'POST',
        path: '/projects/project-1/import',
        status: 204,
      },
      {
        path: '/projects/project-1/config-items',
        body: [apiKeySecret],
      },
    ])

    renderProjectDetail('/projects/project-1/secrets')

    await user.click(await screen.findByRole('button', { name: 'Import .env' }))
    await user.type(
      screen.getByRole('textbox', { name: '.env content' }),
      'API_KEY=secret-value{enter}DATABASE_URL=postgres://localhost',
    )
    await user.click(screen.getByRole('button', { name: 'Import' }))

    expect(await screen.findByText('Secrets imported')).toBeInTheDocument()
    expect(await screen.findByRole('row', { name: /Key API_KEY/ })).toBeInTheDocument()

    const importCalls = getImportCalls(fetchMock)
    expect(importCalls).toHaveLength(1)
    expect(importCalls[0]?.[0].toString()).toContain(
      '/projects/project-1/import?environment=production',
    )
    expect(importCalls[0]?.[1]).toMatchObject({
      method: 'POST',
      headers: expect.any(Headers),
      body: 'API_KEY=secret-value\nDATABASE_URL=postgres://localhost',
    })
    expect(
      (importCalls[0]?.[1]?.headers as Headers).get('Content-Type'),
    ).toBe('text/plain')
  })

  it('clears unsaved edits after importing while editing', async () => {
    const user = userEvent.setup()

    mockFetchSequence([
      {
        path: '/projects/project-1',
        body: projectDetails,
      },
      environmentsRoute,
      {
        path: '/projects/project-1/config-items',
        body: [apiKeySecret],
      },
      {
        method: 'POST',
        path: '/projects/project-1/import',
        status: 204,
      },
      {
        path: '/projects/project-1/config-items',
        body: [
          apiKeySecret,
          {
            id: 'config-2',
            key: 'DATABASE_URL',
            hasValue: true,
          },
        ],
      },
    ])

    renderProjectDetail('/projects/project-1/secrets')

    await user.click(await screen.findByRole('button', { name: 'Edit' }))
    await user.click(screen.getByRole('button', { name: 'Add Secret' }))
    expect(screen.getByRole('button', { name: 'Save Changes' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Import .env' }))
    expect(
      screen.getByText('Unsaved edits in the table will be cleared after import.'),
    ).toBeInTheDocument()
    await user.type(
      screen.getByRole('textbox', { name: '.env content' }),
      'DATABASE_URL=postgres://localhost',
    )
    await user.click(screen.getByRole('button', { name: 'Import' }))

    expect(await screen.findByText('Secrets imported')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Save Changes' })).not.toBeInTheDocument()
    expect(
      await screen.findByRole('row', { name: /Key DATABASE_URL/ }),
    ).toBeInTheDocument()
  })

  it('shows an import error toast when the import request fails', async () => {
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
        method: 'POST',
        path: '/projects/project-1/import',
        body: {
          title: 'Import failed',
          detail: 'Invalid line: foo',
          status: 400,
        },
        status: 400,
      },
    ])

    renderProjectDetail('/projects/project-1/secrets')

    await user.click(await screen.findByRole('button', { name: 'Import .env' }))
    await user.type(screen.getByRole('textbox', { name: '.env content' }), 'foo')
    await user.click(screen.getByRole('button', { name: 'Import' }))

    expect(await screen.findByText('Invalid line: foo')).toBeInTheDocument()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
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
            hasValue: true,
          },
          {
            id: 'config-2',
            key: 'DATABASE_URL',
            hasValue: false,
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
      name: /Key API_KEY Value\*{12} Reveal/,
    })
    const databaseRow = within(table).getByRole('row', {
      name: /Key DATABASE_URL Value\(empty\)/,
    })

    expect(apiKeyRow).toBeInTheDocument()
    expect(databaseRow).toBeInTheDocument()
  })

  it('highlights a missing key when saving a new empty item', async () => {
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
    const keyInput = screen.getByRole('textbox', { name: 'Key' })
    await user.click(screen.getByRole('button', { name: 'Save Changes' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Key is required.')
    expect(keyInput).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByRole('button', { name: 'Save Changes' })).toBeInTheDocument()
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
        path: '/projects/project-1/config-items/operations',
        method: 'POST',
        status: 204,
      },
      {
        path: '/projects/project-1/config-items',
        body: [
          {
            id: 'config-1',
            key: 'API_KEY',
            hasValue: false,
          },
        ],
      },
    ])

    renderProjectDetail('/projects/project-1/secrets')

    await user.click(await screen.findByRole('button', { name: 'Add Secret' }))
    await user.type(screen.getByRole('textbox', { name: 'Key' }), 'API_KEY')
    await user.click(screen.getByRole('button', { name: 'Save Changes' }))

    expect(await screen.findByText('Secret created')).toBeInTheDocument()
    expect(await screen.findByRole('row', { name: /API_KEY/ })).toBeInTheDocument()
    expect(getBulkSaveCalls(fetchMock)).toHaveLength(1)
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/projects/project-1/config-items/operations'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          environment: 'production',
          operations: [{ type: 'create', key: 'API_KEY' }],
        }),
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
        body: [apiKeySecret],
      },
      {
        path: '/projects/project-1/config-items/operations',
        method: 'POST',
        status: 204,
      },
      {
        path: '/projects/project-1/config-items',
        body: [publicKeySecret],
      },
    ])

    renderProjectDetail('/projects/project-1/secrets')

    await user.click(await screen.findByRole('button', { name: 'Edit' }))
    await user.clear(screen.getByRole('textbox', { name: 'Key' }))
    await user.type(screen.getByRole('textbox', { name: 'Key' }), 'PUBLIC_KEY')
    await user.click(screen.getByRole('button', { name: 'Save Changes' }))

    expect(await screen.findByText('Secret renamed')).toBeInTheDocument()
    expect(
      await screen.findByRole('row', { name: /PUBLIC_KEY/ }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('row', { name: /API_KEY/ })).not.toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/projects/project-1/config-items/operations'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          environment: 'production',
          operations: [
            { type: 'rename', secretId: 'config-1', key: 'PUBLIC_KEY' },
          ],
        }),
      }),
    )
  })

  it('toggles a revealed config item value without fetching twice', async () => {
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
          apiKeySecret,
          {
            id: 'config-2',
            key: 'DATABASE_URL',
            hasValue: true,
          },
        ],
      },
      {
        path: '/projects/project-1/config-items/config-1/value',
        body: { value: 'secret-value' },
      },
    ])

    renderProjectDetail('/projects/project-1/secrets')

    await user.click(await screen.findByRole('button', { name: /Reveal API_KEY/ }))
    expect(await screen.findByDisplayValue('secret-value')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Hide API_KEY/ }))
    expect(screen.queryByDisplayValue('secret-value')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Reveal API_KEY/ }))
    expect(await screen.findByDisplayValue('secret-value')).toBeInTheDocument()
    expect(getValueEndpointCalls(fetchMock)).toHaveLength(1)
  })
})

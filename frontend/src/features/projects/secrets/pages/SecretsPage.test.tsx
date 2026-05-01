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
      input.toString().includes('/secrets/operations') &&
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
        path: '/projects/project-1/secrets',
        body: [],
      },
    ])

    renderProjectDetail('/projects/project-1/secrets')

    expect(
      await screen.findByRole('heading', { name: 'Secrets' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Environment', { selector: 'span' }),
    ).toBeInTheDocument()
    expect(
      screen
        .getByRole('heading', { name: 'Secrets' })
        .closest('section'),
    ).not.toContainElement(screen.getByText('Environment', { selector: 'span' }))
    expect(await screen.findByText('No secrets yet')).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining(
        '/projects/project-1/secrets?environment=production',
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
        path: '/projects/project-1/secrets',
        response: secretsResponse.response,
      },
    ])

    renderProjectDetail('/projects/project-1/secrets')

    expect(await screen.findByText('Loading secrets...')).toBeInTheDocument()
    expect(
      screen.getByText('Secrets are being prepared.'),
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
        path: '/projects/project-1/secrets',
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
        path: '/projects/project-1/secrets',
        body: [],
      },
      {
        method: 'POST',
        path: '/projects/project-1/import',
        status: 204,
      },
      {
        path: '/projects/project-1/secrets',
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
        path: '/projects/project-1/secrets',
        body: [apiKeySecret],
      },
      {
        method: 'POST',
        path: '/projects/project-1/import',
        status: 204,
      },
      {
        path: '/projects/project-1/secrets',
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

    await user.click(await screen.findByRole('button', { name: 'Add Secret' }))
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
        path: '/projects/project-1/secrets',
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

  it('shows loaded secret rows with a masked value column', async () => {
    mockFetchSequence([
      {
        path: '/projects/project-1',
        body: projectDetails,
      },
      environmentsRoute,
      {
        path: '/projects/project-1/secrets',
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
      name: 'Project secrets',
    })

    expect(
      within(table).getByRole('columnheader', { name: 'Key' }),
    ).toBeInTheDocument()
    expect(
      within(table).getByRole('columnheader', { name: 'Value' }),
    ).toBeInTheDocument()

    const apiKeyRow = within(table).getByRole('row', {
      name: /Key API_KEY Value\*{12} Reveal .*Delete API_KEY/,
    })
    const databaseRow = within(table).getByRole('row', {
      name: /Key DATABASE_URL Value Delete DATABASE_URL/,
    })

    expect(apiKeyRow).toBeInTheDocument()
    expect(databaseRow).toBeInTheDocument()
  })

  it('removes the edit button and lets existing rows be edited immediately', async () => {
    const user = userEvent.setup()

    mockFetchSequence([
      {
        path: '/projects/project-1',
        body: projectDetails,
      },
      environmentsRoute,
      {
        path: '/projects/project-1/secrets',
        body: [apiKeySecret],
      },
    ])

    renderProjectDetail('/projects/project-1/secrets')

    const keyInput = await screen.findByRole('textbox', { name: 'Key' })
    expect(screen.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Save Changes' })).not.toBeInTheDocument()
    expect(keyInput).toHaveValue('API_KEY')

    await user.clear(keyInput)
    await user.type(keyInput, 'PUBLIC_KEY')

    expect(screen.getByRole('button', { name: 'Save Changes' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
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
        path: '/projects/project-1/secrets',
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

  it('creates a secret successfully', async () => {
    const user = userEvent.setup()
    const fetchMock = mockFetchSequence([
      {
        path: '/projects/project-1',
        body: projectDetails,
      },
      environmentsRoute,
      {
        path: '/projects/project-1/secrets',
        body: [],
      },
      {
        path: '/projects/project-1/secrets/operations',
        method: 'POST',
        status: 204,
      },
      {
        path: '/projects/project-1/secrets',
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
      expect.stringContaining('/projects/project-1/secrets/operations'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          environment: 'production',
          operations: [{ type: 'create', key: 'API_KEY' }],
        }),
      }),
    )
  })

  it('renames a secret successfully', async () => {
    const user = userEvent.setup()
    const fetchMock = mockFetchSequence([
      {
        path: '/projects/project-1',
        body: projectDetails,
      },
      environmentsRoute,
      {
        path: '/projects/project-1/secrets',
        body: [apiKeySecret],
      },
      {
        path: '/projects/project-1/secrets/operations',
        method: 'POST',
        status: 204,
      },
      {
        path: '/projects/project-1/secrets',
        body: [publicKeySecret],
      },
    ])

    renderProjectDetail('/projects/project-1/secrets')

    const keyInput = await screen.findByRole('textbox', { name: 'Key' })
    await user.clear(keyInput)
    await user.type(keyInput, 'PUBLIC_KEY')
    await user.click(screen.getByRole('button', { name: 'Save Changes' }))

    expect(await screen.findByText('Secret renamed')).toBeInTheDocument()
    expect(
      await screen.findByRole('row', { name: /PUBLIC_KEY/ }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('row', { name: /API_KEY/ })).not.toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/projects/project-1/secrets/operations'),
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

  it('cancels direct edits and unsaved new rows back to the last loaded state', async () => {
    const user = userEvent.setup()

    mockFetchSequence([
      {
        path: '/projects/project-1',
        body: projectDetails,
      },
      environmentsRoute,
      {
        path: '/projects/project-1/secrets',
        body: [apiKeySecret],
      },
    ])

    renderProjectDetail('/projects/project-1/secrets')

    const keyInput = await screen.findByRole('textbox', { name: 'Key' })
    await user.clear(keyInput)
    await user.type(keyInput, 'PUBLIC_KEY')
    await user.click(screen.getByRole('button', { name: 'Add Secret' }))

    const keyInputs = screen.getAllByRole('textbox', { name: 'Key' })
    expect(keyInputs[0]).toHaveValue('')
    expect(keyInputs[1]).toHaveValue('PUBLIC_KEY')
    await user.type(keyInputs[0]!, 'DATABASE_URL')
    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(screen.getByRole('textbox', { name: 'Key' })).toHaveValue('API_KEY')
    expect(screen.queryByDisplayValue('PUBLIC_KEY')).not.toBeInTheDocument()
    expect(screen.queryByDisplayValue('DATABASE_URL')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Save Changes' })).not.toBeInTheDocument()
  })

  it('renders newly added secrets above existing rows', async () => {
    const user = userEvent.setup()

    mockFetchSequence([
      {
        path: '/projects/project-1',
        body: projectDetails,
      },
      environmentsRoute,
      {
        path: '/projects/project-1/secrets',
        body: [apiKeySecret],
      },
    ])

    renderProjectDetail('/projects/project-1/secrets')

    await user.click(await screen.findByRole('button', { name: 'Add Secret' }))

    const keyInputs = screen.getAllByRole('textbox', { name: 'Key' })
    expect(keyInputs[0]).toHaveValue('')
    expect(keyInputs[1]).toHaveValue('API_KEY')
  })

  it('shows dirty actions after deleting an existing row and hides them after cancel', async () => {
    const user = userEvent.setup()

    mockFetchSequence([
      {
        path: '/projects/project-1',
        body: projectDetails,
      },
      environmentsRoute,
      {
        path: '/projects/project-1/secrets',
        body: [apiKeySecret],
      },
    ])

    renderProjectDetail('/projects/project-1/secrets')

    expect(screen.queryByRole('button', { name: 'Save Changes' })).not.toBeInTheDocument()
    await user.click(await screen.findByRole('button', { name: 'Delete API_KEY' }))
    expect(screen.getByRole('button', { name: 'Save Changes' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.queryByRole('button', { name: 'Save Changes' })).not.toBeInTheDocument()
  })

  it('cancels direct edits with Escape', async () => {
    const user = userEvent.setup()

    mockFetchSequence([
      {
        path: '/projects/project-1',
        body: projectDetails,
      },
      environmentsRoute,
      {
        path: '/projects/project-1/secrets',
        body: [apiKeySecret],
      },
    ])

    renderProjectDetail('/projects/project-1/secrets')

    const keyInput = await screen.findByRole('textbox', { name: 'Key' })
    await user.clear(keyInput)
    await user.type(keyInput, 'PUBLIC_KEY')
    await user.keyboard('{Escape}')

    expect(screen.getByRole('textbox', { name: 'Key' })).toHaveValue('API_KEY')
    expect(screen.queryByRole('button', { name: 'Save Changes' })).not.toBeInTheDocument()
  })

  it('saves direct edits with Enter', async () => {
    const user = userEvent.setup()
    const fetchMock = mockFetchSequence([
      {
        path: '/projects/project-1',
        body: projectDetails,
      },
      environmentsRoute,
      {
        path: '/projects/project-1/secrets',
        body: [apiKeySecret],
      },
      {
        path: '/projects/project-1/secrets/operations',
        method: 'POST',
        status: 204,
      },
      {
        path: '/projects/project-1/secrets',
        body: [publicKeySecret],
      },
    ])

    renderProjectDetail('/projects/project-1/secrets')

    const keyInput = await screen.findByRole('textbox', { name: 'Key' })
    await user.clear(keyInput)
    await user.type(keyInput, 'PUBLIC_KEY{Enter}')

    expect(await screen.findByText('Secret renamed')).toBeInTheDocument()
    expect(getBulkSaveCalls(fetchMock)).toHaveLength(1)
  })

  it('reveals an existing value for edit once and reuses the cached value on the next edit', async () => {
    const user = userEvent.setup()
    const fetchMock = mockFetchSequence([
      {
        path: '/projects/project-1',
        body: projectDetails,
      },
      environmentsRoute,
      {
        path: '/projects/project-1/secrets',
        body: [apiKeySecret],
      },
      {
        path: '/projects/project-1/secrets/config-1/value',
        body: { value: 'secret-value' },
      },
    ])

    renderProjectDetail('/projects/project-1/secrets')

    const valueInput = (await screen.findAllByRole('textbox', { name: 'Value' }))[0]
    await user.click(valueInput!)
    expect(await screen.findByDisplayValue('secret-value')).toBeInTheDocument()

    await user.keyboard('{Escape}')
    expect(screen.queryByDisplayValue('secret-value')).not.toBeInTheDocument()

    await user.click(screen.getAllByRole('textbox', { name: 'Value' })[0]!)
    expect(await screen.findByDisplayValue('secret-value')).toBeInTheDocument()
    expect(getValueEndpointCalls(fetchMock)).toHaveLength(1)
  })

  it('toggles a revealed secret value without fetching twice', async () => {
    const user = userEvent.setup()
    const fetchMock = mockFetchSequence([
      {
        path: '/projects/project-1',
        body: projectDetails,
      },
      environmentsRoute,
      {
        path: '/projects/project-1/secrets',
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
        path: '/projects/project-1/secrets/config-1/value',
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

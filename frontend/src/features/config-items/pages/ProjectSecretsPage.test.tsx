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

function getMutationCalls(fetchMock: ReturnType<typeof vi.fn>, method: string) {
  return fetchMock.mock.calls.filter(([, init]) => init?.method === method)
}

function getBulkSaveCalls(fetchMock: ReturnType<typeof vi.fn>) {
  return fetchMock.mock.calls.filter(
    ([input, init]) =>
      input.toString().includes('/config-items') &&
      !input.toString().includes('/value') &&
      init?.method === 'PUT',
  )
}

function getValueEndpointCalls(fetchMock: ReturnType<typeof vi.fn>) {
  return fetchMock.mock.calls.filter(([input]) =>
    input.toString().includes('/value?'),
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

const apiKeyConfigItem = {
  id: 'config-1',
  key: 'API_KEY',
  hasValue: true,
}

const publicKeyConfigItem = {
  ...apiKeyConfigItem,
  key: 'PUBLIC_KEY',
}

describe('ProjectSecretsPage', () => {
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

    await user.click(screen.getByRole('button', { name: 'Add Secret' }))

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
        body: [apiKeyConfigItem],
      },
      {
        path: '/projects/project-1/config-items',
        method: 'PUT',
        status: 204,
      },
      {
        path: '/projects/project-1/config-items',
        body: [publicKeyConfigItem],
      },
    ])

    renderProjectDetail('/projects/project-1/secrets')

    await user.click(await screen.findByRole('button', { name: 'Edit' }))
    expect(screen.queryByRole('dialog', { name: 'Rename secret' })).not.toBeInTheDocument()
    await user.clear(screen.getByRole('textbox', { name: 'Key' }))
    await user.type(screen.getByRole('textbox', { name: 'Key' }), 'PUBLIC_KEY')
    await user.click(screen.getByRole('button', { name: 'Save Changes' }))

    expect(await screen.findByText('Secret renamed')).toBeInTheDocument()
    expect(
      await screen.findByRole('row', { name: /PUBLIC_KEY/ }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('row', { name: /API_KEY/ })).not.toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/projects/project-1/config-items'),
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify({
          environment: 'production',
          updates: [{ configItemId: 'config-1', key: 'PUBLIC_KEY' }],
          deleteConfigItemIds: [],
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
          apiKeyConfigItem,
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

    await user.click(
      await screen.findByRole('button', { name: 'Reveal API_KEY' }),
    )

    expect(
      await screen.findByRole('row', {
        name: /Key API_KEY Valuesecret-value Hide/,
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('row', {
        name: /Key DATABASE_URL Value\*{12} Reveal/,
      }),
    ).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining(
        '/projects/project-1/config-items/config-1/value?environment=production',
      ),
      expect.any(Object),
    )
    expect(getValueEndpointCalls(fetchMock)).toHaveLength(1)

    await user.click(screen.getByRole('button', { name: 'Hide API_KEY' }))

    expect(
      screen.getByRole('row', {
        name: /Key API_KEY Value\*{12} Reveal/,
      }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Reveal API_KEY' }))

    expect(
      screen.getByRole('row', {
        name: /Key API_KEY Valuesecret-value Hide/,
      }),
    ).toBeInTheDocument()
    expect(getValueEndpointCalls(fetchMock)).toHaveLength(1)
  })

  it('clears revealed values and loads a new list when the environment changes', async () => {
    const user = userEvent.setup()
    const fetchMock = mockFetchSequence([
      {
        path: '/projects/project-1',
        body: projectDetails,
      },
      {
        path: '/projects/project-1/environments',
        body: [
          {
            id: 'environment-1',
            environmentName: 'production',
          },
          {
            id: 'environment-2',
            environmentName: 'staging',
          },
        ],
      },
      {
        path: '/projects/project-1/config-items',
        body: [apiKeyConfigItem],
      },
      {
        path: '/projects/project-1/config-items/config-1/value',
        body: { value: 'production-secret-value' },
      },
      {
        path: '/projects/project-1/config-items',
        body: [apiKeyConfigItem],
      },
    ])

    renderProjectDetail('/projects/project-1/secrets')

    await user.click(
      await screen.findByRole('button', { name: 'Reveal API_KEY' }),
    )

    expect(
      await screen.findByRole('row', {
        name: /Key API_KEY Valueproduction-secret-value Hide/,
      }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /^production$/ }))
    await user.click(screen.getByRole('option', { name: 'staging' }))

    expect(
      await screen.findByRole('button', { name: /^staging$/ }),
    ).toBeInTheDocument()
    expect(
      await screen.findByRole('row', {
        name: /Key API_KEY Value\*{12} Reveal/,
      }),
    ).toBeInTheDocument()
    expect(screen.queryByText('production-secret-value')).not.toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining(
        '/projects/project-1/config-items?environment=staging',
      ),
      expect.any(Object),
    )
    expect(getValueEndpointCalls(fetchMock)).toHaveLength(1)
  })

  it('enters and cancels section edit mode for config item keys and values', async () => {
    const user = userEvent.setup()
    const fetchMock = mockFetchSequence([
      {
        path: '/projects/project-1',
        body: projectDetails,
      },
      environmentsRoute,
      {
        path: '/projects/project-1/config-items',
        body: [apiKeyConfigItem],
      },
      {
        path: '/projects/project-1/config-items/config-1/value',
        body: { value: 'secret-value' },
      },
    ])

    renderProjectDetail('/projects/project-1/secrets')

    await user.click(await screen.findByRole('button', { name: 'Edit' }))

    const keyInput = screen.getByRole('textbox', { name: 'Key' })
    const valueInput = screen.getByRole('textbox', { name: 'Value' })

    expect(keyInput).toHaveValue('API_KEY')
    expect(valueInput).toHaveValue('************')
    expect(
      screen.getByRole('button', { name: 'Save Changes' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reveal API_KEY' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Delete API_KEY' })).toBeInTheDocument()
    expect(getValueEndpointCalls(fetchMock)).toHaveLength(0)

    await user.click(valueInput)

    expect(await screen.findByDisplayValue('secret-value')).toHaveFocus()
    expect(screen.getByRole('textbox', { name: 'Value' })).toHaveValue('secret-value')
    expect(screen.getByRole('textbox', { name: 'Value' })).toHaveProperty(
      'selectionStart',
      'secret-value'.length,
    )
    expect(getValueEndpointCalls(fetchMock)).toHaveLength(1)

    await user.clear(keyInput)
    await user.type(keyInput, 'PUBLIC_KEY')
    await user.type(valueInput, 'draft-value')
    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(screen.getByRole('textbox', { name: 'Key' })).toBeDisabled()
    expect(screen.getByRole('textbox', { name: 'Value' })).toBeDisabled()
    expect(screen.getByRole('textbox', { name: 'Key' })).toHaveValue('API_KEY')
    expect(screen.getByRole('textbox', { name: 'Value' })).toHaveValue('************')
    expect(screen.getByRole('row', { name: /API_KEY/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Delete API_KEY' })).not.toBeInTheDocument()
  })

  it('saves only a config item value when the key is unchanged', async () => {
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
            hasValue: false,
          },
        ],
      },
      {
        path: '/projects/project-1/config-items',
        method: 'PUT',
        status: 204,
      },
      {
        path: '/projects/project-1/config-items',
        body: [
          {
            id: 'config-1',
            key: 'API_KEY',
            hasValue: true,
          },
        ],
      },
    ])

    renderProjectDetail('/projects/project-1/secrets')

    await user.click(await screen.findByRole('button', { name: 'Edit' }))

    const valueInput = screen.getByRole('textbox', { name: 'Value' })

    await user.type(valueInput, 'new-secret-value')
    await user.click(screen.getByRole('button', { name: 'Save Changes' }))

    expect(await screen.findByText('Secret value saved')).toBeInTheDocument()
    expect(
      await screen.findByRole('row', {
        name: /Key API_KEY Value\*{12} Reveal/,
      }),
    ).toBeInTheDocument()
    expect(getBulkSaveCalls(fetchMock)).toHaveLength(1)
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/projects/project-1/config-items'),
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify({
          environment: 'production',
          updates: [{ configItemId: 'config-1', value: 'new-secret-value' }],
          deleteConfigItemIds: [],
        }),
      }),
    )
  })

  it('saves key and value changes from the same edit action', async () => {
    const user = userEvent.setup()
    const fetchMock = mockFetchSequence([
      {
        path: '/projects/project-1',
        body: projectDetails,
      },
      environmentsRoute,
      {
        path: '/projects/project-1/config-items',
        body: [apiKeyConfigItem],
      },
      {
        path: '/projects/project-1/config-items/config-1/value',
        body: { value: 'secret-value' },
      },
      {
        path: '/projects/project-1/config-items',
        method: 'PUT',
        status: 204,
      },
      {
        path: '/projects/project-1/config-items',
        body: [
          {
            ...publicKeyConfigItem,
            hasValue: true,
          },
        ],
      },
    ])

    renderProjectDetail('/projects/project-1/secrets')

    await user.click(await screen.findByRole('button', { name: 'Edit' }))
    await user.clear(screen.getByRole('textbox', { name: 'Key' }))
    await user.type(screen.getByRole('textbox', { name: 'Key' }), 'PUBLIC_KEY')
    await user.click(screen.getByRole('textbox', { name: 'Value' }))
    await screen.findByDisplayValue('secret-value')
    await user.clear(screen.getByRole('textbox', { name: 'Value' }))
    await user.type(screen.getByRole('textbox', { name: 'Value' }), 'new-value')
    await user.click(screen.getByRole('button', { name: 'Save Changes' }))

    expect(await screen.findByText('Secret updated')).toBeInTheDocument()
    expect(getBulkSaveCalls(fetchMock)).toHaveLength(1)
  })

  it('saves a value change for one item and a deletion for another in the same edit action', async () => {
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
          apiKeyConfigItem,
          {
            id: 'config-2',
            key: 'DATABASE_URL',
            hasValue: false,
          },
        ],
      },
      {
        path: '/projects/project-1/config-items',
        method: 'PUT',
        status: 204,
      },
      {
        path: '/projects/project-1/config-items',
        body: [
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
    await user.click(screen.getByRole('button', { name: 'Delete API_KEY' }))
    await user.type(
      screen.getAllByRole('textbox', { name: 'Value' })[1],
      'new-database-value',
    )
    await user.click(screen.getByRole('button', { name: 'Save Changes' }))

    expect(await screen.findByText('Secrets updated')).toBeInTheDocument()
    expect(getBulkSaveCalls(fetchMock)).toHaveLength(1)
    expect(screen.queryByRole('row', { name: /API_KEY/ })).not.toBeInTheDocument()
    expect(
      await screen.findByRole('row', { name: /DATABASE_URL/ }),
    ).toBeInTheDocument()
  })

  it('disables inline rename save for empty and space-containing keys', async () => {
    const user = userEvent.setup()

    mockFetchSequence([
      {
        path: '/projects/project-1',
        body: projectDetails,
      },
      environmentsRoute,
      {
        path: '/projects/project-1/config-items',
        body: [apiKeyConfigItem],
      },
    ])

    renderProjectDetail('/projects/project-1/secrets')

    await user.click(await screen.findByRole('button', { name: 'Edit' }))

    const keyInput = screen.getByRole('textbox', { name: 'Key' })

    await user.clear(keyInput)

    expect(screen.getByRole('button', { name: 'Save Changes' })).toBeDisabled()

    await user.type(keyInput, 'API KEY')

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Key cannot contain spaces.',
    )
    expect(screen.getByRole('button', { name: 'Save Changes' })).toBeDisabled()
  })

  it('exits inline rename without saving unchanged keys', async () => {
    const user = userEvent.setup()
    const fetchMock = mockFetchSequence([
      {
        path: '/projects/project-1',
        body: projectDetails,
      },
      environmentsRoute,
      {
        path: '/projects/project-1/config-items',
        body: [apiKeyConfigItem],
      },
    ])

    renderProjectDetail('/projects/project-1/secrets')

    await user.click(await screen.findByRole('button', { name: 'Edit' }))
    await user.click(screen.getByRole('button', { name: 'Save Changes' }))

    expect(screen.getByRole('textbox', { name: 'Key' })).toBeDisabled()
    expect(screen.getByRole('textbox', { name: 'Key' })).toHaveValue('API_KEY')
    expect(screen.getByRole('row', { name: /API_KEY/ })).toBeInTheDocument()
    expect(getBulkSaveCalls(fetchMock)).toHaveLength(0)
  })

  it('shows rename API failures and keeps section edit mode open', async () => {
    const user = userEvent.setup()

    mockFetchSequence([
      {
        path: '/projects/project-1',
        body: projectDetails,
      },
      environmentsRoute,
      {
        path: '/projects/project-1/config-items',
        body: [apiKeyConfigItem],
      },
      {
        path: '/projects/project-1/config-items',
        method: 'PUT',
        body: { message: 'Rename rejected.' },
        status: 500,
      },
    ])

    renderProjectDetail('/projects/project-1/secrets')

    await user.click(await screen.findByRole('button', { name: 'Edit' }))
    await user.clear(screen.getByRole('textbox', { name: 'Key' }))
    await user.type(screen.getByRole('textbox', { name: 'Key' }), 'PUBLIC_KEY')
    await user.click(screen.getByRole('button', { name: 'Save Changes' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Rename rejected.',
    )
    expect(screen.getByRole('textbox', { name: 'Key' })).toHaveValue(
      'PUBLIC_KEY',
    )
  })

  it('supports section edit keyboard shortcuts', async () => {
    const user = userEvent.setup()
    const fetchMock = mockFetchSequence([
      {
        path: '/projects/project-1',
        body: projectDetails,
      },
      environmentsRoute,
      {
        path: '/projects/project-1/config-items',
        body: [apiKeyConfigItem],
      },
      {
        path: '/projects/project-1/config-items',
        method: 'PUT',
        status: 204,
      },
      {
        path: '/projects/project-1/config-items',
        body: [publicKeyConfigItem],
      },
    ])

    renderProjectDetail('/projects/project-1/secrets')

    await user.click(await screen.findByRole('button', { name: 'Edit' }))
    await user.clear(screen.getByRole('textbox', { name: 'Key' }))
    await user.type(screen.getByRole('textbox', { name: 'Key' }), 'PUBLIC_KEY')
    await user.keyboard('{Enter}')

    expect(await screen.findByText('Secret renamed')).toBeInTheDocument()
    expect(getBulkSaveCalls(fetchMock)).toHaveLength(1)

    await user.click(await screen.findByRole('button', { name: 'Edit' }))
    await user.clear(screen.getByRole('textbox', { name: 'Key' }))
    await user.type(screen.getByRole('textbox', { name: 'Key' }), 'API_KEY')
    await user.keyboard('{Escape}')

    expect(screen.getByRole('textbox', { name: 'Key' })).toBeDisabled()
    expect(screen.getByRole('textbox', { name: 'Key' })).toHaveValue('PUBLIC_KEY')
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument()
  })

  it('marks a config item for deletion and deletes it on save', async () => {
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
            hasValue: true,
          },
        ],
      },
      {
        path: '/projects/project-1/config-items',
        method: 'PUT',
        status: 204,
      },
      {
        path: '/projects/project-1/config-items',
        body: [],
      },
    ])

    renderProjectDetail('/projects/project-1/secrets')

    await user.click(await screen.findByRole('button', { name: 'Edit' }))
    await user.click(await screen.findByRole('button', { name: 'Delete API_KEY' }))

    const keyInput = screen.getByRole('textbox', { name: 'Key' })
    const valueInput = screen.getByRole('textbox', { name: 'Value' })

    expect(screen.getByRole('button', { name: 'Undo delete API_KEY' })).toBeInTheDocument()
    expect(keyInput).toHaveValue('API_KEY')
    expect(valueInput).toHaveValue('')
    expect(getMutationCalls(fetchMock, 'DELETE')).toHaveLength(0)

    await user.click(screen.getByRole('button', { name: 'Save Changes' }))

    expect(await screen.findByText('Secret deleted')).toBeInTheDocument()
    expect(await screen.findByText('No secrets yet')).toBeInTheDocument()
    expect(screen.queryByRole('row', { name: /API_KEY/ })).not.toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/projects/project-1/config-items'),
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify({
          environment: 'production',
          updates: [],
          deleteConfigItemIds: ['config-1'],
        }),
      }),
    )
  })

  it('undoes a pending deletion before save', async () => {
    const user = userEvent.setup()
    const fetchMock = mockFetchSequence([
      {
        path: '/projects/project-1',
        body: projectDetails,
      },
      environmentsRoute,
      {
        path: '/projects/project-1/config-items',
        body: [apiKeyConfigItem],
      },
    ])

    renderProjectDetail('/projects/project-1/secrets')

    await user.click(await screen.findByRole('button', { name: 'Edit' }))
    await user.click(await screen.findByRole('button', { name: 'Delete API_KEY' }))

    expect(screen.getByRole('button', { name: 'Undo delete API_KEY' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Undo delete API_KEY' }))

    expect(screen.getByRole('button', { name: 'Delete API_KEY' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Value' })).toHaveValue('************')
    expect(getMutationCalls(fetchMock, 'DELETE')).toHaveLength(0)
  })

  it('does not delete config items marked for deletion when edit mode is cancelled', async () => {
    const user = userEvent.setup()
    const fetchMock = mockFetchSequence([
      {
        path: '/projects/project-1',
        body: projectDetails,
      },
      environmentsRoute,
      {
        path: '/projects/project-1/config-items',
        body: [apiKeyConfigItem],
      },
    ])

    renderProjectDetail('/projects/project-1/secrets')

    await user.click(await screen.findByRole('button', { name: 'Edit' }))
    await user.click(await screen.findByRole('button', { name: 'Delete API_KEY' }))
    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Undo delete API_KEY' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Delete API_KEY' })).not.toBeInTheDocument()
    expect(getMutationCalls(fetchMock, 'DELETE')).toHaveLength(0)
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

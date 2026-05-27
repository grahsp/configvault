import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  mockFetchSequence,
  renderProjectDetail,
} from './ProjectDetailPage.testUtils'

const authMocks = vi.hoisted(() => ({
  getAccessTokenSilently: vi.fn().mockResolvedValue('test-token'),
}))

const inviteMemberButtonName = /\+?\s*Invite member/
const roleButtonName = (displayName: string) => `Role for ${displayName}`
const memberActionsButtonName = (displayName: string) =>
  `Member actions for ${displayName}`
const invitationActionsButtonName = (createdByName: string) =>
  `Invitation actions for ${createdByName}`

vi.mock('../../../../shared/hooks/useAuth', () => ({
  useAuth: () => ({
    getAccessTokenSilently: authMocks.getAccessTokenSilently,
  }),
}))

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

function createDeferredResponse() {
  let resolve: (response: Response) => void = () => undefined
  const response = new Promise<Response>((next) => {
    resolve = next
  })

  return { response, resolve }
}

describe('ProjectDetailPage', () => {
  const projectDetails = {
    id: 'project-1',
    name: 'Production secrets',
    role: 'owner',
    description: 'Credentials for production services',
    createdAt: '2025-02-01T10:00:00Z',
  }

  it('shows project details', async () => {
    mockFetchSequence([
      {
        path: '/projects/project-1',
        body: projectDetails,
      },
      {
        path: '/projects/project-1/environments',
        body: [
          {
            id: 'env-development',
            environmentName: 'Development',
          },
        ],
      },
      {
        path: '/projects/project-1/secrets',
        body: [],
      },
    ])

    renderProjectDetail()

    expect(
      await screen.findByRole('heading', { name: 'Production secrets' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Project/i })).toHaveTextContent(
      'Production secrets',
    )
    expect(screen.queryByText('Credentials for production services')).not.toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: 'Back to projects' }),
    ).not.toBeInTheDocument()
    expect(await screen.findByText('No secrets yet')).toBeInTheDocument()
  })

  it('normalizes mixed-case project role values from the API', async () => {
    mockFetchSequence([
      {
        path: '/projects/project-1',
        body: {
          ...projectDetails,
          currentUserRole: 'ADMIN',
          role: 'Owner',
        },
      },
      {
        path: '/projects/project-1/environments',
        body: [
          {
            id: 'env-development',
            environmentName: 'Development',
          },
        ],
      },
      {
        path: '/projects/project-1/members',
        body: [],
      },
      {
        path: '/projects/project-1/invitations',
        body: [],
      },
      {
        method: 'POST',
        path: '/projects/project-1/invitations',
        body: {
          token: 'invite-token-123',
        },
      },
      {
        path: '/projects/project-1/invitations',
        body: [],
      },
      {
        method: 'POST',
        path: '/projects/project-1/invitations',
        body: {
          token: 'invite-token-123',
        },
      },
      {
        path: '/projects/project-1/invitations',
        body: [],
      },
      {
        method: 'POST',
        path: '/projects/project-1/invitations',
        body: {
          token: 'invite-token-123',
        },
      },
      {
        path: '/projects/project-1/invitations',
        body: [],
      },
    ])

    renderProjectDetail('/projects/project-1/members')

    expect(
      await screen.findByRole('heading', { name: 'Production secrets' }),
    ).toBeInTheDocument()
    expect(
      await screen.findByRole('button', { name: inviteMemberButtonName }),
    ).toBeInTheDocument()
  })

  it('shows project section navigation on the secrets route', async () => {
    mockFetchSequence([
      {
        path: '/projects/project-1',
        body: projectDetails,
      },
      {
        path: '/projects/project-1/environments',
        body: [
          {
            id: 'env-development',
            environmentName: 'Development',
          },
        ],
      },
      {
        path: '/projects/project-1/secrets',
        body: [],
      },
    ])

    renderProjectDetail('/projects/project-1/secrets')

    expect(
      await screen.findByRole('heading', { name: 'Production secrets' }),
    ).toBeInTheDocument()

    const secretsLink = screen.getByRole('link', { name: 'Secrets' })
    const membersLink = screen.getByRole('link', { name: 'Members' })

    expect(secretsLink).toHaveAttribute('href', '/projects/project-1/secrets')
    expect(secretsLink).toHaveAttribute('aria-current', 'page')
    expect(membersLink).toHaveAttribute('href', '/projects/project-1/members')
    expect(membersLink).not.toHaveAttribute('aria-current')
    expect(await screen.findByText('No secrets yet')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: '+ Add Secret' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Delete project' }),
    ).not.toBeInTheDocument()
    expect(screen.queryByText(/^Created /)).not.toBeInTheDocument()
    expect(
      screen
        .getByRole('heading', { name: 'Production secrets' })
        .closest('section'),
    ).toContainElement(screen.getByRole('button', { name: /Environment/i }))
    expect(
      screen.getByRole('button', { name: 'Actions' }),
    ).toBeInTheDocument()
  })

  it('preserves the selected environment from the secrets route query string', async () => {
    mockFetchSequence([
      {
        path: '/projects/project-1',
        body: projectDetails,
      },
      {
        path: '/projects/project-1/environments',
        body: [
          {
            id: 'env-development',
            environmentName: 'Development',
          },
          {
            id: 'env-staging',
            environmentName: 'Staging',
          },
        ],
      },
      {
        path: '/projects/project-1/secrets?environment=Staging',
        body: [],
      },
    ])

    const { router } = renderProjectDetail(
      '/projects/project-1/secrets?environmentId=env-staging',
    )

    await waitFor(() => {
      expect(
        screen.getByRole('button', {
          name: /Environment/i,
        }),
      ).toHaveTextContent('Staging')
    })
    expect(
      screen
        .getByRole('heading', { name: 'Production secrets' })
        .closest('section'),
    ).toContainElement(screen.getByRole('button', { name: /Environment/i }))
    expect(router.state.location.search).toBe('?environmentId=env-staging')
  })

  it('auto-selects the first environment on the secrets route and requests matching secrets', async () => {
    mockFetchSequence([
      {
        path: '/projects/project-1',
        body: projectDetails,
      },
      {
        path: '/projects/project-1/environments',
        body: [
          {
            id: 'env-development',
            environmentName: 'Development',
          },
          {
            id: 'env-staging',
            environmentName: 'Staging',
          },
        ],
      },
      {
        path: '/projects/project-1/secrets?environment=Development',
        body: [],
      },
    ])

    const { router } = renderProjectDetail('/projects/project-1/secrets')

    expect(await screen.findByText('No secrets yet')).toBeInTheDocument()
    expect(router.state.location.search).toBe('?environmentId=env-development')
    expect(screen.getByRole('button', { name: /Environment/i })).toHaveTextContent(
      'Development',
    )
  })

  it('rewrites stale environment ids to the resolved project environment before loading secrets', async () => {
    mockFetchSequence([
      {
        path: '/projects/project-1',
        body: projectDetails,
      },
      {
        path: '/projects/project-1/environments',
        body: [
          {
            id: 'env-development',
            environmentName: 'Development',
          },
          {
            id: 'env-staging',
            environmentName: 'Staging',
          },
        ],
      },
      {
        path: '/projects/project-1/secrets?environment=Development',
        body: [],
      },
    ])

    const { router } = renderProjectDetail(
      '/projects/project-1/secrets?environmentId=env-retired',
    )

    expect(await screen.findByText('No secrets yet')).toBeInTheDocument()
    expect(router.state.location.search).toBe('?environmentId=env-development')
    expect(screen.getByRole('button', { name: /Environment/i })).toHaveTextContent(
      'Development',
    )
  })

  it('updates the secrets route query string when selecting an environment', async () => {
    const user = userEvent.setup()

    mockFetchSequence([
      {
        path: '/projects/project-1',
        body: projectDetails,
      },
      {
        path: '/projects/project-1/environments',
        body: [
          {
            id: 'env-development',
            environmentName: 'Development',
          },
          {
            id: 'env-staging',
            environmentName: 'Staging',
          },
        ],
      },
      {
        path: '/projects/project-1/secrets?environment=Development',
        body: [],
      },
      {
        path: '/projects/project-1/secrets?environment=Staging',
        body: [],
      },
    ])

    const { router } = renderProjectDetail('/projects/project-1/secrets')

    await user.click(
      await screen.findByRole('button', {
        name: /Environment/i,
      }),
    )
    await user.click(screen.getByRole('option', { name: 'Staging' }))

    expect(router.state.location.search).toBe('?environmentId=env-staging')
    expect(screen.getByRole('link', { name: 'Members' })).toHaveAttribute(
      'href',
      '/projects/project-1/members?environmentId=env-staging',
    )
    expect(screen.getByRole('button', { name: /Environment/i })).toHaveTextContent(
      'Staging',
    )
  })

  it('renders the members route directly', async () => {
    mockFetchSequence([
      {
        path: '/projects/project-1',
        body: projectDetails,
      },
      {
        path: '/projects/project-1/environments',
        body: [
          {
            id: 'env-development',
            environmentName: 'Development',
          },
        ],
      },
      {
        path: '/projects/project-1/members',
        body: [],
      },
    ])

    renderProjectDetail('/projects/project-1/members')

    expect(
      await screen.findByRole('heading', { name: 'Production secrets' }),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('region', { name: 'Project members' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Members' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(await screen.findByText('No members found.')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: inviteMemberButtonName }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('form', { name: 'Add member' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Invite Link' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Environment/i })).toBeInTheDocument()
  })

  it('filters projects and keeps the current section when switching projects', async () => {
    const user = userEvent.setup()

    mockFetchSequence([
      {
        path: '/projects',
        body: [
          {
            id: 'project-1',
            name: 'Production secrets',
          },
          {
            id: 'project-2',
            name: 'Staging vault',
          },
        ],
      },
      {
        path: '/projects/project-1',
        body: projectDetails,
      },
      {
        path: '/projects/project-1/environments',
        body: [
          {
            id: 'env-staging',
            environmentName: 'Staging',
          },
        ],
      },
      {
        path: '/projects/project-1/secrets',
        body: [],
      },
      {
        path: '/projects/project-2',
        body: {
          ...projectDetails,
          id: 'project-2',
          name: 'Staging vault',
        },
      },
      {
        path: '/projects/project-2/environments',
        body: [
          {
            id: 'env-production',
            environmentName: 'Production',
          },
        ],
      },
      {
        path: '/projects/project-2/secrets?environment=Production',
        body: [],
      },
    ])

    const { router } = renderProjectDetail(
      '/projects/project-1/secrets?environmentId=env-staging',
    )

    await user.click(await screen.findByRole('button', { name: /Project/i }))
    await user.type(screen.getByPlaceholderText('Search projects...'), 'vault')
    await user.click(screen.getByRole('option', { name: 'Staging vault' }))

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/projects/project-2/secrets')
    })
    expect(router.state.location.search).toBe('?environmentId=env-production')
    expect(screen.getByRole('button', { name: /Project/i })).toHaveTextContent(
      'Staging vault',
    )
    expect(screen.getByRole('button', { name: /Environment/i })).toHaveTextContent(
      'Production',
    )
  })

  it('filters environments and closes the selector with escape', async () => {
    const user = userEvent.setup()

    mockFetchSequence([
      {
        path: '/projects/project-1',
        body: projectDetails,
      },
      {
        path: '/projects/project-1/environments',
        body: [
          {
            id: 'env-development',
            environmentName: 'Development',
          },
          {
            id: 'env-staging',
            environmentName: 'Staging',
          },
        ],
      },
      {
        path: '/projects/project-1/secrets',
        body: [],
      },
    ])

    renderProjectDetail('/projects/project-1/secrets')

    await user.click(await screen.findByRole('button', { name: /Environment/i }))
    await user.type(screen.getByPlaceholderText('Search environments...'), 'stag')

    expect(screen.getByRole('option', { name: 'Staging' })).toBeInTheDocument()
    expect(
      screen.queryByRole('option', { name: 'Development' }),
    ).not.toBeInTheDocument()

    await user.keyboard('{Escape}')

    await waitFor(() => {
      expect(
        screen.queryByPlaceholderText('Search environments...'),
      ).not.toBeInTheDocument()
    })
  })

  it('opens the invite member dialog with local email and link flows', async () => {
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
            id: 'env-development',
            environmentName: 'Development',
          },
        ],
      },
      {
        path: '/projects/project-1/members',
        body: [],
      },
      {
        path: '/projects/project-1/invitations',
        body: [],
      },
      {
        method: 'POST',
        path: '/projects/project-1/invitations',
        body: {
          token: 'invite-token-123',
        },
      },
      {
        path: '/projects/project-1/invitations',
        body: [],
      },
    ])

    renderProjectDetail('/projects/project-1/members')

    await user.click(await screen.findByRole('button', { name: inviteMemberButtonName }))

    const dialog = screen.getByRole('dialog', { name: 'Invite to project' })
    const userIdForm = within(dialog).getByRole('form', { name: 'Invite by user ID' })
    const userIdInput = within(userIdForm).getByRole('textbox', { name: 'User ID' })
    const overlay = document.body.querySelector('[data-slot="dialog-overlay"]')

    expect(
      within(dialog).queryByText('Grant access by inviting a user ID or generating a link.'),
    ).not.toBeInTheDocument()
    expect(
      within(userIdForm).queryByText('Enter a specific user ID to prepare a direct invite locally'),
    ).not.toBeInTheDocument()
    expect(
      within(dialog).getByRole('heading', { name: 'Invite by user ID' }),
    ).toBeInTheDocument()
    expect(within(dialog).queryByRole('combobox')).not.toBeInTheDocument()
    expect(
      within(dialog).getByRole('button', { name: 'Generate link' }),
    ).toBeInTheDocument()
    expect(
      within(dialog).queryByRole('textbox', { name: 'Generated invitation link' }),
    ).not.toBeInTheDocument()
    expect(within(dialog).queryByText(/Treat it like a password/i)).not.toBeInTheDocument()
    expect(overlay).toHaveClass('z-50')
    expect(dialog).toHaveClass('z-[60]')

    await user.click(within(userIdForm).getByRole('button', { name: 'Send invite' }))

    expect(await within(userIdForm).findByRole('alert')).toHaveTextContent(
      'Enter a user ID.',
    )
    expect(userIdInput).toHaveAttribute('aria-invalid', 'true')

    await user.type(userIdInput, '  user-123  ')
    await user.click(within(userIdForm).getByRole('button', { name: 'Send invite' }))

    await waitFor(() => {
      expect(userIdInput).toHaveValue('')
    })
    expect(fetchMock).not.toHaveBeenCalledWith(
      expect.stringContaining('/projects/project-1/members'),
      expect.objectContaining({ method: 'POST' }),
    )

    await user.click(within(dialog).getByRole('button', { name: 'Generate link' }))

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/projects/project-1/invitations'),
        expect.objectContaining({ method: 'POST' }),
      ),
    )

    expect(
      await within(dialog).findByRole('textbox', { name: 'Generated invitation link' }),
    ).toHaveValue('http://localhost:3000/invitations/invite-token-123')
    expect(within(dialog).getByRole('button', { name: 'Copy' })).toBeInTheDocument()
    expect(within(dialog).queryByRole('button', { name: 'Revoke' })).not.toBeInTheDocument()
  })

  it('copies the generated invitation URL and shows a toast', async () => {
    const user = userEvent.setup()
    const writeText = vi.fn().mockResolvedValue(undefined)

    vi.stubGlobal('navigator', {
      ...window.navigator,
      clipboard: {
        writeText,
      },
    })

    mockFetchSequence([
      {
        path: '/projects/project-1',
        body: projectDetails,
      },
      {
        path: '/projects/project-1/environments',
        body: [
          {
            id: 'env-development',
            environmentName: 'Development',
          },
        ],
      },
      {
        path: '/projects/project-1/members',
        body: [],
      },
      {
        path: '/projects/project-1/invitations',
        body: [],
      },
      {
        method: 'POST',
        path: '/projects/project-1/invitations',
        body: {
          token: 'invite-token-123',
        },
      },
      {
        path: '/projects/project-1/invitations',
        body: [],
      },
    ])

    renderProjectDetail('/projects/project-1/members')

    await user.click(await screen.findByRole('button', { name: inviteMemberButtonName }))
    const dialog = screen.getByRole('dialog', { name: 'Invite to project' })

    await user.click(within(dialog).getByRole('button', { name: 'Generate link' }))
    await within(dialog).findByRole('textbox', { name: 'Generated invitation link' })
    await user.click(within(dialog).getByRole('button', { name: 'Copy' }))

    expect(writeText).toHaveBeenCalledWith(
      'http://localhost:3000/invitations/invite-token-123',
    )
    expect(
      await screen.findByText('Invitation link copied to clipboard.'),
    ).toBeInTheDocument()
  })

  it('shows active invitation links for users who can manage members', async () => {
    mockFetchSequence([
      {
        path: '/projects/project-1',
        body: projectDetails,
      },
      {
        path: '/projects/project-1/environments',
        body: [
          {
            id: 'env-development',
            environmentName: 'Development',
          },
        ],
      },
      {
        path: '/projects/project-1/members',
        body: [],
      },
      {
        path: '/projects/project-1/invitations',
        body: [
          {
            invitationId: 'invite-1',
            createdById: 'current-user',
            createdByName: 'Olivia Owner',
            createdAt: '2025-02-01T11:00:00Z',
            expiresAt: '2025-02-08T11:00:00Z',
          },
        ],
      },
    ])

    renderProjectDetail('/projects/project-1/members')

    const invitationTable = await screen.findByRole('table', {
      name: 'Pending Invites',
    })

    expect(
      within(invitationTable).getByRole('columnheader', { name: 'Created by' }),
    ).toBeInTheDocument()
    expect(
      within(invitationTable).getByRole('columnheader', { name: 'Created' }),
    ).toBeInTheDocument()
    expect(
      within(invitationTable).getByRole('columnheader', { name: 'Expires' }),
    ).toBeInTheDocument()
    expect(
      within(invitationTable).getByRole('button', {
        name: invitationActionsButtonName('Olivia Owner'),
      }),
    ).toBeEnabled()
    expect(
      screen.getByRole('heading', { name: 'Pending Invites' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Olivia Owner')).toBeInTheDocument()
  })

  it('revokes an invitation link after confirmation and refreshes the list', async () => {
    const fetchMock = mockFetchSequence([
      {
        path: '/projects/project-1',
        body: projectDetails,
      },
      {
        path: '/projects/project-1/environments',
        body: [
          {
            id: 'env-development',
            environmentName: 'Development',
          },
        ],
      },
      {
        path: '/projects/project-1/members',
        body: [],
      },
      {
        path: '/projects/project-1/invitations',
        body: [
          {
            invitationId: 'invite-1',
            createdById: 'current-user',
            createdByName: 'Olivia Owner',
            createdAt: '2025-02-01T11:00:00Z',
            expiresAt: '2025-02-08T11:00:00Z',
          },
        ],
      },
      {
        method: 'POST',
        path: '/projects/project-1/invitations/revoke/invite-1',
        status: 200,
      },
      {
        path: '/projects/project-1/invitations',
        body: [],
      },
    ])
    const user = userEvent.setup()

    renderProjectDetail('/projects/project-1/members')

    await user.click(
      await screen.findByRole('button', {
        name: invitationActionsButtonName('Olivia Owner'),
      }),
    )
    await user.click(screen.getByRole('menuitem', { name: 'Revoke' }))

    const dialog = screen.getByRole('alertdialog', {
      name: 'Revoke invitation link',
    })
    expect(within(dialog).getByText('Revoke this invitation link?')).toBeInTheDocument()

    await user.click(within(dialog).getByRole('button', { name: 'Revoke' }))

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/projects/project-1/invitations/revoke/invite-1'),
        expect.objectContaining({ method: 'POST' }),
      ),
    )
    await waitFor(() =>
      expect(
        screen.queryByRole('heading', { name: 'Pending Invites' }),
      ).not.toBeInTheDocument(),
    )
    expect(
      screen.queryByRole('table', { name: 'Pending Invites' }),
    ).not.toBeInTheDocument()
    expect(screen.queryByText('No active invitation links.')).not.toBeInTheDocument()
  })

  it('deletes the project from the header actions menu', async () => {
    const user = userEvent.setup()

    mockFetchSequence([
      {
        path: '/projects/project-1',
        body: projectDetails,
      },
      {
        path: '/projects/project-1',
        method: 'DELETE',
        status: 204,
      },
    ])

    const { router } = renderProjectDetail('/projects/project-1/secrets')

    await user.click(
      await screen.findByRole('button', { name: 'Actions' }),
    )
    await user.click(screen.getByRole('menuitem', { name: 'Delete project' }))

    expect(
      screen.getByRole('alertdialog', { name: 'Delete project' }),
    ).toHaveTextContent('Delete Production secrets? This cannot be undone.')

    await user.click(screen.getByRole('button', { name: 'Delete' }))

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/projects')
    })
  })

  it('shows the members loading state before member data is available', async () => {
    const membersResponse = createDeferredResponse()

    mockFetchSequence([
      {
        path: '/projects/project-1',
        body: projectDetails,
      },
      {
        path: '/projects/project-1/members',
        response: membersResponse.response,
      },
      {
        path: '/projects/project-1/invitations',
        body: [],
      },
    ])

    renderProjectDetail('/projects/project-1/members')

    expect(await screen.findByText('Loading members...')).toBeInTheDocument()
    expect(
      screen.getByText('Project access details are being prepared.'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: inviteMemberButtonName }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /^Role for / }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /^Member actions for / }),
    ).not.toBeInTheDocument()

    membersResponse.resolve(
      new Response(JSON.stringify([]), {
        headers: {
          'Content-Type': 'application/json',
        },
        status: 200,
      }),
    )
  })

  it('shows loaded project members', async () => {
    const user = userEvent.setup()

    mockFetchSequence([
      {
        path: '/projects/project-1',
        body: projectDetails,
      },
      {
        path: '/projects/project-1/members',
        body: [
          {
            userId: 'current-user',
            displayName: 'Olivia Owner',
            role: 'owner',
            isCurrentUser: true,
          },
          {
            userId: 'user-owner',
            displayName: 'Oscar Owner',
            role: 'owner',
            isCurrentUser: false,
          },
          {
            userId: 'user-admin',
            displayName: 'Alex Admin',
            role: 'admin',
            isCurrentUser: false,
          },
          {
            userId: 'user-member',
            displayName: null,
            role: 'member',
            isCurrentUser: false,
          },
        ],
      },
      {
        path: '/projects/project-1/invitations',
        body: [
          {
            invitationId: 'invite-1',
            createdById: 'current-user',
            createdByName: 'Olivia Owner',
            createdAt: '2025-02-01T11:00:00Z',
            expiresAt: '2025-02-08T11:00:00Z',
          },
        ],
      },
    ])

    renderProjectDetail('/projects/project-1/members')

    const membersTable = await screen.findByRole('table', {
      name: 'Project members',
    })

    expect(
      within(membersTable).getByRole('columnheader', { name: 'Name' }),
    ).toBeInTheDocument()
    expect(
      within(membersTable).getByRole('columnheader', { name: 'Role' }),
    ).toBeInTheDocument()
    expect(
      within(membersTable).getByRole('columnheader', { name: 'Actions' }),
    ).toBeInTheDocument()

    const ownerRow = within(membersTable).getByRole('row', {
      name: /Olivia OwnerYou Owner No actions available/,
    })
    const otherOwnerRow = within(membersTable).getByRole('row', {
      name: /Oscar Owner Owner/,
    })
    const adminRow = within(membersTable).getByRole('row', {
      name: /Alex Admin Admin/,
    })
    const memberRow = within(membersTable).getByRole('row', {
      name: /user-member Member/,
    })

    expect(ownerRow).toBeInTheDocument()
    expect(within(ownerRow).queryByRole('button')).not.toBeInTheDocument()
    expect(
      within(otherOwnerRow).getByRole('button', {
        name: roleButtonName('Oscar Owner'),
      }),
    ).toBeDisabled()
    await user.click(
      within(otherOwnerRow).getByRole('button', {
        name: memberActionsButtonName('Oscar Owner'),
      }),
    )
    expect(
      screen.getByRole('menuitem', { name: 'Remove' }),
    ).toBeDisabled()
    expect(
      within(adminRow).getByRole('button', {
        name: roleButtonName('Alex Admin'),
      }),
    ).toBeEnabled()
    expect(
      within(adminRow).getByRole('button', {
        name: memberActionsButtonName('Alex Admin'),
      }),
    ).toBeEnabled()
    expect(
      within(memberRow).getByRole('button', {
        name: memberActionsButtonName('user-member'),
      }),
    ).toBeEnabled()
    expect(
      within(memberRow).getByRole('button', {
        name: roleButtonName('user-member'),
      }),
    ).toBeEnabled()
  })

  it('shows the invite member trigger for admins', async () => {
    mockFetchSequence([
      {
        path: '/projects/project-1',
        body: {
          ...projectDetails,
          role: 'admin',
        },
      },
      {
        path: '/projects/project-1/members',
        body: [
          {
            userId: 'current-user',
            displayName: 'Alex Admin',
            role: 'admin',
            isCurrentUser: true,
          },
          {
            userId: 'user-member',
            displayName: 'Morgan Member',
            role: 'member',
            isCurrentUser: false,
          },
        ],
      },
      {
        path: '/projects/project-1/invitations',
        body: [],
      },
    ])

    renderProjectDetail('/projects/project-1/members')

    const inviteMemberButton = await screen.findByRole('button', {
      name: inviteMemberButtonName,
    })
    const currentUserRow = await screen.findByRole('row', {
      name: /Alex AdminYou Admin No actions available/,
    })
    const memberRow = await screen.findByRole('row', {
      name: /Morgan Member Member/,
    })

    expect(inviteMemberButton).toBeInTheDocument()
    expect(
      within(currentUserRow).queryByRole('button', {
        name: roleButtonName('Alex Admin'),
      }),
    ).not.toBeInTheDocument()
    expect(within(currentUserRow).queryByRole('button')).not.toBeInTheDocument()
    expect(
      within(memberRow).getByRole('button', {
        name: roleButtonName('Morgan Member'),
      }),
    ).toBeEnabled()
    expect(
      within(memberRow).getByRole('button', {
        name: memberActionsButtonName('Morgan Member'),
      }),
    ).toBeEnabled()
  })

  it('disables member controls for read-only members', async () => {
    mockFetchSequence([
      {
        path: '/projects/project-1',
        body: {
          ...projectDetails,
          role: 'member',
        },
      },
      {
        path: '/projects/project-1/members',
        body: [
          {
            userId: 'current-user',
            displayName: 'Olivia Owner',
            role: 'owner',
            isCurrentUser: true,
          },
          {
            userId: 'user-admin',
            displayName: 'Alex Admin',
            role: 'admin',
            isCurrentUser: false,
          },
        ],
      },
    ])

    renderProjectDetail('/projects/project-1/members')

    const roleSelector = await screen.findByRole('button', {
      name: roleButtonName('Alex Admin'),
    })

    expect(roleSelector).toBeDisabled()
    expect(
      screen.queryByRole('button', {
        name: memberActionsButtonName('Alex Admin'),
      }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: 'Pending Invites' }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: inviteMemberButtonName }),
    ).not.toBeInTheDocument()
  })

  it('shows the invite member trigger for users who can manage members', async () => {
    mockFetchSequence([
      {
        path: '/projects/project-1',
        body: projectDetails,
      },
      {
        path: '/projects/project-1/members',
        body: [
          {
            userId: 'current-user',
            displayName: 'Olivia Owner',
            role: 'owner',
            isCurrentUser: true,
          },
        ],
      },
      {
        path: '/projects/project-1/invitations',
        body: [],
      },
    ])

    renderProjectDetail('/projects/project-1/members')

    expect(
      await screen.findByRole('button', { name: inviteMemberButtonName }),
    ).toBeEnabled()
    expect(
      screen.queryByRole('heading', { name: 'Pending Invites' }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('table', { name: 'Pending Invites' }),
    ).not.toBeInTheDocument()
    expect(screen.queryByText('No active invitation links.')).not.toBeInTheDocument()
  })

  it('blocks invalid invite user IDs locally without making a network call', async () => {
    const fetchMock = mockFetchSequence([
      {
        path: '/projects/project-1',
        body: projectDetails,
      },
      {
        path: '/projects/project-1/members',
        body: [
          {
            userId: 'current-user',
            displayName: 'Olivia Owner',
            role: 'owner',
            isCurrentUser: true,
          },
        ],
      },
      {
        path: '/projects/project-1/invitations',
        body: [],
      },
    ])
    const user = userEvent.setup()

    renderProjectDetail('/projects/project-1/members')

    await user.click(await screen.findByRole('button', { name: inviteMemberButtonName }))

    const dialog = screen.getByRole('dialog', { name: 'Invite to project' })
    const userIdForm = within(dialog).getByRole('form', { name: 'Invite by user ID' })

    await user.click(within(userIdForm).getByRole('button', { name: 'Send invite' }))

    expect(await within(userIdForm).findByRole('alert')).toHaveTextContent(
      'Enter a user ID.',
    )
    expect(
      within(userIdForm).getByRole('textbox', { name: 'User ID' }),
    ).toHaveAttribute('aria-invalid', 'true')
    expect(fetchMock).not.toHaveBeenCalledWith(
      expect.stringContaining('/projects/project-1/members'),
      expect.objectContaining({ method: 'POST' }),
    )
  })

  it('updates a member role and refreshes the member list', async () => {
    const fetchMock = mockFetchSequence([
      {
        path: '/projects/project-1',
        body: projectDetails,
      },
      {
        path: '/projects/project-1/members',
        body: [
          {
            userId: 'current-user',
            displayName: 'Olivia Owner',
            role: 'owner',
            isCurrentUser: true,
          },
          {
            userId: 'user-member',
            displayName: null,
            role: 'member',
            isCurrentUser: false,
          },
        ],
      },
      {
        path: '/projects/project-1/invitations',
        body: [],
      },
      {
        method: 'PUT',
        path: '/projects/project-1/members/user-member',
        status: 204,
      },
      {
        path: '/projects/project-1/members',
        body: [
          {
            userId: 'current-user',
            displayName: 'Olivia Owner',
            role: 'owner',
            isCurrentUser: true,
          },
          {
            userId: 'user-member',
            displayName: null,
            role: 'admin',
            isCurrentUser: false,
          },
        ],
      },
      {
        path: '/projects/project-1/invitations',
        body: [],
      },
    ])
    const user = userEvent.setup()

    renderProjectDetail('/projects/project-1/members')

    const roleSelector = await screen.findByRole('button', {
      name: roleButtonName('user-member'),
    })

    await user.click(roleSelector)
    await user.click(screen.getByRole('option', { name: 'Admin' }))

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/projects/project-1/members/user-member'),
        expect.objectContaining({
          body: JSON.stringify({ role: 'admin' }),
          method: 'PUT',
        }),
      ),
    )
    await waitFor(() => expect(roleSelector).toHaveTextContent('Admin'))
  })

  it('shows role update errors without changing the displayed role', async () => {
    mockFetchSequence([
      {
        path: '/projects/project-1',
        body: projectDetails,
      },
      {
        path: '/projects/project-1/members',
        body: [
          {
            userId: 'current-user',
            displayName: 'Olivia Owner',
            role: 'owner',
            isCurrentUser: true,
          },
          {
            userId: 'user-member',
            displayName: null,
            role: 'member',
            isCurrentUser: false,
          },
        ],
      },
      {
        path: '/projects/project-1/invitations',
        body: [],
      },
      {
        method: 'PUT',
        path: '/projects/project-1/members/user-member',
        body: { message: 'Role change rejected.' },
        status: 403,
      },
    ])
    const user = userEvent.setup()

    renderProjectDetail('/projects/project-1/members')

    const roleSelector = await screen.findByRole('button', {
      name: roleButtonName('user-member'),
    })

    await user.click(roleSelector)
    await user.click(screen.getByRole('option', { name: 'Admin' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Role change rejected.',
    )
    expect(roleSelector).toHaveTextContent('Member')
    expect(roleSelector).toHaveAttribute('aria-invalid', 'true')
  })

  it('opens and cancels the remove member confirmation', async () => {
    const fetchMock = mockFetchSequence([
      {
        path: '/projects/project-1',
        body: projectDetails,
      },
      {
        path: '/projects/project-1/members',
        body: [
          {
            userId: 'current-user',
            displayName: 'Olivia Owner',
            role: 'owner',
            isCurrentUser: true,
          },
          {
            userId: 'user-member',
            displayName: null,
            role: 'member',
            isCurrentUser: false,
          },
        ],
      },
      {
        path: '/projects/project-1/invitations',
        body: [],
      },
    ])
    const user = userEvent.setup()

    renderProjectDetail('/projects/project-1/members')

    await user.click(
      await screen.findByRole('button', {
        name: memberActionsButtonName('user-member'),
      }),
    )
    await user.click(screen.getByRole('menuitem', { name: 'Remove' }))

    const dialog = screen.getByRole('alertdialog', { name: 'Remove member' })
    expect(
      within(dialog).getByText('Remove this member from the project?'),
    ).toBeInTheDocument()

    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }))

    expect(
      screen.queryByRole('alertdialog', { name: 'Remove member' }),
    ).not.toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalledWith(
      expect.stringContaining('/projects/project-1/members/user-member'),
      expect.objectContaining({ method: 'DELETE' }),
    )
  })

  it('removes a member after confirmation and refreshes the member list', async () => {
    const fetchMock = mockFetchSequence([
      {
        path: '/projects/project-1',
        body: projectDetails,
      },
      {
        path: '/projects/project-1/members',
        body: [
          {
            userId: 'current-user',
            displayName: 'Olivia Owner',
            role: 'owner',
            isCurrentUser: true,
          },
          {
            userId: 'user-member',
            displayName: null,
            role: 'member',
            isCurrentUser: false,
          },
        ],
      },
      {
        path: '/projects/project-1/invitations',
        body: [],
      },
      {
        method: 'DELETE',
        path: '/projects/project-1/members/user-member',
        status: 204,
      },
      {
        path: '/projects/project-1/members',
        body: [
          {
            userId: 'current-user',
            displayName: 'Olivia Owner',
            role: 'owner',
            isCurrentUser: true,
          },
        ],
      },
      {
        path: '/projects/project-1/invitations',
        body: [],
      },
    ])
    const user = userEvent.setup()

    renderProjectDetail('/projects/project-1/members')

    await user.click(
      await screen.findByRole('button', {
        name: memberActionsButtonName('user-member'),
      }),
    )
    await user.click(screen.getByRole('menuitem', { name: 'Remove' }))

    const dialog = screen.getByRole('alertdialog', { name: 'Remove member' })
    await user.click(within(dialog).getByRole('button', { name: 'Remove' }))

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/projects/project-1/members/user-member'),
        expect.objectContaining({ method: 'DELETE' }),
      ),
    )
    await waitFor(() =>
      expect(
        screen.queryByRole('button', {
          name: memberActionsButtonName('user-member'),
        }),
      ).not.toBeInTheDocument(),
    )
  })

  it('shows remove member errors and leaves the member visible', async () => {
    mockFetchSequence([
      {
        path: '/projects/project-1',
        body: projectDetails,
      },
      {
        path: '/projects/project-1/members',
        body: [
          {
            userId: 'current-user',
            displayName: 'Olivia Owner',
            role: 'owner',
            isCurrentUser: true,
          },
          {
            userId: 'user-member',
            displayName: null,
            role: 'member',
            isCurrentUser: false,
          },
        ],
      },
      {
        path: '/projects/project-1/invitations',
        body: [],
      },
      {
        method: 'DELETE',
        path: '/projects/project-1/members/user-member',
        body: { message: 'Member removal rejected.' },
        status: 403,
      },
    ])
    const user = userEvent.setup()

    renderProjectDetail('/projects/project-1/members')

    await user.click(
      await screen.findByRole('button', {
        name: memberActionsButtonName('user-member'),
      }),
    )
    await user.click(screen.getByRole('menuitem', { name: 'Remove' }))
    await user.click(
      within(screen.getByRole('alertdialog', { name: 'Remove member' })).getByRole(
        'button',
        { name: 'Remove' },
      ),
    )

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Member removal rejected.',
    )
    expect(screen.getByText('user-member')).toBeInTheDocument()
  })

  it('shows an error state when project members cannot load', async () => {
    mockFetchSequence([
      {
        path: '/projects/project-1',
        body: projectDetails,
      },
      {
        path: '/projects/project-1/members',
        body: { message: 'Members service failed.' },
        status: 500,
      },
      {
        path: '/projects/project-1/invitations',
        body: [],
      },
    ])

    renderProjectDetail('/projects/project-1/members')

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Failed to load members.',
    )
    expect(screen.getByText('Members service failed.')).toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /^Role for / }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /^Member actions for / }),
    ).not.toBeInTheDocument()
  })

  it('shows the active project section after navigating tabs', async () => {
    const user = userEvent.setup()

    mockFetchSequence([
      {
        path: '/projects/project-1',
        body: projectDetails,
      },
      {
        path: '/projects/project-1/environments',
        body: [
          {
            id: 'env-development',
            environmentName: 'Development',
          },
        ],
      },
      {
        path: '/projects/project-1/secrets?environment=Development',
        body: [],
      },
      {
        path: '/projects/project-1/members',
        body: [],
      },
      {
        path: '/projects/project-1/invitations',
        body: [],
      },
    ])

    renderProjectDetail('/projects/project-1/secrets')

    expect(
      await screen.findByRole('heading', { name: 'Production secrets' }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: 'Members' }))

    expect(
      screen.getByRole('region', { name: 'Project members' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Members' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(screen.getByRole('link', { name: 'Secrets' })).not.toHaveAttribute(
      'aria-current',
    )
  })

  it('shows a non-loading empty state when a project has no environments', async () => {
    mockFetchSequence([
      {
        path: '/projects/project-1',
        body: projectDetails,
      },
      {
        path: '/projects/project-1/environments',
        body: [],
      },
    ])

    const { router } = renderProjectDetail('/projects/project-1/secrets')

    expect(await screen.findByText('No environment available')).toBeInTheDocument()
    expect(screen.queryByText('Loading secrets...')).not.toBeInTheDocument()
    expect(router.state.location.search).toBe('')
    expect(
      screen.queryByRole('button', { name: '+ Add Secret' }),
    ).not.toBeInTheDocument()
  })

  it('shows an error state when project details cannot load', async () => {
    mockFetchSequence([
      {
        path: '/projects/project-1',
        body: { message: 'Project service failed.' },
        status: 500,
      },
    ])

    renderProjectDetail()

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Project could not load',
    )
    expect(screen.getByText('Project service failed.')).toBeInTheDocument()
  })

  it('shows the not-found state for missing projects', async () => {
    mockFetchSequence([
      {
        path: '/projects/project-1',
        body: { message: 'Not found' },
        status: 404,
      },
    ])

    renderProjectDetail()

    expect(await screen.findByText('Project not found')).toBeInTheDocument()
    expect(
      screen.getByText(
        'This project is missing or your account cannot access it.',
      ),
    ).toBeInTheDocument()
  })

  it('shows an access-denied state for authorization failures', async () => {
    mockFetchSequence([
      {
        path: '/projects/project-1',
        body: { title: 'Forbidden' },
        status: 403,
      },
    ])

    renderProjectDetail()

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Project access denied',
    )
    expect(
      screen.getByText('Your account is not authorized to open this project.'),
    ).toBeInTheDocument()
  })
})

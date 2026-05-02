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
    expect(
      screen.getByText('Credentials for production services'),
    ).toBeInTheDocument()
    expect(
      await screen.findByRole('heading', { name: 'Secrets' }),
    ).toBeInTheDocument()
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
    ])

    renderProjectDetail('/projects/project-1/members')

    expect(
      await screen.findByRole('heading', { name: 'Production secrets' }),
    ).toBeInTheDocument()
    expect(await screen.findByRole('form', { name: 'Add member' })).toBeInTheDocument()
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

    const generalLink = screen.getByRole('link', { name: 'General' })
    const secretsLink = screen.getByRole('link', { name: 'Secrets' })
    const membersLink = screen.getByRole('link', { name: 'Members' })

    expect(generalLink).toHaveAttribute('href', '/projects/project-1/general')
    expect(generalLink).not.toHaveAttribute('aria-current')
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
    ).toContainElement(screen.getByText('Environment', { selector: 'span' }))
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
        path: '/projects/project-1/secrets',
        body: [],
      },
    ])

    const { router } = renderProjectDetail(
      '/projects/project-1/secrets?environmentId=env-staging',
    )

    expect(
      await screen.findByRole('button', {
        name: /^Staging$/,
      }),
    ).toBeInTheDocument()
    expect(
      screen
        .getByRole('heading', { name: 'Production secrets' })
        .closest('section'),
    ).toContainElement(screen.getByText('Environment', { selector: 'span' }))
    expect(router.state.location.search).toBe('?environmentId=env-staging')
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
    ])

    const { router } = renderProjectDetail('/projects/project-1/secrets')

    await user.click(
      await screen.findByRole('button', {
        name: /^Development$/,
      }),
    )
    await user.click(screen.getByRole('option', { name: 'Staging' }))

    expect(router.state.location.search).toBe('?environmentId=env-staging')
    expect(screen.getByRole('link', { name: 'Members' })).toHaveAttribute(
      'href',
      '/projects/project-1/members?environmentId=env-staging',
    )
    expect(
      screen.queryByRole('button', { name: '+ Add Secret' }),
    ).not.toBeInTheDocument()
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

    expect(screen.getByRole('heading', { name: 'Members' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Members' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(await screen.findByText('No members found.')).toBeInTheDocument()
    expect(
      screen.getByRole('form', { name: 'Add member' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Generate invitation URL' }),
    ).toBeInTheDocument()
  })

  it('creates and copies an invitation URL from the members page', async () => {
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
        path: '/projects/project-1/invitations',
        method: 'POST',
        body: {
          token: 'invite-token',
        },
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
          {
            invitationId: 'invite-2',
            createdById: 'current-user',
            createdByName: 'Olivia Owner',
            createdAt: '2025-02-01T12:00:00Z',
            expiresAt: '2025-02-08T12:00:00Z',
          },
        ],
      },
    ])

    renderProjectDetail('/projects/project-1/members')

    await user.click(
      await screen.findByRole('button', { name: 'Generate invitation URL' }),
    )

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith(
        'http://localhost:3000/invitations/invite-token',
      )
    })

    expect(
      await screen.findByText('Invitation URL copied to clipboard.'),
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
      name: 'Active invitation links',
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
      within(invitationTable).getByRole('button', { name: 'Revoke' }),
    ).toBeEnabled()
    expect(screen.getByRole('heading', { name: 'Invitation links' })).toBeInTheDocument()
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

    await user.click(await screen.findByRole('button', { name: 'Revoke' }))

    const dialog = screen.getByRole('dialog', { name: 'Revoke invitation link' })
    expect(within(dialog).getByText('Revoke this invitation link?')).toBeInTheDocument()

    await user.click(within(dialog).getByRole('button', { name: 'Revoke' }))

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/projects/project-1/invitations/revoke/invite-1'),
        expect.objectContaining({ method: 'POST' }),
      ),
    )
    expect(await screen.findByText('No active invitation links.')).toBeInTheDocument()
  })

  it('renders the general route directly', async () => {
    mockFetchSequence([
      {
        path: '/projects/project-1',
        body: projectDetails,
      },
    ])

    renderProjectDetail('/projects/project-1/general')

    expect(
      await screen.findByRole('heading', { name: 'Production secrets' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'General' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'General' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(screen.getByText('Project name')).toBeInTheDocument()
    expect(screen.getByText('Description')).toBeInTheDocument()
    expect(screen.getByText('Created')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Delete project' }),
    ).toBeInTheDocument()
  })

  it('deletes the project from the general route', async () => {
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

    const { router } = renderProjectDetail('/projects/project-1/general')

    await user.click(
      await screen.findByRole('button', { name: 'Delete project' }),
    )

    expect(
      screen.getByRole('dialog', { name: 'Delete project' }),
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
      screen.getByRole('form', { name: 'Add member' }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /^Remove / }),
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
      name: /Oscar Owner Role for Oscar OwnerOwner Remove/,
    })
    const adminRow = within(membersTable).getByRole('row', {
      name: /Alex Admin Role for Alex AdminAdmin Remove/,
    })
    const memberRow = within(membersTable).getByRole('row', {
      name: /user-member Role for user-memberMember Remove/,
    })

    expect(ownerRow).toBeInTheDocument()
    expect(within(ownerRow).queryByRole('button')).not.toBeInTheDocument()
    expect(
      within(otherOwnerRow).getByRole('combobox', {
        name: 'Role for Oscar Owner',
      }),
    ).toBeDisabled()
    expect(
      within(otherOwnerRow).getByRole('button', {
        name: 'Remove Oscar Owner',
      }),
    ).toBeDisabled()
    expect(
      within(adminRow).getByRole('combobox', {
        name: 'Role for Alex Admin',
      }),
    ).toBeEnabled()
    expect(
      within(adminRow).getByRole('button', {
        name: 'Remove Alex Admin',
      }),
    ).toBeEnabled()
    expect(
      within(memberRow).getByRole('combobox', {
        name: 'Role for user-member',
      }),
    ).toBeEnabled()
    expect(
      within(memberRow).getByRole('button', {
        name: 'Remove user-member',
      }),
    ).toBeEnabled()
  })

  it('shows the add member form for admins', async () => {
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

    const addMemberForm = await screen.findByRole('form', {
      name: 'Add member',
    })
    const currentUserRow = await screen.findByRole('row', {
      name: /Alex AdminYou Admin No actions available/,
    })
    const memberRow = await screen.findByRole('row', {
      name: /Morgan Member Role for Morgan MemberMember Remove/,
    })

    expect(addMemberForm).toBeInTheDocument()
    expect(
      within(currentUserRow).queryByRole('combobox', {
        name: 'Role for Alex Admin',
      }),
    ).not.toBeInTheDocument()
    expect(within(currentUserRow).queryByRole('button')).not.toBeInTheDocument()
    expect(
      within(currentUserRow).getByText('No actions available'),
    ).toBeInTheDocument()
    expect(
      within(memberRow).getByRole('combobox', {
        name: 'Role for Morgan Member',
      }),
    ).toBeEnabled()
    expect(
      within(memberRow).getByRole('button', {
        name: 'Remove Morgan Member',
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

    const roleSelector = await screen.findByRole('combobox', {
      name: 'Role for Alex Admin',
    })

    expect(roleSelector).toBeDisabled()
    expect(
      screen.getByRole('button', { name: 'Remove Alex Admin' }),
    ).toBeDisabled()
    expect(
      screen.queryByRole('heading', { name: 'Invitation links' }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('form', { name: 'Add member' }),
    ).not.toBeInTheDocument()
  })

  it('shows the add member form for users who can manage members', async () => {
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

    const addMemberForm = await screen.findByRole('form', {
      name: 'Add member',
    })

    expect(
      within(addMemberForm).getByRole('textbox', { name: 'User ID' }),
    ).toBeInTheDocument()
    expect(
      within(addMemberForm).getByRole('button', { name: 'Add Member' }),
    ).toBeEnabled()
  })

  it('does not add a member when the user ID is empty', async () => {
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

    const addMemberForm = await screen.findByRole('form', {
      name: 'Add member',
    })

    await user.click(
      within(addMemberForm).getByRole('button', { name: 'Add Member' }),
    )

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Enter a user ID.',
    )
    expect(
      within(addMemberForm).getByRole('textbox', { name: 'User ID' }),
    ).toHaveAttribute('aria-invalid', 'true')
    expect(fetchMock).not.toHaveBeenCalledWith(
      expect.stringContaining('/projects/project-1/members'),
      expect.objectContaining({ method: 'POST' }),
    )
  })

  it('adds a member with the default member role and refreshes the list', async () => {
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
      {
        method: 'POST',
        path: '/projects/project-1/members/new-user',
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
            userId: 'new-user',
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

    const addMemberForm = await screen.findByRole('form', {
      name: 'Add member',
    })
    const userIdInput = within(addMemberForm).getByRole('textbox', {
      name: 'User ID',
    })

    await user.type(userIdInput, ' new-user ')
    await user.click(
      within(addMemberForm).getByRole('button', { name: 'Add Member' }),
    )

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/projects/project-1/members/new-user'),
        expect.objectContaining({
          method: 'POST',
        }),
      ),
    )
    expect(
      await screen.findByRole('row', {
        name: /new-user Role for new-userMember Remove/,
      }),
    ).toBeInTheDocument()
    expect(userIdInput).toHaveValue('')
  })

  it('shows add member errors without clearing the entered user ID', async () => {
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
      {
        method: 'POST',
        path: '/projects/project-1/members/new-user',
        body: { message: 'Member could not be invited.' },
        status: 409,
      },
    ])
    const user = userEvent.setup()

    renderProjectDetail('/projects/project-1/members')

    const addMemberForm = await screen.findByRole('form', {
      name: 'Add member',
    })
    const userIdInput = within(addMemberForm).getByRole('textbox', {
      name: 'User ID',
    })

    await user.type(userIdInput, 'new-user')
    await user.click(
      within(addMemberForm).getByRole('button', { name: 'Add Member' }),
    )

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Member could not be invited.',
    )
    expect(userIdInput).toHaveValue('new-user')
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

    const roleSelector = await screen.findByRole('combobox', {
      name: 'Role for user-member',
    })

    await user.selectOptions(roleSelector, 'admin')

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/projects/project-1/members/user-member'),
        expect.objectContaining({
          body: JSON.stringify({ role: 'admin' }),
          method: 'PUT',
        }),
      ),
    )
    await waitFor(() => expect(roleSelector).toHaveValue('admin'))
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

    const roleSelector = await screen.findByRole('combobox', {
      name: 'Role for user-member',
    })

    await user.selectOptions(roleSelector, 'admin')

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Role change rejected.',
    )
    expect(roleSelector).toHaveValue('member')
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
      await screen.findByRole('button', { name: 'Remove user-member' }),
    )

    const dialog = screen.getByRole('dialog', { name: 'Remove member' })
    expect(
      within(dialog).getByText('Remove this member from the project?'),
    ).toBeInTheDocument()

    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }))

    expect(
      screen.queryByRole('dialog', { name: 'Remove member' }),
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
      await screen.findByRole('button', { name: 'Remove user-member' }),
    )

    const dialog = screen.getByRole('dialog', { name: 'Remove member' })
    await user.click(within(dialog).getByRole('button', { name: 'Remove' }))

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/projects/project-1/members/user-member'),
        expect.objectContaining({ method: 'DELETE' }),
      ),
    )
    await waitFor(() =>
      expect(
        screen.queryByRole('button', { name: 'Remove user-member' }),
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
      await screen.findByRole('button', { name: 'Remove user-member' }),
    )
    await user.click(
      within(screen.getByRole('dialog', { name: 'Remove member' })).getByRole(
        'button',
        { name: 'Remove' },
      ),
    )

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Member removal rejected.',
    )
    expect(
      screen.getByRole('button', { name: 'Remove user-member' }),
    ).toBeInTheDocument()
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
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /^Remove / }),
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

    expect(screen.getByRole('heading', { name: 'Members' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Members' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(screen.getByRole('link', { name: 'Secrets' })).not.toHaveAttribute(
      'aria-current',
    )
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

import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  mockFetchSequence,
  renderProjectDetail,
} from '../testUtils/projectPageTestUtils'

vi.mock('../../../../shared/hooks/useAuth', () => ({
  useAuth: () => ({
    getAccessTokenSilently: vi.fn().mockResolvedValue('test-token'),
  }),
}))

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('ProjectDetailPage', () => {
  const projectDetails = {
    id: 'project-1',
    name: 'Production secrets',
    description: 'Credentials for production services',
    createdAt: '2025-02-01T10:00:00Z',
  }

  it('shows project details', async () => {
    mockFetchSequence([
      {
        path: '/projects/project-1',
        body: projectDetails,
      },
    ])

    renderProjectDetail()

    expect(
      await screen.findByRole('heading', { name: 'Production secrets' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Credentials for production services'),
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Secrets' })).toBeInTheDocument()
  })

  it('shows project section navigation on the secrets route', async () => {
    mockFetchSequence([
      {
        path: '/projects/project-1',
        body: projectDetails,
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
    expect(
      screen.getByText('Vault entries and controls will appear here.'),
    ).toBeInTheDocument()
  })

  it('renders the members route directly', async () => {
    mockFetchSequence([
      {
        path: '/projects/project-1',
        body: projectDetails,
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
    expect(await screen.findByText('No members yet')).toBeInTheDocument()
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
            userId: 'user-owner',
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
          {
            userId: 'user-member',
            displayName: null,
            role: 'member',
            isCurrentUser: false,
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
    const adminRow = within(membersTable).getByRole('row', {
      name: /Alex Admin Role for Alex AdminAdmin Remove/,
    })
    const memberRow = within(membersTable).getByRole('row', {
      name: /user-member Role for user-memberMember Remove/,
    })

    expect(ownerRow).toBeInTheDocument()
    expect(within(ownerRow).queryByRole('button')).not.toBeInTheDocument()
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

  it('disables member controls for read-only members', async () => {
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
            displayName: 'Morgan Member',
            role: 'member',
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
    ])

    renderProjectDetail('/projects/project-1/members')

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Members could not load',
    )
    expect(screen.getByText('Members service failed.')).toBeInTheDocument()
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

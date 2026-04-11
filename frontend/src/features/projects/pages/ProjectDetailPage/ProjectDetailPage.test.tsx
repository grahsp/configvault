import { screen } from '@testing-library/react'
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
    expect(
      screen.getByText('Project access and role controls will appear here.'),
    ).toBeInTheDocument()
  })

  it('shows the active project section after navigating tabs', async () => {
    const user = userEvent.setup()

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

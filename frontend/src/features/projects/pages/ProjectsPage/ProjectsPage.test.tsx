import { screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ProjectsPage } from './ProjectsPage'
import {
  mockFetchSequence,
  renderWithRouter,
} from '../testUtils/projectPageTestUtils'

vi.mock('../../../../shared/hooks/useAuth', () => ({
  useAuth: () => ({
    getAccessTokenSilently: vi.fn().mockResolvedValue('test-token'),
  }),
}))

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('ProjectsPage', () => {
  it('shows the loading state while projects are loading', () => {
    vi.stubGlobal('fetch', vi.fn(() => new Promise<Response>(() => undefined)))

    renderWithRouter({ children: <ProjectsPage /> })

    expect(screen.getByRole('status')).toHaveTextContent('Loading projects')
  })

  it('shows the empty state when there are no projects', async () => {
    mockFetchSequence([{ path: '/projects', body: [] }])

    renderWithRouter({ children: <ProjectsPage /> })

    expect(await screen.findByText('No projects yet')).toBeInTheDocument()
    expect(screen.getByText('Create your first project')).toBeInTheDocument()
  })

  it('shows loaded projects', async () => {
    mockFetchSequence([
      {
        path: '/projects',
        body: [
          {
            id: 'old-project',
            name: 'Older project',
            createdAt: '2025-01-01T10:00:00Z',
          },
          {
            id: 'new-project',
            name: 'Newest project',
            createdAt: '2025-02-01T10:00:00Z',
          },
        ],
      },
    ])

    renderWithRouter({ children: <ProjectsPage /> })

    const projects = await screen.findByRole('list', { name: 'Projects' })
    const projectLinks = within(projects).getAllByRole('link')

    expect(projectLinks[0]).toHaveTextContent('Newest project')
    expect(projectLinks[0]).toHaveAttribute('href', '/projects/new-project')
    expect(projectLinks[1]).toHaveTextContent('Older project')
  })

  it('shows an error state when projects cannot load', async () => {
    mockFetchSequence([
      {
        path: '/projects',
        body: { message: 'The workspace is unavailable.' },
        status: 500,
      },
    ])

    renderWithRouter({ children: <ProjectsPage /> })

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Projects could not load',
    )
    expect(screen.getByText('The workspace is unavailable.')).toBeInTheDocument()
  })
})

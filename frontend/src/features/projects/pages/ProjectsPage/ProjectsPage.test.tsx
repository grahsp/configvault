import { screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ProjectsPage } from './ProjectsPage'
import {
  mockFetchSequence,
  renderWithRouter,
} from './ProjectsPage.testUtils'

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
    expect(within(projects).queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument()
  })

  it('renders the header CTA with shadcn primary classes', async () => {
    mockFetchSequence([{ path: '/projects', body: [] }])

    renderWithRouter({ children: <ProjectsPage /> })

    const cta = await screen.findByRole('button', { name: '+ New Project' })

    expect(cta).toHaveAttribute('data-variant', 'default')
    expect(cta).toHaveClass('bg-primary')
    expect(cta).toHaveClass('text-primary-foreground')
  })

  it('renders the sort trigger with the default creation date descending selection', async () => {
    mockFetchSequence([{ path: '/projects', body: [] }])

    renderWithRouter({ children: <ProjectsPage /> })

    const sortTrigger = await screen.findByRole('button', {
      name: /project sort: newest to oldest/i,
    })

    expect(sortTrigger).toHaveAttribute('data-variant', 'outline')
    expect(sortTrigger).toHaveClass('border-border')
    expect(sortTrigger).toHaveClass('bg-background')
    expect(sortTrigger).not.toHaveClass('sm:w-72')
  })

  it('renders a themed search input', async () => {
    mockFetchSequence([{ path: '/projects', body: [] }])

    renderWithRouter({ children: <ProjectsPage /> })

    const searchInput = await screen.findByRole('searchbox', {
      name: 'Search projects',
    })
    const searchWrapper = searchInput.parentElement

    expect(searchInput).toHaveAttribute('placeholder', 'Search for a project')
    expect(searchInput).toHaveClass('rounded-[var(--radius-md-lg)]')
    expect(searchInput).toHaveClass('bg-background')
    expect(searchInput).toHaveClass('pl-10')
    expect(searchInput).toHaveClass('h-10')
    expect(searchWrapper).toHaveClass('md:w-[20rem]')
    expect(searchWrapper).toHaveClass('lg:w-[22rem]')
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

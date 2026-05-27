import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

function getProjectHrefs() {
  return screen
    .getAllByRole('link')
    .map((link) => link.getAttribute('href'))
}

describe('ProjectsPage actions', () => {
  it('changes sorting from the sort menu', async () => {
    mockFetchSequence([
      {
        path: '/projects',
        body: [
          {
            id: 'gamma-project',
            name: 'Gamma',
            createdAt: '2025-01-03T10:00:00Z',
          },
          {
            id: 'alpha-project',
            name: 'Alpha',
            createdAt: '2025-01-01T10:00:00Z',
          },
          {
            id: 'beta-project',
            name: 'Beta',
            createdAt: '2025-01-02T10:00:00Z',
          },
        ],
      },
    ])
    const user = userEvent.setup()

    renderWithRouter({ children: <ProjectsPage /> })

    await screen.findByRole('list', { name: 'Projects' })

    expect(getProjectHrefs()).toEqual([
      '/projects/gamma-project',
      '/projects/beta-project',
      '/projects/alpha-project',
    ])

    await user.click(
      screen.getByRole('button', { name: /project sort: newest to oldest/i }),
    )
    await user.click(screen.getByRole('menuitem', { name: 'Ascending (A-Z)' }))

    expect(getProjectHrefs()).toEqual([
      '/projects/alpha-project',
      '/projects/beta-project',
      '/projects/gamma-project',
    ])

    await user.click(screen.getByRole('button', { name: /project sort: ascending \(a-z\)/i }))
    await user.click(screen.getByRole('menuitem', { name: 'Descending (Z-A)' }))

    expect(getProjectHrefs()).toEqual([
      '/projects/gamma-project',
      '/projects/beta-project',
      '/projects/alpha-project',
    ])

    await user.click(
      screen.getByRole('button', { name: /project sort: descending \(z-a\)/i }),
    )
    await user.click(screen.getByRole('menuitem', { name: 'Oldest to Newest' }))

    expect(getProjectHrefs()).toEqual([
      '/projects/alpha-project',
      '/projects/beta-project',
      '/projects/gamma-project',
    ])

    await user.click(screen.getByRole('button', { name: /project sort: oldest to newest/i }))
    await user.click(screen.getByRole('menuitem', { name: 'Newest to Oldest' }))

    expect(getProjectHrefs()).toEqual([
      '/projects/gamma-project',
      '/projects/beta-project',
      '/projects/alpha-project',
    ])
  })

  it('keeps undated projects after dated ones when sorting by creation date', async () => {
    mockFetchSequence([
      {
        path: '/projects',
        body: [
          {
            id: 'undated-project',
            name: 'Undated',
          },
          {
            id: 'dated-project',
            name: 'Dated',
            createdAt: '2025-01-01T10:00:00Z',
          },
        ],
      },
    ])
    const user = userEvent.setup()

    renderWithRouter({ children: <ProjectsPage /> })

    await screen.findByRole('list', { name: 'Projects' })

    expect(getProjectHrefs()).toEqual([
      '/projects/dated-project',
      '/projects/undated-project',
    ])

    await user.click(
      screen.getByRole('button', { name: /project sort: newest to oldest/i }),
    )
    await user.click(screen.getByRole('menuitem', { name: 'Oldest to Newest' }))

    expect(getProjectHrefs()).toEqual([
      '/projects/dated-project',
      '/projects/undated-project',
    ])
  })

  it('filters projects from the search input using names and descriptions', async () => {
    mockFetchSequence([
      {
        path: '/projects',
        body: [
          {
            id: 'alpha-project',
            name: 'Alpha',
            description: 'Production secrets',
            createdAt: '2025-01-01T10:00:00Z',
          },
          {
            id: 'beta-project',
            name: 'Beta',
            description: 'Staging access',
            createdAt: '2025-01-02T10:00:00Z',
          },
        ],
      },
    ])
    const user = userEvent.setup()

    renderWithRouter({ children: <ProjectsPage /> })

    await screen.findByRole('list', { name: 'Projects' })

    await user.type(
      screen.getByRole('searchbox', { name: 'Search projects' }),
      'production',
    )

    expect(getProjectHrefs()).toEqual(['/projects/alpha-project'])
    expect(screen.queryByRole('link', { name: /beta/i })).not.toBeInTheDocument()
  })

  it('shows a search-specific empty state when no projects match', async () => {
    mockFetchSequence([
      {
        path: '/projects',
        body: [
          {
            id: 'alpha-project',
            name: 'Alpha',
            createdAt: '2025-01-01T10:00:00Z',
          },
        ],
      },
    ])
    const user = userEvent.setup()

    renderWithRouter({ children: <ProjectsPage /> })

    await screen.findByRole('list', { name: 'Projects' })
    await user.type(
      screen.getByRole('searchbox', { name: 'Search projects' }),
      'does not exist',
    )

    expect(screen.getByText('No matching projects')).toBeInTheDocument()
    expect(
      screen.getByText(/No projects matched "does not exist"/i),
    ).toBeInTheDocument()
  })

  it('validates the create modal, submits, and navigates to the new project', async () => {
    const fetchMock = mockFetchSequence([
      { path: '/projects', body: [] },
      { method: 'POST', path: '/projects', body: { id: 'created-project' } },
    ])
    const user = userEvent.setup()

    renderWithRouter({ children: <ProjectsPage /> })

    await user.click(await screen.findByText('Create your first project'))

    const dialog = screen.getByRole('dialog', { name: 'Create project' })
    const createButton = within(dialog).getByRole('button', { name: 'Create' })

    expect(createButton).toBeDisabled()

    await user.type(within(dialog).getByLabelText('Project name'), '   ')
    expect(createButton).toBeDisabled()

    await user.clear(within(dialog).getByLabelText('Project name'))
    await user.type(within(dialog).getByLabelText('Project name'), 'New vault')
    await user.type(
      within(dialog).getByLabelText('Description'),
      'Shared deployment credentials',
    )
    await user.click(createButton)

    await waitFor(() =>
      expect(screen.getByTestId('location')).toHaveTextContent(
        '/projects/created-project',
      ),
    )

    const createCall = fetchMock.mock.calls.find(
      ([, init]) => init?.method === 'POST',
    )

    expect(createCall?.[1]?.body).toBe(
      JSON.stringify({
        name: 'New vault',
        description: 'Shared deployment credentials',
      }),
    )
  })

  it('shows structured validation errors from the API', async () => {
    mockFetchSequence([
      { path: '/projects', body: [] },
      {
        method: 'POST',
        path: '/projects',
        status: 400,
        body: {
          title: 'One or more validation errors occurred.',
          status: 400,
          errors: {
            Name: ['Project name is required.'],
          },
        },
      },
    ])
    const user = userEvent.setup()

    renderWithRouter({ children: <ProjectsPage /> })

    await user.click(await screen.findByText('Create your first project'))

    const dialog = screen.getByRole('dialog', { name: 'Create project' })
    await user.type(within(dialog).getByLabelText('Project name'), 'New vault')
    await user.click(within(dialog).getByRole('button', { name: 'Create' }))

    expect(await within(dialog).findByRole('alert')).toHaveTextContent(
      'Project name is required.',
    )
    expect(screen.getByLabelText('Project name')).toHaveAttribute(
      'aria-invalid',
      'true',
    )
  })

  it('closes the create modal from cancel actions', async () => {
    mockFetchSequence([{ path: '/projects', body: [] }])
    const user = userEvent.setup()

    renderWithRouter({ children: <ProjectsPage /> })

    await user.click(await screen.findByText('Create your first project'))
    const dialog = screen.getByRole('dialog', { name: 'Create project' })

    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }))
    expect(
      screen.queryByRole('dialog', { name: 'Create project' }),
    ).not.toBeInTheDocument()
  })

  it('renders create modal actions with shadcn semantic button classes', async () => {
    mockFetchSequence([{ path: '/projects', body: [] }])
    const user = userEvent.setup()

    renderWithRouter({ children: <ProjectsPage /> })

    await user.click(await screen.findByText('Create your first project'))

    const dialog = screen.getByRole('dialog', { name: 'Create project' })
    const cancelButton = within(dialog).getByRole('button', { name: 'Cancel' })
    const createButton = within(dialog).getByRole('button', { name: 'Create' })

    expect(cancelButton).toHaveAttribute('data-variant', 'outline')
    expect(cancelButton).toHaveClass('border-border')
    expect(cancelButton).toHaveClass('bg-background')

    expect(createButton).toHaveAttribute('data-variant', 'default')
    expect(createButton).toHaveClass('bg-primary')
    expect(createButton).toHaveClass('text-primary-foreground')
  })

  it('keeps create modal controls disabled while the mutation is pending', async () => {
    const createResponse = createDeferredResponse()
    const user = userEvent.setup()

    mockFetchSequence([
      { path: '/projects', body: [] },
      { method: 'POST', path: '/projects', response: createResponse.response },
    ])

    renderWithRouter({ children: <ProjectsPage /> })

    await user.click(await screen.findByText('Create your first project'))
    const dialog = screen.getByRole('dialog', { name: 'Create project' })

    await user.type(within(dialog).getByLabelText('Project name'), 'New vault')
    await user.click(within(dialog).getByRole('button', { name: 'Create' }))

    expect(within(dialog).getByRole('button', { name: 'Creating' })).toBeDisabled()
    expect(within(dialog).getByRole('button', { name: 'Cancel' })).toBeDisabled()

    createResponse.resolve(jsonResponse({ id: 'created-project' }))

    await waitFor(() =>
      expect(screen.getByTestId('location')).toHaveTextContent(
        '/projects/created-project',
      ),
    )
  })

  it('renders loaded rows without a delete action', async () => {
    mockFetchSequence([
      {
        path: '/projects',
        body: [
          {
            id: 'read-only-project',
            name: 'Read only project',
            createdAt: '2025-01-01T10:00:00Z',
          },
        ],
      },
    ])

    renderWithRouter({ children: <ProjectsPage /> })

    const projects = await screen.findByRole('list', { name: 'Projects' })
    expect(within(projects).queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument()
    expect(
      screen.queryByRole('alertdialog', { name: 'Delete project' }),
    ).not.toBeInTheDocument()
  })
})

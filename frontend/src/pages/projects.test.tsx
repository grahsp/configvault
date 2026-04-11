import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import {
  createMemoryRouter,
  RouterProvider,
  useLocation,
} from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ProjectDetailPage } from './ProjectDetailPage'
import { ProjectsPage } from './ProjectsPage'

vi.mock('../auth/useAuth', () => ({
  useAuth: () => ({
    getAccessTokenSilently: vi.fn().mockResolvedValue('test-token'),
  }),
}))

type MockRoute = {
  body?: unknown
  method?: string
  path: string
  status?: number
}

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  })
}

function LocationProbe() {
  const location = useLocation()

  return <p data-testid="location">{location.pathname}</p>
}

function renderWithRouter({
  children,
  initialPath = '/projects',
}: {
  children: ReactNode
  initialPath?: string
}) {
  const queryClient = createTestQueryClient()
  const router = createMemoryRouter(
    [
      {
        path: '/projects',
        element: children,
      },
      {
        path: '/projects/:projectId',
        element: <LocationProbe />,
      },
    ],
    {
      initialEntries: [initialPath],
    },
  )

  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}

function renderProjectDetail(initialPath = '/projects/project-1') {
  const queryClient = createTestQueryClient()
  const router = createMemoryRouter(
    [
      {
        path: '/projects/:projectId',
        element: <ProjectDetailPage />,
      },
      {
        path: '/projects',
        element: <LocationProbe />,
      },
    ],
    {
      initialEntries: [initialPath],
    },
  )

  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: {
      'Content-Type': 'application/json',
    },
    status,
  })
}

function emptyResponse(status = 204) {
  return new Response(null, { status })
}

function getRequestPath(input: RequestInfo | URL) {
  const url = input instanceof Request ? input.url : input.toString()

  return new URL(url, window.location.origin).pathname
}

function mockFetchSequence(routes: MockRoute[]) {
  const pendingRoutes = [...routes]
  const fetchMock = vi.fn(
    async (input: RequestInfo | URL, init?: RequestInit) => {
      const method = init?.method ?? 'GET'
      const path = getRequestPath(input)
      const matchingRouteIndex = pendingRoutes.findIndex(
        (route) =>
          route.path === path &&
          (route.method ?? 'GET') === method.toUpperCase(),
      )

      if (matchingRouteIndex === -1) {
        throw new Error(`Unexpected ${method} request to ${path}`)
      }

      const [route] = pendingRoutes.splice(matchingRouteIndex, 1)
      const status = route.status ?? 200

      if (status === 204) {
        return emptyResponse()
      }

      return jsonResponse(route.body, status)
    },
  )

  vi.stubGlobal('fetch', fetchMock)

  return fetchMock
}

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

  it('confirms before deleting a project', async () => {
    const fetchMock = mockFetchSequence([
      {
        path: '/projects',
        body: [
          {
            id: 'delete-me',
            name: 'Delete me',
            createdAt: '2025-01-01T10:00:00Z',
          },
        ],
      },
      { method: 'DELETE', path: '/projects/delete-me', status: 204 },
      { path: '/projects', body: [] },
    ])
    const user = userEvent.setup()

    renderWithRouter({ children: <ProjectsPage /> })

    const item = await screen.findByText('Delete me')
    await user.click(
      within(item.closest('li')!).getByRole('button', { name: 'Delete' }),
    )

    let dialog = screen.getByRole('dialog', { name: 'Delete project' })
    expect(dialog).toHaveTextContent('Delete Delete me?')

    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }))
    expect(
      screen.queryByRole('dialog', { name: 'Delete project' }),
    ).not.toBeInTheDocument()
    expect(fetchMock.mock.calls.some(([, init]) => init?.method === 'DELETE')).toBe(
      false,
    )

    await user.click(
      within(item.closest('li')!).getByRole('button', { name: 'Delete' }),
    )
    dialog = screen.getByRole('dialog', { name: 'Delete project' })
    await user.click(within(dialog).getByRole('button', { name: 'Delete' }))

    await waitFor(() =>
      expect(
        fetchMock.mock.calls.some(([, init]) => init?.method === 'DELETE'),
      ).toBe(true),
    )
    expect(await screen.findByText('No projects yet')).toBeInTheDocument()
  })
})

describe('ProjectDetailPage', () => {
  it('shows project details', async () => {
    mockFetchSequence([
      {
        path: '/projects/project-1',
        body: {
          id: 'project-1',
          name: 'Production secrets',
          description: 'Credentials for production services',
          createdAt: '2025-02-01T10:00:00Z',
        },
      },
    ])

    renderProjectDetail()

    expect(
      await screen.findByRole('heading', { name: 'Production secrets' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Credentials for production services'),
    ).toBeInTheDocument()
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

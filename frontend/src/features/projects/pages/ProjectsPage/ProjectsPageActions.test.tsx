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

describe('ProjectsPage actions', () => {
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
    expect(
      fetchMock.mock.calls.some(([, init]) => init?.method === 'DELETE'),
    ).toBe(false)

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

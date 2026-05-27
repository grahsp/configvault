import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Toaster } from '../../../../components/ui/sonner.tsx'
import { CurrentUserContext } from '../../../users/model/currentUserContext.ts'
import { InvitationPage } from './InvitationPage.tsx'

const authMocks = vi.hoisted(() => ({
  getAccessTokenSilently: vi.fn().mockResolvedValue('test-token'),
  isAuthenticated: false,
  isLoading: false,
  login: vi.fn().mockResolvedValue(undefined),
}))

const refreshCurrentUser = vi.fn().mockResolvedValue(undefined)

vi.mock('../../../../shared/hooks/useAuth.ts', () => ({
  useAuth: () => authMocks,
}))

afterEach(() => {
  authMocks.getAccessTokenSilently.mockResolvedValue('test-token')
  authMocks.isAuthenticated = false
  authMocks.isLoading = false
  authMocks.login.mockReset().mockResolvedValue(undefined)
  refreshCurrentUser.mockReset().mockResolvedValue(undefined)
  vi.unstubAllGlobals()
})

function renderInvitationPage(initialPath: string) {
  const router = createMemoryRouter(
    [
      {
        path: '/',
        children: [
          {
            path: 'invitations/:token',
            element: <InvitationPage />,
          },
          {
            path: 'projects/:projectId',
            element: <p>Project page</p>,
          },
        ],
      },
    ],
    {
      initialEntries: [initialPath],
    },
  )

  const queryClient = new QueryClient({
    defaultOptions: {
      mutations: { retry: false },
      queries: { retry: false },
    },
  })

  return {
    ...render(
      <QueryClientProvider client={queryClient}>
        <CurrentUserContext.Provider
          value={{
            error: undefined,
            isLoading: false,
            refreshCurrentUser,
            user: undefined,
          }}
        >
          <RouterProvider router={router} />
          <Toaster />
        </CurrentUserContext.Provider>
      </QueryClientProvider>,
    ),
    router,
  }
}

describe('InvitationPage', () => {
  it('redirects unauthenticated visitors through login while preserving the invite URL', async () => {
    renderInvitationPage('/invitations/invite-token')

    await waitFor(() => {
      expect(authMocks.login).toHaveBeenCalledWith({
        returnTo: '/invitations/invite-token',
      })
    })
  })

  it('accepts the invitation and redirects to the invited project', async () => {
    authMocks.isAuthenticated = true

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ projectId: 'project-1' }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    )

    vi.stubGlobal('fetch', fetchMock)

    const { router } = renderInvitationPage('/invitations/invite-token')

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1)
    })

    expect(fetchMock.mock.calls[0]?.[0].toString()).toContain(
      '/invitations/accept/invite-token',
    )

    await waitFor(() => {
      expect(refreshCurrentUser).toHaveBeenCalledTimes(1)
      expect(router.state.location.pathname).toBe('/projects/project-1')
    })
  })

  it('shows the invalid invitation state when accept returns not found', async () => {
    authMocks.isAuthenticated = true

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            title: 'Invitation not found',
            detail: 'The invitation is invalid or has expired.',
          }),
          {
            status: 404,
            headers: {
              'Content-Type': 'application/json',
            },
          },
        ),
      ),
    )

    renderInvitationPage('/invitations/invite-token')

    expect(
      await screen.findByText('The invitation is invalid or has expired.'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Invitation is no longer valid'),
    ).toBeInTheDocument()
  })
})

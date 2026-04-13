import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider, useLocation } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  ActivationRoute,
  ProtectedRoute,
} from '../../auth/components/ProtectedRoute'
import { CurrentUserProvider } from '../../auth/context/CurrentUserProvider'
import {
  mockFetchSequence,
  type MockRoute,
} from '../../projects/pages/testUtils/projectPageTestUtils'
import { ActivatePage } from './ActivatePage'

const auth0Mock = vi.hoisted(() => ({
  getAccessTokenSilently: vi.fn().mockResolvedValue('test-token'),
  isAuthenticated: true,
  isLoading: false,
  loginWithRedirect: vi.fn(),
  logout: vi.fn(),
}))

vi.mock('@auth0/auth0-react', () => ({
  useAuth0: () => auth0Mock,
}))

afterEach(() => {
  vi.clearAllMocks()
  vi.unstubAllGlobals()
})

describe('ActivatePage', () => {
  it('refreshes the current user before navigating to projects', async () => {
    const user = userEvent.setup()
    const fetchMock = mockFetchSequence([
      currentUserRoute('Pending', ''),
      { method: 'POST', path: '/users/activate', status: 204 },
      currentUserRoute('Active', 'Ada Lovelace'),
    ])

    renderActivationRoute()

    await user.type(await screen.findByLabelText('Display name'), 'Ada Lovelace')
    await user.click(screen.getByRole('button', { name: 'Activate' }))

    await waitFor(() =>
      expect(screen.getByTestId('location')).toHaveTextContent('/projects'),
    )
    expect(fetchMock).toHaveBeenCalledTimes(3)
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('/users/activate'),
      expect.objectContaining({
        body: JSON.stringify({ displayName: 'Ada Lovelace' }),
        method: 'POST',
      }),
    )
  })
})

function renderActivationRoute() {
  const router = createMemoryRouter(
    [
      {
        path: '/activate',
        element: (
          <ActivationRoute>
            <ActivatePage />
          </ActivationRoute>
        ),
      },
      {
        path: '/projects',
        element: (
          <ProtectedRoute>
            <LocationProbe />
          </ProtectedRoute>
        ),
      },
    ],
    {
      initialEntries: ['/activate'],
    },
  )

  return render(
    <CurrentUserProvider>
      <RouterProvider router={router} />
    </CurrentUserProvider>,
  )
}

function currentUserRoute(status: 'Pending' | 'Active', displayName: string) {
  return {
    path: '/me',
    body: {
      id: 'user-1',
      email: 'user@example.com',
      displayName,
      status,
    },
  } satisfies MockRoute
}

function LocationProbe() {
  const location = useLocation()

  return <p data-testid="location">{location.pathname}</p>
}

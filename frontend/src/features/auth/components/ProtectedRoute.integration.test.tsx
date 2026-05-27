import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { CurrentUserProvider } from '../../users'
import { ProtectedRoute } from './ProtectedRoute'

const auth0Mock = vi.hoisted(() => ({
  error: undefined,
  getAccessTokenSilently: vi.fn(),
  isAuthenticated: false,
  isLoading: false,
  loginWithRedirect: vi.fn(),
  logout: vi.fn(),
  user: undefined,
}))

vi.mock('@auth0/auth0-react', () => ({
  useAuth0: () => auth0Mock,
}))

vi.mock('@/features/auth/config', () => ({
  authConfig: {
    clientId: 'client-id',
    domain: 'example.auth0.com',
    redirectUri: 'http://localhost:3000',
  },
}))

describe('ProtectedRoute consent recovery', () => {
  afterEach(() => {
    vi.clearAllMocks()
    vi.unstubAllGlobals()
    auth0Mock.error = undefined
    auth0Mock.isAuthenticated = false
    auth0Mock.isLoading = false
    auth0Mock.user = undefined
    window.history.replaceState({}, '', '/')
  })

  it('keeps the user on /projects and starts interactive auth instead of navigating home', async () => {
    window.history.replaceState({}, '', '/projects')
    auth0Mock.loginWithRedirect.mockResolvedValue(undefined)

    render(
      <MemoryRouter initialEntries={['/projects']}>
        <CurrentUserProvider>
          <Routes>
            <Route path="/" element={<p>Home destination</p>} />
            <Route
              path="/projects"
              element={
                <ProtectedRoute>
                  <p>Projects destination</p>
                </ProtectedRoute>
              }
            />
          </Routes>
        </CurrentUserProvider>
      </MemoryRouter>,
    )

    await waitFor(() =>
      expect(auth0Mock.loginWithRedirect).toHaveBeenCalledWith({
        appState: { returnTo: '/projects' },
        authorizationParams: undefined,
      }),
    )

    expect(screen.getByRole('status')).toHaveTextContent(/loading/i)
    expect(screen.queryByText('Home destination')).not.toBeInTheDocument()
    expect(screen.queryByText('Projects destination')).not.toBeInTheDocument()
  })
})

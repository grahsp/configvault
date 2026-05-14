import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AppLayout } from '../../../layouts/AppLayout'
import { CurrentUserContext } from '../../users'
import { ProtectedRoute } from './ProtectedRoute'

const useAuthMock = vi.hoisted(() => vi.fn())

vi.mock('../../../shared/hooks/useAuth', () => ({
  useAuth: () => useAuthMock(),
}))

afterEach(() => {
  vi.clearAllMocks()
  useAuthMock.mockReset()
  window.history.replaceState({}, '', '/')
})

describe('ProtectedRoute', () => {
  it('renders the shared page loader while auth is loading', () => {
    useAuthMock.mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
      getAccessTokenSilentlySafe: vi.fn(),
      login: vi.fn(),
      logout: vi.fn(),
      signup: vi.fn(),
    })

    render(
      <CurrentUserContext.Provider
        value={{
          user: undefined,
          isLoading: false,
          error: undefined,
          refreshCurrentUser: async () => undefined,
        }}
      >
        <MemoryRouter initialEntries={['/projects']}>
          <Routes>
            <Route element={<AppLayout />} path="/">
              <Route
                path="projects"
                element={
                  <ProtectedRoute>
                    <p>Projects content</p>
                  </ProtectedRoute>
                }
              />
            </Route>
          </Routes>
        </MemoryRouter>
      </CurrentUserContext.Provider>,
    )

    expect(screen.getByRole('link', { name: 'KeyVault' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Projects' })).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent(/loading/i)
    expect(screen.queryByText('Projects content')).not.toBeInTheDocument()
  })

  it('starts interactive login for unauthenticated users and preserves returnTo', async () => {
    const login = vi.fn().mockResolvedValue(undefined)
    window.history.replaceState({}, '', '/projects')

    useAuthMock.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      getAccessTokenSilentlySafe: vi.fn(),
      login,
      logout: vi.fn(),
      signup: vi.fn(),
    })

    render(
      <MemoryRouter initialEntries={['/projects']}>
        <Routes>
          <Route
            path="/"
            element={<p>Home destination</p>}
          />
          <Route
            path="/projects"
            element={
              <ProtectedRoute>
                <p>Projects</p>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>,
    )

    await waitFor(() =>
      expect(login).toHaveBeenCalledWith({ returnTo: '/projects' }),
    )

    expect(screen.getByRole('status')).toHaveTextContent(/loading/i)
    expect(screen.queryByText('Home destination')).not.toBeInTheDocument()
    expect(screen.queryByText('Projects')).not.toBeInTheDocument()
  })

  it('renders children for authenticated users', () => {
    useAuthMock.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      getAccessTokenSilentlySafe: vi.fn(),
      login: vi.fn(),
      logout: vi.fn(),
      signup: vi.fn(),
    })

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <p>Projects</p>
        </ProtectedRoute>
      </MemoryRouter>,
    )

    expect(screen.getByText('Projects')).toBeInTheDocument()
  })
})

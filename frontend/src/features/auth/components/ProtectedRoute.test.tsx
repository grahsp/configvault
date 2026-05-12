import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AppLayout } from '../../../app/AppLayout'
import { CurrentUserContext } from '../../users'
import type { CurrentUser } from '../../users'
import { ProtectedRoute } from './ProtectedRoute'

const auth0Mock = vi.hoisted(() => ({
  isAuthenticated: true,
  isLoading: false,
}))

const useAuthMock = vi.hoisted(() => vi.fn())

vi.mock('@auth0/auth0-react', () => ({
  useAuth0: () => auth0Mock,
}))

vi.mock('../../../shared/hooks/useAuth', () => ({
  useAuth: () => useAuthMock(),
}))

afterEach(() => {
  vi.clearAllMocks()
  auth0Mock.isAuthenticated = true
  auth0Mock.isLoading = false
  useAuthMock.mockReset()
})

describe('ProtectedRoute', () => {
  it('renders the shared page loader while auth is loading', () => {
    auth0Mock.isLoading = true
    useAuthMock.mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
      login: vi.fn(),
      logout: vi.fn(),
      signup: vi.fn(),
    })

    render(
      <MemoryRouter initialEntries={['/projects']}>
        <CurrentUserContext.Provider
          value={{
            user: {
              displayName: 'Ada Lovelace',
              email: 'ada@example.com',
              id: 'user-1',
            },
            isLoading: false,
            error: undefined,
            refreshCurrentUser: async () => undefined,
          }}
        >
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
        </CurrentUserContext.Provider>
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'KeyVault' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Projects' })).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent(/loading/i)
    expect(screen.queryByText('Projects content')).not.toBeInTheDocument()
  })

  it('redirects unauthenticated users to the home page', () => {
    auth0Mock.isAuthenticated = false
    useAuthMock.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      signup: vi.fn(),
    })

    render(
      <MemoryRouter initialEntries={['/projects']}>
        <CurrentUserContext.Provider
          value={{
            user: undefined,
            isLoading: false,
            error: undefined,
            refreshCurrentUser: async () => undefined,
          }}
        >
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
        </CurrentUserContext.Provider>
      </MemoryRouter>,
    )

    expect(screen.getByText('Home destination')).toBeInTheDocument()
    expect(screen.queryByText('Projects')).not.toBeInTheDocument()
  })

  it('keeps showing the page loader until current user data is ready', () => {
    useAuthMock.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      signup: vi.fn(),
    })

    render(
      <MemoryRouter>
        <CurrentUserContext.Provider
          value={{
            user: undefined,
            isLoading: true,
            error: undefined,
            refreshCurrentUser: async () => undefined,
          }}
        >
          <ProtectedRoute>
            <p>Projects</p>
          </ProtectedRoute>
        </CurrentUserContext.Provider>
      </MemoryRouter>,
    )

    expect(screen.getByRole('status')).toHaveTextContent(/loading/i)
    expect(screen.queryByText('Projects')).not.toBeInTheDocument()
  })

  it('renders children for an authenticated active user without redirecting to activation', () => {
    useAuthMock.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      signup: vi.fn(),
    })

    renderWithCurrentUser(
      {
        displayName: 'Ada Lovelace',
        email: 'ada@example.com',
        id: 'user-1',
      },
      <ProtectedRoute>
        <p>Projects</p>
      </ProtectedRoute>,
    )

    expect(screen.getByText('Projects')).toBeInTheDocument()
  })
})

function renderWithCurrentUser(user: CurrentUser, children: ReactNode) {
  return render(
    <MemoryRouter>
      <CurrentUserContext.Provider
        value={{
          user,
          isLoading: false,
          error: undefined,
          refreshCurrentUser: async () => user,
        }}
      >
        {children}
      </CurrentUserContext.Provider>
    </MemoryRouter>,
  )
}

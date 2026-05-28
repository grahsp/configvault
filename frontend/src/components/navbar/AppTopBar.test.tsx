import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { SidebarProvider } from '@/components/ui/sidebar'
import { ThemeProvider, THEME_STORAGE_KEY } from '@/features/theme'
import { CurrentUserContext } from '@/features/users'
import type { CurrentUserContextValue } from '@/features/users/model/currentUserContext'
import { AppTopBar } from './AppTopBar'

const useAuthMock = vi.hoisted(() => vi.fn())

vi.mock('@/features/auth/hooks', () => ({
  useAuth: () => useAuthMock(),
}))

describe('AppTopBar', () => {
  afterEach(() => {
    useAuthMock.mockReset()
    window.localStorage.clear()
    document.documentElement.classList.remove('light', 'dark')
  })

  it('renders mobile navigation context and utility actions', () => {
    renderTopBar({
      initialPath: '/projects/project-1/secrets?environmentId=env-1',
    })

    expect(
      screen.getByRole('button', { name: /open workspace navigation/i }),
    ).toBeInTheDocument()
    expect(screen.getByText('Secrets')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /switch to dark theme/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /open account menu/i })).toBeInTheDocument()
  })

  it('toggles the app theme from the top bar', async () => {
    const user = userEvent.setup()

    renderTopBar()
    await user.click(screen.getByRole('button', { name: /switch to dark theme/i }))

    expect(document.documentElement).toHaveClass('dark')
    expect(document.documentElement).not.toHaveClass('light')
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark')
    expect(screen.getByRole('button', { name: /switch to light theme/i })).toBeInTheDocument()
  })

  it('shows display name and email in the account dropdown header', async () => {
    const user = userEvent.setup()

    renderTopBar()
    await user.click(screen.getByRole('button', { name: /open account menu/i }))

    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument()
    expect(screen.getByText('ada@example.com')).toBeInTheDocument()
  })

  it('falls back to auth0 values in the account dropdown header', async () => {
    const user = userEvent.setup()

    renderTopBar({
      auth: {
        user: {
          name: 'Grace Hopper',
          email: 'grace@example.com',
          picture: 'https://example.com/grace.png',
        },
      },
      currentUser: {
        user: {
          id: 'user-1',
          email: null,
          displayName: null,
        },
      },
    })

    await user.click(screen.getByRole('button', { name: /open account menu/i }))
    expect(screen.getByText('Grace Hopper')).toBeInTheDocument()
    expect(screen.getByText('grace@example.com')).toBeInTheDocument()
  })

  it('opens the account menu with Account and Log out actions', async () => {
    const user = userEvent.setup()

    renderTopBar()
    await user.click(screen.getByRole('button', { name: /open account menu/i }))

    expect(screen.getByRole('menuitem', { name: 'Account' })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'Log out' })).toBeInTheDocument()
  })

  it('navigates to profile from the Account action', async () => {
    const user = userEvent.setup()

    renderTopBar()
    await user.click(screen.getByRole('button', { name: /open account menu/i }))
    await user.click(screen.getByRole('menuitem', { name: 'Account' }))

    expect(screen.getByTestId('location')).toHaveTextContent('/profile')
  })

  it('calls logout from the Log out action', async () => {
    const user = userEvent.setup()
    const logout = vi.fn()

    renderTopBar({
      auth: {
        logout,
      },
    })

    await user.click(screen.getByRole('button', { name: /open account menu/i }))
    await user.click(screen.getByRole('menuitem', { name: 'Log out' }))

    expect(logout).toHaveBeenCalledTimes(1)
  })

  it('renders unauthenticated auth actions in the top bar', () => {
    renderTopBar({
      auth: {
        isAuthenticated: false,
      },
      currentUser: {
        user: undefined,
      },
    })

    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument()
    expect(screen.queryByTestId('account-menu-skeleton')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /open account menu/i })).not.toBeInTheDocument()
  })

  it('renders a skeleton account trigger while auth is loading', () => {
    renderTopBar({
      auth: {
        isLoading: true,
      },
      currentUser: {
        isLoading: false,
      },
    })

    expect(screen.getByTestId('account-menu-skeleton')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /open account menu/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /log in/i })).not.toBeInTheDocument()
  })

  it('renders the account menu while current user data is still loading', () => {
    renderTopBar({
      currentUser: {
        user: undefined,
        isLoading: true,
        error: undefined,
      },
      auth: {
        user: {
          name: 'Grace Hopper',
          email: 'grace@example.com',
        },
      },
    })

    expect(screen.queryByTestId('account-menu-skeleton')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /open account menu/i })).toBeInTheDocument()
  })
})

function renderTopBar({
  auth,
  currentUser,
  initialPath = '/projects',
}: {
  auth?: Partial<AuthMock>
  currentUser?: Partial<CurrentUserContextValue>
  initialPath?: string
} = {}) {
  useAuthMock.mockReturnValue(createAuthMock(auth))

  return render(
    <ThemeProvider>
      <CurrentUserContext.Provider value={createCurrentUserValue(currentUser)}>
        <MemoryRouter initialEntries={[initialPath]}>
          <Routes>
            <Route
              path="*"
              element={
                <SidebarProvider>
                  <AppTopBar />
                  <LocationDisplay />
                </SidebarProvider>
              }
            />
          </Routes>
        </MemoryRouter>
      </CurrentUserContext.Provider>
    </ThemeProvider>,
  )
}

function LocationDisplay() {
  const location = useLocation()
  return <p data-testid="location">{location.pathname}</p>
}

type AuthMock = {
  isAuthenticated: boolean
  isLoading: boolean
  login: ReturnType<typeof vi.fn>
  logout: ReturnType<typeof vi.fn>
  signup: ReturnType<typeof vi.fn>
  user: {
    email?: string
    name?: string
    picture?: string
  }
}

function createAuthMock(overrides?: Partial<AuthMock>): AuthMock {
  return {
    isAuthenticated: true,
    isLoading: false,
    login: vi.fn(),
    logout: vi.fn(),
    signup: vi.fn(),
    user: {},
    ...overrides,
  }
}

function createCurrentUserValue(
  overrides?: Partial<CurrentUserContextValue>,
): CurrentUserContextValue {
  return {
    user: {
      id: 'user-1',
      email: 'ada@example.com',
      displayName: 'Ada Lovelace',
    },
    isLoading: false,
    error: undefined,
    refreshCurrentUser: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  }
}

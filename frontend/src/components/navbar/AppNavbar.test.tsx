import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { CurrentUserContext } from '../../features/users'
import type { CurrentUserContextValue } from '../../features/users/model/currentUserContext'
import { AppNavbar } from './AppNavbar'

const useAuthMock = vi.hoisted(() => vi.fn())

vi.mock('../../shared/hooks/useAuth', () => ({
  useAuth: () => useAuthMock(),
}))

describe('AppNavbar', () => {
  afterEach(() => {
    useAuthMock.mockReset()
  })

  it('renders a single avatar trigger for authenticated users', () => {
    renderNavbar()

    expect(screen.getByRole('button', { name: /open account menu/i })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Profile' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /log out/i })).not.toBeInTheDocument()
  })

  it('shows display name and email in the dropdown header', async () => {
    const user = userEvent.setup()
    renderNavbar()

    await user.click(screen.getByRole('button', { name: /open account menu/i }))
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument()
    expect(screen.getByText('ada@example.com')).toBeInTheDocument()
  })

  it('falls back to auth0 values in the dropdown header', async () => {
    const user = userEvent.setup()

    renderNavbar({
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

  it('opens the menu with Account and Log out actions', async () => {
    const user = userEvent.setup()

    renderNavbar()
    await user.click(screen.getByRole('button', { name: /open account menu/i }))

    expect(screen.getByRole('menuitem', { name: 'Account' })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'Log out' })).toBeInTheDocument()
  })

  it('navigates to profile from the Account action', async () => {
    const user = userEvent.setup()

    renderNavbar()
    await user.click(screen.getByRole('button', { name: /open account menu/i }))
    await user.click(screen.getByRole('menuitem', { name: 'Account' }))

    expect(screen.getByTestId('location')).toHaveTextContent('/profile')
  })

  it('calls logout from the Log out action', async () => {
    const user = userEvent.setup()
    const logout = vi.fn()

    renderNavbar({
      auth: {
        logout,
      },
    })

    await user.click(screen.getByRole('button', { name: /open account menu/i }))
    await user.click(screen.getByRole('menuitem', { name: 'Log out' }))

    expect(logout).toHaveBeenCalledTimes(1)
  })

  it('keeps unauthenticated actions unchanged', () => {
    renderNavbar({
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

  it('renders a skeleton trigger while auth is loading', () => {
    renderNavbar({
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

  it('renders the account menu immediately while current user data is still loading', () => {
    renderNavbar({
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

function renderNavbar({
  auth,
  currentUser,
}: {
  auth?: Partial<AuthMock>
  currentUser?: Partial<CurrentUserContextValue>
} = {}) {
  useAuthMock.mockReturnValue(createAuthMock(auth))

  const currentUserValue = createCurrentUserValue(currentUser)

  return render(
    <CurrentUserContext.Provider value={currentUserValue}>
      <MemoryRouter initialEntries={['/projects']}>
        <Routes>
          <Route
            path="*"
            element={
              <>
                <AppNavbar />
                <LocationDisplay />
              </>
            }
          />
          <Route path="/profile" element={<LocationDisplay />} />
        </Routes>
      </MemoryRouter>
    </CurrentUserContext.Provider>,
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

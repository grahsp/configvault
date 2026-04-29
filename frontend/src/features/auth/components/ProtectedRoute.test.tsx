import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { CurrentUserContext } from '../../users'
import type { CurrentUser } from '../../users'
import { ProtectedRoute } from './ProtectedRoute'

const auth0Mock = vi.hoisted(() => ({
  isAuthenticated: true,
  isLoading: false,
}))

vi.mock('@auth0/auth0-react', () => ({
  useAuth0: () => auth0Mock,
}))

afterEach(() => {
  vi.clearAllMocks()
})

describe('ProtectedRoute', () => {
  it('renders children for an authenticated active user without redirecting to activation', () => {
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

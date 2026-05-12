import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { LandingPage } from './LandingPage'

const useAuthMock = vi.hoisted(() => vi.fn())

vi.mock('../../shared/hooks/useAuth', () => ({
  useAuth: () => useAuthMock(),
}))

describe('LandingPage', () => {
  afterEach(() => {
    useAuthMock.mockReset()
  })

  it('renders the developer landing page for unauthenticated users', () => {
    const login = vi.fn()
    const signup = vi.fn()

    useAuthMock.mockReturnValue({
      error: undefined,
      isAuthenticated: false,
      isLoading: false,
      login,
      signup,
    })

    render(
      <MemoryRouter initialEntries={['/']}>
        <LandingPage />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', {
        name: /one place for all your app secrets/i,
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', {
        name: /start for free/i,
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/no setup required • encrypted at rest • project-scoped access/i),
    ).toBeInTheDocument()
    expect(screen.queryByText(/future dashboard preview/i)).not.toBeInTheDocument()
  })

  it('shows authenticated landing actions when a signed-in user reaches the page content', () => {
    useAuthMock.mockReturnValue({
      error: undefined,
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      signup: vi.fn(),
    })

    render(
      <MemoryRouter initialEntries={['/']}>
        <LandingPage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: /start for free/i })).toHaveAttribute(
      'href',
      '/projects',
    )
    expect(screen.getByRole('link', { name: /log in/i })).toHaveAttribute('href', '/profile')
  })

  it('renders the landing page content while auth is loading', () => {
    useAuthMock.mockReturnValue({
      error: undefined,
      isAuthenticated: false,
      isLoading: true,
      login: vi.fn(),
      signup: vi.fn(),
    })

    render(
      <MemoryRouter initialEntries={['/']}>
        <LandingPage />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', { name: /one place for all your app secrets/i }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /start for free/i })).toBeInTheDocument()
  })
})

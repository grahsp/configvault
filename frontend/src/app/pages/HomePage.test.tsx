import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { HomePage } from './HomePage'

const useAuthMock = vi.hoisted(() => vi.fn())

vi.mock('../../shared/hooks/useAuth', () => ({
  useAuth: () => useAuthMock(),
}))

describe('HomePage', () => {
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
        <HomePage />
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

  it('redirects authenticated users to projects', () => {
    useAuthMock.mockReturnValue({
      error: undefined,
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      signup: vi.fn(),
    })

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/projects" element={<p>Projects destination</p>} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText(/projects destination/i)).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: /one place for all your app secrets/i }),
    ).not.toBeInTheDocument()
  })

  it('renders the shared page loader while auth is loading', () => {
    useAuthMock.mockReturnValue({
      error: undefined,
      isAuthenticated: false,
      isLoading: true,
      login: vi.fn(),
      signup: vi.fn(),
    })

    render(
      <MemoryRouter initialEntries={['/']}>
        <HomePage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('status')).toHaveTextContent(/loading/i)
    expect(screen.getByRole('link', { name: 'KeyVault' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Projects' })).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: /one place for all your app secrets/i }),
    ).not.toBeInTheDocument()
  })
})

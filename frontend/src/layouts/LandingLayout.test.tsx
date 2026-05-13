import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { LandingLayout } from './LandingLayout'

const useAuthMock = vi.hoisted(() => vi.fn())

vi.mock('../shared/hooks/useAuth', () => ({
  useAuth: () => useAuthMock(),
}))

describe('LandingLayout', () => {
  afterEach(() => {
    useAuthMock.mockReset()
  })

  it('renders the landing shell for unauthenticated users', () => {
    useAuthMock.mockReturnValue({
      error: undefined,
      isAuthenticated: false,
      isLoading: false,
      login: vi.fn(),
      signup: vi.fn(),
    })

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<LandingLayout />} path="/">
            <Route element={<p>Landing content</p>} index />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'KeyVault' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Projects' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /get started/i })).toBeInTheDocument()
    expect(screen.getByText(/landing content/i)).toBeInTheDocument()
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
          <Route element={<LandingLayout />} path="/" />
          <Route element={<p>Projects destination</p>} path="/projects" />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText(/projects destination/i)).toBeInTheDocument()
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
        <Routes>
          <Route element={<LandingLayout />} path="/">
            <Route element={<p>Landing content</p>} index />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByRole('status')).toHaveTextContent(/loading/i)
    expect(screen.getByRole('link', { name: 'KeyVault' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Projects' })).not.toBeInTheDocument()
    expect(screen.queryByText(/landing content/i)).not.toBeInTheDocument()
  })

  it('renders the auth error above the outlet content', () => {
    useAuthMock.mockReturnValue({
      error: new Error('Auth unavailable'),
      isAuthenticated: false,
      isLoading: false,
      login: vi.fn(),
      signup: vi.fn(),
    })

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<LandingLayout />} path="/">
            <Route element={<p>Landing content</p>} index />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByRole('alert')).toHaveTextContent(/auth unavailable/i)
    expect(screen.getByText(/landing content/i)).toBeInTheDocument()
  })
})

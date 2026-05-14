import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { CurrentUserProvider } from './CurrentUserProvider'
import { useCurrentUser } from './useCurrentUser'

const auth0Mock = vi.hoisted(() => ({
  error: undefined,
  getAccessTokenSilently: vi.fn(),
  isAuthenticated: true,
  isLoading: false,
  loginWithRedirect: vi.fn(),
  logout: vi.fn(),
  user: undefined,
}))

vi.mock('@auth0/auth0-react', () => ({
  useAuth0: () => auth0Mock,
}))

vi.mock('../../../shared/utils/authConfig', () => ({
  authConfig: {
    clientId: 'client-id',
    domain: 'example.auth0.com',
    redirectUri: 'http://localhost:3000',
  },
}))

function TestConsumer() {
  const { error, isLoading, refreshCurrentUser, user } = useCurrentUser()

  return (
    <div>
      <p data-testid="loading">{isLoading ? 'loading' : 'idle'}</p>
      <p data-testid="user">{user?.email ?? 'none'}</p>
      <p data-testid="error">{error?.message ?? 'none'}</p>
      <button
        onClick={() => {
          void refreshCurrentUser().catch(() => undefined)
        }}
        type="button"
      >
        Refresh
      </button>
    </div>
  )
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: {
      'Content-Type': 'application/json',
    },
    status,
  })
}

describe('CurrentUserProvider', () => {
  afterEach(() => {
    vi.clearAllMocks()
    vi.unstubAllGlobals()
    auth0Mock.error = undefined
    auth0Mock.isAuthenticated = true
    auth0Mock.isLoading = false
    auth0Mock.user = undefined
    window.history.replaceState({}, '', '/')
  })

  it('does not load the current user until refreshCurrentUser is called', () => {
    auth0Mock.getAccessTokenSilently.mockResolvedValue('test-token')
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    render(
      <CurrentUserProvider>
        <TestConsumer />
      </CurrentUserProvider>,
    )

    expect(screen.getByTestId('loading')).toHaveTextContent('idle')
    expect(screen.getByTestId('user')).toHaveTextContent('none')
    expect(screen.getByTestId('error')).toHaveTextContent('none')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('loads the current user when refreshCurrentUser succeeds', async () => {
    const user = userEvent.setup()

    auth0Mock.getAccessTokenSilently.mockResolvedValue('test-token')
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(() =>
        Promise.resolve(
          jsonResponse({
            displayName: 'Ada Lovelace',
            email: 'ada@example.com',
            id: 'user-1',
          }),
        ),
      ),
    )

    render(
      <CurrentUserProvider>
        <TestConsumer />
      </CurrentUserProvider>,
    )

    await user.click(screen.getByRole('button', { name: 'Refresh' }))

    await waitFor(() =>
      expect(screen.getByTestId('user')).toHaveTextContent('ada@example.com'),
    )

    expect(screen.getByTestId('loading')).toHaveTextContent('idle')
    expect(screen.getByTestId('error')).toHaveTextContent('none')
  })

  it('surfaces token errors from manual refresh', async () => {
    const user = userEvent.setup()
    auth0Mock.getAccessTokenSilently.mockRejectedValue(
      new Error('Silent Authentication Failed'),
    )
    vi.stubGlobal('fetch', vi.fn())

    render(
      <CurrentUserProvider>
        <TestConsumer />
      </CurrentUserProvider>,
    )

    await user.click(screen.getByRole('button', { name: 'Refresh' }))

    await waitFor(() =>
      expect(screen.getByTestId('error')).toHaveTextContent(
        'Silent Authentication Failed',
      ),
    )

    expect(screen.getByTestId('loading')).toHaveTextContent('idle')
  })

  it('clears user state when the session becomes unauthenticated', async () => {
    const user = userEvent.setup()

    auth0Mock.getAccessTokenSilently.mockResolvedValue('test-token')
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(() =>
        Promise.resolve(
          jsonResponse({
            displayName: 'Ada Lovelace',
            email: 'ada@example.com',
            id: 'user-1',
          }),
        ),
      ),
    )

    const view = render(
      <CurrentUserProvider>
        <TestConsumer />
      </CurrentUserProvider>,
    )

    await user.click(screen.getByRole('button', { name: 'Refresh' }))
    await waitFor(() =>
      expect(screen.getByTestId('user')).toHaveTextContent('ada@example.com'),
    )

    auth0Mock.isAuthenticated = false
    view.rerender(
      <CurrentUserProvider>
        <TestConsumer />
      </CurrentUserProvider>,
    )

    await waitFor(() =>
      expect(screen.getByTestId('user')).toHaveTextContent('none'),
    )
    expect(screen.getByTestId('loading')).toHaveTextContent('idle')
    expect(screen.getByTestId('error')).toHaveTextContent('none')
  })
})

import { render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { ReactNode } from 'react'
import { AuthProvider } from './AuthProvider'
import type { AuthRedirectState } from '../utils/authRedirectState'

interface MockAuth0ProviderProps {
  children?: ReactNode
  cacheLocation?: string
  onRedirectCallback?: (appState?: AuthRedirectState) => void
  useRefreshTokens?: boolean
  useRefreshTokensFallback?: boolean
}

const { auth0ProviderMock } = vi.hoisted(() => ({
  auth0ProviderMock: vi.fn(({ children }: MockAuth0ProviderProps) => children),
}))

vi.mock('@auth0/auth0-react', () => ({
  Auth0Provider: auth0ProviderMock,
}))

vi.mock('../../../shared/utils/authConfig', () => ({
  authConfig: {
    clientId: 'client-id',
    domain: 'example.auth0.com',
    redirectUri: 'http://localhost:3000',
  },
  authAuthorizationParams: {
    redirect_uri: 'http://localhost:3000',
  },
}))

describe('AuthProvider', () => {
  afterEach(() => {
    auth0ProviderMock.mockClear()
  })

  function mockLocation() {
    const replace = vi.fn()
    const originalLocation = window.location

    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {
        ...originalLocation,
        origin: 'http://localhost:3000',
        pathname: '/',
        search: '',
        replace,
      },
    })

    return {
      originalLocation,
      replace,
      restore() {
        Object.defineProperty(window, 'location', {
          configurable: true,
          value: originalLocation,
        })
      },
    }
  }

  it('restores the requested route after login with a real navigation', () => {
    const location = mockLocation()

    try {
      render(
        <AuthProvider>
          <div>app</div>
        </AuthProvider>,
      )

      const props = auth0ProviderMock.mock.calls[0]?.[0]
      expect(props).toBeDefined()
      expect(props?.useRefreshTokens).toBe(true)
      expect(props?.useRefreshTokensFallback).toBe(false)
      expect(props?.cacheLocation).toBe('localstorage')
      expect(props?.onRedirectCallback).toBeTypeOf('function')

      props!.onRedirectCallback!({
        returnTo: '/projects/project-123?tab=members',
      })

      expect(location.replace).toHaveBeenCalledWith('/projects/project-123?tab=members')
    } finally {
      location.restore()
    }
  })

  it('defaults plain sign-in callbacks to the projects page', () => {
    const location = mockLocation()

    try {
      render(
        <AuthProvider>
          <div>app</div>
        </AuthProvider>,
      )

      const props = auth0ProviderMock.mock.calls[0]?.[0]
      expect(props).toBeDefined()
      expect(props?.useRefreshTokens).toBe(true)
      expect(props?.useRefreshTokensFallback).toBe(false)
      expect(props?.cacheLocation).toBe('localstorage')
      expect(props?.onRedirectCallback).toBeTypeOf('function')

      props!.onRedirectCallback!(undefined)

      expect(location.replace).toHaveBeenCalledWith('/projects')
    } finally {
      location.restore()
    }
  })
})

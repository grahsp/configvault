/* eslint-disable react-refresh/only-export-components */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import { Navigate, createMemoryRouter, RouterProvider, useLocation } from 'react-router-dom'
import { vi } from 'vitest'
import { Toaster } from '../../../../components/ui/sonner'
import { AppLayout } from '../../../../layouts/AppLayout'
import { CurrentUserContext } from '../../../users/model/currentUserContext'
import { SecretsPage } from '../../secrets/pages'
import { MembersPage } from '../../members/pages'
import { ProjectSettingsPage } from '../ProjectSettingsPage'
import { ProjectDetailPage } from './ProjectDetailPage'

export type MockRoute = {
  body?: unknown
  method?: string
  path: string
  response?: Promise<Response> | Response
  status?: number
}

const defaultProjectsResponse = [
  {
    id: 'project-1',
    name: 'Production secrets',
    description: 'Credentials for production services',
  },
  {
    id: 'project-2',
    name: 'Staging secrets',
    description: 'Credentials for staging services',
  },
]

function LocationProbe() {
  const location = useLocation()

  return <p data-testid="location">{location.pathname}</p>
}

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  })
}

function ensurePointerCapturePolyfill() {
  if (!HTMLElement.prototype.hasPointerCapture) {
    HTMLElement.prototype.hasPointerCapture = () => false
  }

  if (!HTMLElement.prototype.setPointerCapture) {
    HTMLElement.prototype.setPointerCapture = () => undefined
  }

  if (!HTMLElement.prototype.releasePointerCapture) {
    HTMLElement.prototype.releasePointerCapture = () => undefined
  }

  if (!HTMLElement.prototype.scrollIntoView) {
    HTMLElement.prototype.scrollIntoView = () => undefined
  }

  if (!window.ResizeObserver) {
    window.ResizeObserver = class ResizeObserver {
      disconnect() {
        return undefined
      }

      observe() {
        return undefined
      }

      unobserve() {
        return undefined
      }
    }
  }
}

function renderProjectDetailResult(router: ReturnType<typeof createMemoryRouter>) {
  const queryClient = createTestQueryClient()
  ensurePointerCapturePolyfill()

  return {
    ...render(
      <QueryClientProvider client={queryClient}>
        <CurrentUserContext.Provider
          value={{
            user: undefined,
            isLoading: false,
            error: undefined,
            refreshCurrentUser: async () => undefined,
          }}
        >
          <RouterProvider router={router} />
          <Toaster />
        </CurrentUserContext.Provider>
      </QueryClientProvider>,
    ),
    router,
  }
}

export function renderProjectDetail(initialPath = '/projects/project-1') {
  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: <AppLayout />,
        children: [
          {
            path: 'projects/:projectId',
            element: <ProjectDetailPage />,
            children: [
              {
                index: true,
                element: <Navigate to="secrets" replace />,
              },
              {
                path: 'secrets',
                element: <SecretsPage />,
              },
              {
                path: 'members',
                element: <MembersPage />,
              },
              {
                path: 'settings',
                element: <ProjectSettingsPage />,
              },
            ],
          },
        ],
      },
      {
        path: '/projects',
        element: <LocationProbe />,
      },
    ],
    {
      initialEntries: [initialPath],
    },
  )

  return renderProjectDetailResult(router)
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: {
      'Content-Type': 'application/json',
    },
    status,
  })
}

function emptyResponse(status = 204) {
  return new Response(null, { status })
}

function getRequestUrl(input: RequestInfo | URL) {
  const url = input instanceof Request ? input.url : input.toString()

  return new URL(url, window.location.origin)
}

export function mockFetchSequence(routes: MockRoute[]) {
  const pendingRoutes = [...routes]
  const fetchMock = vi.fn(
    async (input: RequestInfo | URL, init?: RequestInit) => {
      const method = init?.method ?? 'GET'
      const requestUrl = getRequestUrl(input)
      const path = `${requestUrl.pathname}${requestUrl.search}`
      const pathname = requestUrl.pathname
      const matchingRouteIndex = pendingRoutes.findIndex(
        (route) =>
          (route.path === path || route.path === pathname) &&
          (route.method ?? 'GET') === method.toUpperCase(),
      )

      if (matchingRouteIndex === -1) {
        if (pathname === '/projects' && method.toUpperCase() === 'GET') {
          return jsonResponse(defaultProjectsResponse)
        }

        throw new Error(`Unexpected ${method} request to ${path}`)
      }

      const [route] = pendingRoutes.splice(matchingRouteIndex, 1)

      if (route.response) {
        return route.response
      }

      const status = route.status ?? 200

      if (status === 204) {
        return emptyResponse()
      }

      return jsonResponse(route.body, status)
    },
  )

  vi.stubGlobal('fetch', fetchMock)

  return fetchMock
}

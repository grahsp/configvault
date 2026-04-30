import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import { Navigate, createMemoryRouter, RouterProvider, useLocation } from 'react-router-dom'
import { vi } from 'vitest'
import { ToastProvider } from '../../../../shared/components/toast/ToastProvider'
import { SecretsPage } from '../../secrets/pages'
import { MembersPage } from '../../members/pages'
import { GeneralPage } from './GeneralPage'
import { ProjectDetailPage } from './ProjectDetailPage'

export type MockRoute = {
  body?: unknown
  method?: string
  path: string
  response?: Promise<Response> | Response
  status?: number
}

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

function renderProjectDetailResult(router: ReturnType<typeof createMemoryRouter>) {
  const queryClient = createTestQueryClient()

  return {
    ...render(
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <RouterProvider router={router} />
        </ToastProvider>
      </QueryClientProvider>,
    ),
    router,
  }
}

export function renderProjectDetail(initialPath = '/projects/project-1') {
  const router = createMemoryRouter(
    [
      {
        path: '/projects/:projectId',
        element: <ProjectDetailPage />,
        children: [
          {
            index: true,
            element: <Navigate to="secrets" replace />,
          },
          {
            path: 'general',
            element: <GeneralPage />,
          },
          {
            path: 'secrets',
            element: <SecretsPage />,
          },
          {
            path: 'members',
            element: <MembersPage />,
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

function getRequestPath(input: RequestInfo | URL) {
  const url = input instanceof Request ? input.url : input.toString()

  return new URL(url, window.location.origin).pathname
}

export function mockFetchSequence(routes: MockRoute[]) {
  const pendingRoutes = [...routes]
  const fetchMock = vi.fn(
    async (input: RequestInfo | URL, init?: RequestInit) => {
      const method = init?.method ?? 'GET'
      const path = getRequestPath(input)
      const matchingRouteIndex = pendingRoutes.findIndex(
        (route) =>
          route.path === path &&
          (route.method ?? 'GET') === method.toUpperCase(),
      )

      if (matchingRouteIndex === -1) {
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

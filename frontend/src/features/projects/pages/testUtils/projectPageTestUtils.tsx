import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import type { ReactNode } from 'react'
import { Navigate, createMemoryRouter, RouterProvider } from 'react-router-dom'
import { vi } from 'vitest'
import { ToastProvider } from '../../../../shared/components/toast/ToastProvider'
import { ProjectSecretsPage } from '../../../config-items/pages/ProjectSecretsPage'
import { LocationProbe } from './LocationProbe.testComponent'
import { MembersPage } from '../MembersPage'
import { ProjectLayout } from '../ProjectLayout'

export type MockRoute = {
  body?: unknown
  method?: string
  path: string
  response?: Promise<Response> | Response
  status?: number
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

export function renderWithRouter({
  children,
  initialPath = '/projects',
}: {
  children: ReactNode
  initialPath?: string
}) {
  const queryClient = createTestQueryClient()
  const router = createMemoryRouter(
    [
      {
        path: '/projects',
        element: children,
      },
      {
        path: '/projects/:projectId',
        element: <LocationProbe />,
      },
    ],
    {
      initialEntries: [initialPath],
    },
  )

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
        element: <ProjectLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="secrets" replace />,
          },
          {
            path: 'secrets',
            element: <ProjectSecretsPage />,
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

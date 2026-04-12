import { Navigate, createBrowserRouter } from 'react-router-dom'
import { AppLayout } from './AppLayout'
import {
  ActivationRoute,
  ProtectedRoute,
} from '../features/auth/components/ProtectedRoute'
import { ProjectSecretsPage } from '../features/config-items/pages/ProjectSecretsPage'
import { MembersPage } from '../features/projects/pages/MembersPage'
import { ProjectLayout } from '../features/projects/pages/ProjectLayout'
import { ProjectsPage } from '../features/projects/pages/ProjectsPage/ProjectsPage'
import { ActivatePage } from '../features/users/pages/ActivatePage'
import { ProfilePage } from '../features/users/pages/ProfilePage'
import { HomePage } from './pages/HomePage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'projects',
        element: (
          <ProtectedRoute>
            <ProjectsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'projects/:projectId',
        element: (
          <ProtectedRoute>
            <ProjectLayout />
          </ProtectedRoute>
        ),
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
        path: 'profile',
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'activate',
        element: (
          <ActivationRoute>
            <ActivatePage />
          </ActivationRoute>
        ),
      },
    ],
  },
])

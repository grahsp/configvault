import { Navigate, createBrowserRouter } from 'react-router-dom'
import { AppLayout } from './AppLayout'
import { ProtectedRoute } from '../features/auth/components/ProtectedRoute'
import { ProjectSecretsPage } from '../features/config-items/pages/ProjectSecretsPage'
import { MembersPage } from '../features/projects/members/pages'
import { GeneralPage } from '../features/projects/pages/ProjectDetailPage'
import { ProjectLayout } from '../features/projects/pages/ProjectDetailPage'
import { ProjectsPage } from '../features/projects/pages/ProjectsPage/ProjectsPage'
import { ProfilePage } from '../features/users'
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
            path: 'general',
            element: <GeneralPage />,
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
    ],
  },
])

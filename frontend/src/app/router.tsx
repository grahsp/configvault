import { Navigate, createBrowserRouter } from 'react-router-dom'
import { AppLayout } from './AppLayout'
import { ProtectedRoute } from '../features/auth/components/ProtectedRoute'
import { SecretsPage } from '../features/config-items/pages'
import { MembersPage } from '../features/projects/members/pages'
import { GeneralPage } from '../features/projects/pages/ProjectDetailPage'
import { ProjectDetailPage } from '../features/projects/pages/ProjectDetailPage'
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
            <ProjectDetailPage />
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
            element: <SecretsPage />,
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

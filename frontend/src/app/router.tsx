import { Navigate, createBrowserRouter } from 'react-router-dom'
import { AppLayout } from './AppLayout'
import { ProtectedRoute } from '../features/auth/components/ProtectedRoute'
import { InvitationPage } from '../features/projects/invitations/pages'
import { SecretsPage } from '../features/projects/secrets'
import { MembersPage } from '../features/projects'
import { GeneralPage } from '../features/projects'
import { ProjectDetailPage } from '../features/projects'
import { ProjectsPage } from '../features/projects'
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
        path: 'invitations/:token',
        element: <InvitationPage />,
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

import { Navigate, createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '@/layouts/AppLayout'
import { ProtectedRoute } from '@/features/auth'
import { InvitationPage } from '@/features/projects/invitations/pages'
import { SecretsPage } from '@/features/projects/secrets'
import { MembersPage, ProjectSettingsPage } from '@/features/projects'
import { ProjectDetailPage } from '@/features/projects'
import { ProjectsPage } from '@/features/projects'
import { ProfilePage } from '@/features/users'

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
        <ProtectedRoute>
          <AppLayout />
        </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/projects" replace />,
      },
      {
        path: 'invitations/:token',
        element: <InvitationPage />,
      },
      {
        path: 'projects',
        element: <ProjectsPage />,
      },
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
      {
        path: 'profile',
        element: <ProfilePage />,
      },
    ],
  },
])
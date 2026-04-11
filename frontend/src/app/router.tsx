import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from './AppLayout'
import {
  ActivationRoute,
  ProtectedRoute,
} from '../features/auth/components/ProtectedRoute'
import { ProjectDetailPage } from '../features/projects/pages/ProjectDetailPage'
import { ProjectsPage } from '../features/projects/pages/ProjectsPage'
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
            <ProjectDetailPage />
          </ProtectedRoute>
        ),
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

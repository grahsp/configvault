import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from './AppLayout'
import { ActivationRoute, ProtectedRoute } from '../auth/ProtectedRoute'
import { ActivatePage } from '../pages/ActivatePage'
import { HomePage } from '../pages/HomePage'
import { ProfilePage } from '../pages/ProfilePage'
import { ProjectsPage } from '../pages/ProjectsPage'

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

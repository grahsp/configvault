import { StrictMode } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import './styles/index.css'
import { queryClient } from './api/queryClient'
import { router } from './app/router'
import { AuthProvider } from './features/auth/context/AuthProvider'
import { CurrentUserProvider } from './features/users'
import { ToastProvider } from './shared/components/toast/ToastProvider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CurrentUserProvider>
          <ToastProvider>
            <RouterProvider router={router} />
          </ToastProvider>
        </CurrentUserProvider>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)

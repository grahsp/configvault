import { StrictMode } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import './index.css'
import { queryClient } from './api/queryClient'
import { router } from './app/router'
import { AuthProvider } from './features/auth/context/AuthProvider'
import { CurrentUserProvider } from './features/auth/context/CurrentUserProvider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CurrentUserProvider>
          <RouterProvider router={router} />
        </CurrentUserProvider>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)

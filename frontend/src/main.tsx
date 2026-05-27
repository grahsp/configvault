import { StrictMode } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import './styles/globals.css'
import { queryClient } from './api/queryClient'
import { router } from './app/router'
import { Toaster } from './components/ui/sonner'
import { AuthProvider } from './features/auth/context/AuthProvider'
import { CurrentUserProvider } from './features/users'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CurrentUserProvider>
          <RouterProvider router={router} />
          <Toaster />
        </CurrentUserProvider>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)

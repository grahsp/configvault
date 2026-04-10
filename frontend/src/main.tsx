import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import './index.css'
import { router } from './app/router'
import { AuthProvider } from './auth/AuthProvider'
import { CurrentUserProvider } from './auth/CurrentUserProvider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <CurrentUserProvider>
        <RouterProvider router={router} />
      </CurrentUserProvider>
    </AuthProvider>
  </StrictMode>,
)

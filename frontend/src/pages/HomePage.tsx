import { Navigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'

export function HomePage() {
  const { error, isAuthenticated, isLoading } = useAuth()

  if (!isLoading && isAuthenticated) {
    return <Navigate replace to="/projects" />
  }

  return (
    <main className="home-page">
      {error ? (
        <section className="home-shell">
          <p className="hero-card__error" role="alert">
            Error: {error.message}
          </p>
        </section>
      ) : null}
    </main>
  )
}

import { Navigate } from 'react-router-dom'
import { useAuth } from '../../features/auth/hooks/useAuth'
import styles from './HomePage.module.css'

export function HomePage() {
  const { error, isAuthenticated, isLoading } = useAuth()

  if (!isLoading && isAuthenticated) {
    return <Navigate replace to="/projects" />
  }

  return (
    <main className={styles.page}>
      {error ? (
        <section className={styles.shell}>
          <p className={styles.error} role="alert">
            Error: {error.message}
          </p>
        </section>
      ) : null}
    </main>
  )
}

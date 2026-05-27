import { useEffect } from 'react'
import { useAuth } from '@/features/auth/hooks'
import { useCurrentUser } from '../../model'
import styles from './ProfilePage.module.css'

export function ProfilePage() {
  const { isAuthenticated } = useAuth()
  const { user, isLoading, error, refreshCurrentUser } = useCurrentUser()

  useEffect(() => {
    if (!isAuthenticated || user || isLoading || error) {
      return
    }

    void refreshCurrentUser().catch(() => {
      // Errors are exposed through context state.
    })
  }, [error, isAuthenticated, isLoading, refreshCurrentUser, user])

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <div className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Profile</p>
            <h1>User Profile</h1>
          </div>
        </div>

        {isLoading ? <p>Loading user data...</p> : null}

        {!isLoading && error ? (
          <p role="alert">Unable to load user data. Please try again.</p>
        ) : null}

        {!isLoading && !error && user ? (
          <dl className={styles.details}>
            <div className={styles.detailsRow}>
              <dt>User ID</dt>
              <dd>{user.id}</dd>
            </div>
            <div className={styles.detailsRow}>
              <dt>Email</dt>
              <dd>{user.email ?? 'Unavailable'}</dd>
            </div>
            <div className={styles.detailsRow}>
              <dt>Display name</dt>
              <dd>{user.displayName ?? 'Unavailable'}</dd>
            </div>
          </dl>
        ) : null}
      </section>
    </main>
  )
}

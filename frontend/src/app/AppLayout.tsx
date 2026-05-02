import { Link, Outlet } from 'react-router-dom'
import { useAuth } from '../shared/hooks/useAuth'
import { cx } from '../shared/utils/cx'
import styles from './AppLayout.module.css'

export function AppLayout() {
  const { isAuthenticated, isLoading, login, logout, signup } = useAuth()

  return (
    <div className={styles.shell}>
      <header className={styles.navbar}>
        <div className={styles.navbarInner}>
          <div className={styles.navbarStart}>
            <Link className={styles.brand} to={isAuthenticated ? '/projects' : '/'}>
              KeyVault
            </Link>
            <nav className={styles.nav} aria-label="Primary">
              <Link className={styles.navLink} to="/projects">
                Projects
              </Link>
            </nav>
          </div>

          <nav className={styles.actions} aria-label="Account">
            {!isLoading && isAuthenticated ? (
              <>
                <Link className={cx(styles.button, styles.buttonSecondary)} to="/profile">
                  Profile
                </Link>
                <button
                  className={cx(styles.button, styles.buttonPrimary)}
                  onClick={logout}
                  type="button"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  className={cx(styles.button, styles.buttonSecondary)}
                  onClick={() => login()}
                  type="button"
                >
                  Log in
                </button>
                <button
                  className={cx(styles.button, styles.buttonPrimary)}
                  onClick={() => signup()}
                  type="button"
                >
                  Register
                </button>
              </>
            )}
          </nav>
        </div>
      </header>

      <div className={styles.content}>
        <div className={styles.contentInner}>
          <Outlet />
        </div>
      </div>
    </div>
  )
}

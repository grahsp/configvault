import { Link } from 'react-router-dom'
import styles from '../../layouts/AppLayout.module.css'

type AppNavbarProps = {
  isAuthenticated: boolean
  isLoading: boolean
  login: () => void
  logout: () => void
  signup: () => void
}

export function AppNavbar({
  isAuthenticated,
  isLoading,
  login,
  logout,
  signup,
}: AppNavbarProps) {
  return (
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
              <Link className={styles.buttonSecondary} to="/profile">
                Profile
              </Link>
              <button className={styles.buttonPrimary} onClick={logout} type="button">
                Logout
              </button>
            </>
          ) : (
            <>
              <button className={styles.buttonSecondary} onClick={() => login()} type="button">
                Log in
              </button>
              <button className={styles.buttonPrimary} onClick={() => signup()} type="button">
                Register
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}

import { Link, Outlet } from 'react-router-dom'
import { useAuth } from '../features/auth/hooks/useAuth'

export function AppLayout() {
  const { isAuthenticated, isLoading, login, logout, signup } = useAuth()

  return (
    <div className="app-shell">
      <header className="app-navbar">
        <div className="app-navbar__inner">
          <div className="app-navbar__start">
            <Link className="app-navbar__brand" to={isAuthenticated ? '/projects' : '/'}>
              KeyVault
            </Link>
            <nav className="app-navbar__nav" aria-label="Primary">
              <Link className="app-navbar__link" to="/projects">
                Projects
              </Link>
            </nav>
          </div>

          <nav className="app-navbar__actions" aria-label="Account">
            {!isLoading && isAuthenticated ? (
              <>
                <Link className="button button--secondary" to="/profile">
                  Profile
                </Link>
                <button className="button button--primary" onClick={logout} type="button">
                  Logout
                </button>
              </>
            ) : (
              <>
                <button className="button button--secondary" onClick={login} type="button">
                  Log in
                </button>
                <button className="button button--primary" onClick={signup} type="button">
                  Register
                </button>
              </>
            )}
          </nav>
        </div>
      </header>

      <div className="app-content">
        <div className="app-content__inner">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

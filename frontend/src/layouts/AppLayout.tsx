import { Outlet } from 'react-router-dom'
import { AppNavbar } from '../components/navbar/AppNavbar'
import { useAuth } from '../shared/hooks/useAuth'
import styles from './AppLayout.module.css'

export function AppLayout() {
  const { isAuthenticated, isLoading, login, logout, signup } = useAuth()

  return (
    <div className={styles.shell}>
      <AppNavbar
        isAuthenticated={isAuthenticated}
        isLoading={isLoading}
        login={login}
        logout={logout}
        signup={signup}
      />

      <div className={styles.content}>
        <div className={styles.contentInner}>
          <Outlet />
        </div>
      </div>
    </div>
  )
}

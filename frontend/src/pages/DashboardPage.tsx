import { useAuth } from '../auth/useAuth'
import { useCurrentUser } from '../features/user/useCurrentUser'

export function DashboardPage() {
  const { logout } = useAuth()
  const user = useCurrentUser()

  return (
    <main>
      <p>Logged in as {user?.email ?? user?.name ?? 'Unknown user'}</p>
      <h1>User Profile</h1>
      <pre>{JSON.stringify(user, null, 2)}</pre>
      <button onClick={logout} type="button">
        Logout
      </button>
    </main>
  )
}

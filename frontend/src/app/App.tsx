import { useAuth } from '../auth/useAuth'
import { DashboardPage } from '../pages/DashboardPage'
import { HomePage } from '../pages/HomePage'

function App() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <main>Loading...</main>
  }

  return isAuthenticated ? <DashboardPage /> : <HomePage />
}

export default App

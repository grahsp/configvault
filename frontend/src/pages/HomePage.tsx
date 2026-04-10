import { useAuth } from '../auth/useAuth'

export function HomePage() {
  const { error, login, signup } = useAuth()

  return (
    <main>
      {error && <p>Error: {error.message}</p>}
      <button onClick={signup} type="button">
        Signup
      </button>
      <button onClick={login} type="button">
        Login
      </button>
    </main>
  )
}

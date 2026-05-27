import { Navigate, Outlet } from 'react-router-dom'
import { LandingNavbar } from '../components/navbar/LandingNavbar'
import { PageLoader } from '../components/composed/PageLoader'
import { useAuth } from '@/features/auth/hooks'

export function LandingLayout() {
  const { error, isAuthenticated, isLoading, login, signup } = useAuth()

  if (!isLoading && isAuthenticated) {
    return <Navigate replace to="/projects" />
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.16),_transparent_30%),linear-gradient(180deg,_#020617_0%,_#020817_38%,_#0f172a_100%)] text-slate-100">
      <header className="mx-auto max-w-6xl px-6 pt-5 sm:px-8 lg:px-10">
        <LandingNavbar onLogin={() => login()} onSignup={() => signup()} />
      </header>
      {error ? (
        <section className="mx-auto max-w-6xl px-6 pt-6 sm:px-8 lg:px-10">
          <p
            className="rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-100"
            role="alert"
          >
            Error: {error.message}
          </p>
        </section>
      ) : null}
      {isLoading ? (
        <section className="mx-auto max-w-6xl px-6 pb-24 pt-16 sm:px-8 sm:pb-28 lg:px-10 lg:pb-32">
          <PageLoader fullScreen={false} />
        </section>
      ) : (
        <Outlet />
      )}
    </main>
  )
}

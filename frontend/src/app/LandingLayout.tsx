import { Link, Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../shared/hooks/useAuth'
import { PageLoader } from '../shared/ui'

const buttonBaseClass =
  'inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300'
const primaryButtonClass = `${buttonBaseClass} bg-sky-400 text-slate-950 shadow-[0_16px_40px_rgba(56,189,248,0.28)] hover:-translate-y-0.5 hover:bg-sky-300`
const secondaryButtonClass = `${buttonBaseClass} border border-white/15 bg-white/5 text-slate-100 hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/10`

export function LandingLayout() {
  const { error, isAuthenticated, isLoading, login, signup } = useAuth()

  if (!isLoading && isAuthenticated) {
    return <Navigate replace to="/projects" />
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.16),_transparent_30%),linear-gradient(180deg,_#020617_0%,_#020817_38%,_#0f172a_100%)] text-slate-100">
      <header className="mx-auto max-w-6xl px-6 pt-5 sm:px-8 lg:px-10">
        <div className="flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-slate-950/70 px-5 py-4 shadow-[0_20px_40px_rgba(2,6,23,0.28)] backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
            <Link className="text-xl font-extrabold uppercase tracking-[0.08em] text-white" to="/">
              KeyVault
            </Link>
            <nav aria-label="Primary" className="flex flex-wrap gap-2">
              <Link
                className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-white/20 hover:bg-white/[0.08]"
                to="/projects"
              >
                Projects
              </Link>
            </nav>
          </div>
          <nav aria-label="Account" className="flex flex-wrap gap-3">
            <button className={secondaryButtonClass} onClick={() => login()} type="button">
              Log in
            </button>
            <button className={primaryButtonClass} onClick={() => signup()} type="button">
              Register
            </button>
          </nav>
        </div>
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

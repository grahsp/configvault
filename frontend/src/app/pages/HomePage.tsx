import { ArrowRight, EyeOff, GitBranch, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../shared/hooks/useAuth'

export function HomePage() {
  const { error, isAuthenticated, login, signup } = useAuth()

  const featureCards = [
    {
      title: 'Never mix up environments',
      description:
        'Separate development, staging, and production secrets without rollout confusion.',
      icon: GitBranch,
    },
    {
      title: 'Share access safely',
      description:
        'Collaborate with your team without passing credentials through chat or documents.',
      icon: Users,
    },
    {
      title: 'Expose secrets only when needed',
      description:
        'Reduce accidental leaks by keeping sensitive values hidden until explicitly revealed.',
      icon: EyeOff,
    },
  ] as const

  const buttonBaseClass =
    'inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300'
  const primaryButtonClass = `${buttonBaseClass} bg-sky-400 text-slate-950 shadow-[0_16px_40px_rgba(56,189,248,0.28)] hover:-translate-y-0.5 hover:bg-sky-300`
  const secondaryButtonClass = `${buttonBaseClass} border border-white/15 bg-white/5 text-slate-100 hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/10`

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.16),_transparent_30%),linear-gradient(180deg,_#020617_0%,_#020817_38%,_#0f172a_100%)] text-slate-100">
      <header className="mx-auto max-w-6xl px-6 pt-5 sm:px-8 lg:px-10">
        <div className="flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-slate-950/70 px-5 py-4 shadow-[0_20px_40px_rgba(2,6,23,0.28)] backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
            <Link
              className="text-xl font-extrabold uppercase tracking-[0.08em] text-white"
              to={isAuthenticated ? '/projects' : '/'}
            >
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
            {isAuthenticated ? (
              <>
                <Link className={secondaryButtonClass} to="/profile">
                  Profile
                </Link>
                <Link className={primaryButtonClass} to="/projects">
                  Open projects
                </Link>
              </>
            ) : (
              <>
                <button className={secondaryButtonClass} onClick={() => login()} type="button">
                  Log in
                </button>
                <button className={primaryButtonClass} onClick={() => signup()} type="button">
                  Register
                </button>
              </>
            )}
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
      <section className="mx-auto max-w-6xl px-6 pb-16 pt-24 sm:px-8 sm:pb-20 sm:pt-28 lg:px-10 lg:pb-24 lg:pt-32">
        <div className="max-w-2xl space-y-10 lg:space-y-12">
          <div className="space-y-6 lg:space-y-7">
            <h1 className="max-w-[12ch] text-5xl font-semibold leading-[0.98] tracking-[-0.04em] text-white sm:text-6xl lg:text-[4.5rem]">
              One place for all your app secrets.
            </h1>
            <p className="max-w-[38rem] text-sm leading-7 text-slate-400 sm:text-base">
              Built for small teams that want simple, project-scoped secret management
              without the overhead of enterprise tools.
            </p>
          </div>
          <div className="space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              {isAuthenticated ? (
                <>
                  <Link className={primaryButtonClass} to="/projects">
                    Start for Free
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link className={secondaryButtonClass} to="/profile">
                    Log in
                  </Link>
                </>
              ) : (
                <>
                  <button className={primaryButtonClass} onClick={() => signup()} type="button">
                    Start for Free
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <button className={secondaryButtonClass} onClick={() => login()} type="button">
                    Log in
                  </button>
                </>
              )}
            </div>
            <p className="text-sm text-slate-400">
              No setup required • Encrypted at rest • Project-scoped access
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24 sm:px-8 sm:pb-28 lg:px-10 lg:pb-32">
        <div className="grid gap-5 md:grid-cols-3 lg:gap-6">
          {featureCards.map(({ title, description, icon: Icon }) => (
            <article
              key={title}
              className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_16px_40px_rgba(15,23,42,0.28)] transition duration-200 hover:border-sky-300/30"
            >
              <Icon className="h-6 w-6 text-sky-300" />
              <h2 className="mt-8 text-xl font-semibold text-white">{title}</h2>
              <p className="mt-3 max-w-[26ch] text-sm leading-6 text-slate-300">{description}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}

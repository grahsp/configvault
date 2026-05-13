import { ArrowRight, EyeOff, GitBranch, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../shared/hooks/useAuth'

export function LandingPage() {
  const { isAuthenticated, signup } = useAuth()

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

  return (
    <>
      <section className="mx-auto max-w-6xl px-6 pb-16 pt-24 sm:px-8 sm:pb-20 sm:pt-28 lg:px-10 lg:pb-24 lg:pt-32">
        <div className="max-w-2xl space-y-10 lg:space-y-12">
          <div className="space-y-6 lg:space-y-7">
            <h1 className="max-w-[12ch] text-5xl font-semibold leading-[0.98] tracking-[-0.04em] text-white sm:text-6xl lg:text-[4.5rem]">
              One place for all your app secrets.
            </h1>
            <p className="max-w-[38rem] text-sm leading-7 text-slate-400 sm:text-base">
              Built for small teams that want simple, project-scoped secret management without
              the overhead of enterprise tools.
            </p>
          </div>
          <div className="space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              {isAuthenticated ? (
                <Link className={primaryButtonClass} to="/projects">
                  Get started for free
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <button className={primaryButtonClass} onClick={() => signup()} type="button">
                  Get started for free
                  <ArrowRight className="h-4 w-4" />
                </button>
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
              <p className="mt-3 max-w-[26ch] text-sm leading-6 text-slate-300">
                {description}
              </p>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}

import { Link } from 'react-router-dom'

type LandingNavbarProps = {
  onLogin: () => void
  onSignup: () => void
}

const buttonBaseClass =
  'inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300'
const primaryButtonClass = `${buttonBaseClass} bg-sky-400 text-slate-950 shadow-[0_16px_40px_rgba(56,189,248,0.28)] hover:-translate-y-0.5 hover:bg-sky-300`
const secondaryButtonClass = `${buttonBaseClass} border border-white/15 bg-white/5 text-slate-100 hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/10`

export function LandingNavbar({ onLogin, onSignup }: LandingNavbarProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[2rem] border border-white/10 bg-slate-950/70 px-5 py-4 shadow-[0_20px_40px_rgba(2,6,23,0.28)] backdrop-blur sm:px-6">
      <div className="flex items-center gap-3">
        <Link className="text-xl font-extrabold uppercase tracking-[0.08em] text-white" to="/">
          KeyVault
        </Link>
      </div>
      <nav aria-label="Account" className="flex items-center gap-3">
        <button className={secondaryButtonClass} onClick={onLogin} type="button">
          Log in
        </button>
        <button className={primaryButtonClass} onClick={onSignup} type="button">
          Get started
        </button>
      </nav>
    </div>
  )
}

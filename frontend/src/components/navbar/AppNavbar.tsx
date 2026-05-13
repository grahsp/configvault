import { Link, NavLink } from 'react-router-dom'
import { Button } from '../ui/button'

type AppNavbarProps = {
  isAuthenticated: boolean
  isLoading: boolean
  login: () => void
  logout: () => void
  signup: () => void
}

export function AppNavbar({
  isAuthenticated,
  isLoading,
  login,
  logout,
  signup,
}: AppNavbarProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/92 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-10">
          <Link
            className="text-xl font-extrabold uppercase tracking-[0.08em] text-slate-950"
            to={isAuthenticated ? '/projects' : '/'}
          >
            KeyVault
          </Link>
          <nav aria-label="Primary" className="flex flex-wrap items-center gap-2 sm:gap-3">
            <NavLink
              className={({ isActive }) =>
                `inline-flex items-center border-b-2 pb-1 text-base transition-colors ${
                  isActive
                    ? 'border-slate-950 font-bold text-slate-950'
                    : 'border-transparent font-normal text-slate-500 hover:text-slate-700'
                }`
              }
              to="/projects"
            >
              Projects
            </NavLink>
          </nav>
        </div>

        <nav aria-label="Account" className="flex flex-wrap items-center gap-3">
          {!isLoading && isAuthenticated ? (
            <>
              <Button
                asChild
                className="h-11 rounded-2xl border-slate-300 bg-white px-5 text-sm font-medium text-slate-800 shadow-[0_1px_2px_rgba(15,23,42,0.05)] hover:bg-slate-50"
                size="lg"
                variant="outline"
              >
                <Link to="/profile">Profile</Link>
              </Button>
              <Button
                className="h-11 rounded-2xl bg-blue-500 px-5 text-sm font-medium text-white shadow-[0_8px_24px_rgba(59,130,246,0.24)] hover:bg-blue-600"
                onClick={logout}
                size="lg"
                type="button"
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button
                className="h-11 rounded-2xl border-slate-300 bg-white px-5 text-sm font-medium text-slate-800 shadow-[0_1px_2px_rgba(15,23,42,0.05)] hover:bg-slate-50"
                onClick={() => login()}
                size="lg"
                type="button"
                variant="outline"
              >
                Log in
              </Button>
              <Button
                className="h-11 rounded-2xl bg-blue-500 px-5 text-sm font-medium text-white shadow-[0_8px_24px_rgba(59,130,246,0.24)] hover:bg-blue-600"
                onClick={() => signup()}
                size="lg"
                type="button"
              >
                Register
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}

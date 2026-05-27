import { Link, NavLink } from 'react-router-dom'
import { useCurrentUser } from '../../features/users'
import { useAuth } from '@/features/auth/hooks'
import { Button } from '../ui/button'
import { Avatar, AvatarImage } from '../ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'

export function AppNavbar() {
  const { isAuthenticated, isLoading, login, logout, signup, user: auth0User } = useAuth()
  const { user: currentUser } = useCurrentUser()
  const profilePicture = auth0User?.picture
  const profileName = currentUser?.displayName?.trim() || auth0User?.name?.trim() || 'Account'
  const profileEmail = currentUser?.email?.trim() || auth0User?.email?.trim()
  const isIdentityLoading = isLoading

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/92 px-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-[68rem] items-center justify-between gap-3 px-6 py-3 sm:px-8 lg:px-10">
        <div className="flex items-center gap-4 sm:gap-6 lg:gap-10">
          <Link
            className="text-xl font-extrabold uppercase tracking-[0.08em] text-slate-950"
            to={isAuthenticated ? '/projects' : '/'}
          >
            ConfigVault
          </Link>
          <nav aria-label="Primary" className="flex items-center gap-2 sm:gap-3">
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

        <nav aria-label="Account" className="flex items-center gap-2 sm:gap-3">
          {isIdentityLoading ? (
            <div
              aria-hidden="true"
              className="flex size-12 items-center justify-center rounded-full border border-slate-300 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.05)]"
              data-testid="account-menu-skeleton"
            >
              <span className="size-10 animate-pulse rounded-full bg-slate-200" />
            </div>
          ) : isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  aria-label="Open account menu"
                  className="size-12 rounded-full border-transparent bg-transparent p-0 text-slate-800 shadow-none hover:bg-slate-50"
                  size="default"
                  variant="outline"
                >
                  <Avatar className="size-10">
                    <AvatarImage alt="Account" src={profilePicture} />
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 p-0">
                <div className="flex items-center gap-3 px-4 py-4">
                  <Avatar className="size-10">
                    <AvatarImage alt="Account" src={profilePicture} />
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[0.8125rem] font-semibold leading-tight text-slate-950">
                      {profileName}
                    </p>
                    {profileEmail ? (
                      <p className="truncate text-xs leading-tight text-slate-500">
                        {profileEmail}
                      </p>
                    ) : null}
                  </div>
                </div>
                <DropdownMenuSeparator className="my-0" />
                <div className="p-1.5">
                  <DropdownMenuItem asChild>
                    <Link to="/profile">Account</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={(event) => {
                      event.preventDefault()
                      logout()
                    }}
                    variant="destructive"
                  >
                    Log out
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
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

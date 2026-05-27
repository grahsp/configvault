import { Link, NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useAuth } from '@/features/auth/hooks'
import { ThemeToggleButton } from '@/features/theme'
import { useCurrentUser } from '@/features/users'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function AppNavbar() {
  const { isAuthenticated, isLoading, login, logout, signup, user: auth0User } = useAuth()
  const { user: currentUser } = useCurrentUser()
  const profilePicture = auth0User?.picture
  const profileName = currentUser?.displayName?.trim() || auth0User?.name?.trim() || 'Account'
  const profileEmail = currentUser?.email?.trim() || auth0User?.email?.trim()
  const isIdentityLoading = isLoading
  const profileFallback = profileName.slice(0, 2).toUpperCase()

  return (
    <header className="sticky top-0 z-20 border-b border-border/80 bg-background/92 px-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-[68rem] items-center justify-between gap-3 px-6 py-3 sm:px-8 lg:px-10">
        <div className="flex items-center gap-4 sm:gap-6 lg:gap-10">
          <Link
            className="text-xl font-extrabold uppercase tracking-[0.08em] text-foreground"
            to={isAuthenticated ? '/projects' : '/'}
          >
            ConfigVault
          </Link>
          <nav aria-label="Primary" className="flex items-center gap-2 sm:gap-3">
            <NavLink
              className={({ isActive }) =>
                cn(
                  'inline-flex items-center border-b-2 pb-1 text-base transition-colors',
                  isActive
                    ? 'border-foreground font-bold text-foreground'
                    : 'border-transparent font-normal text-muted-foreground hover:text-foreground',
                )
              }
              to="/projects"
            >
              Projects
            </NavLink>
          </nav>
        </div>

        <nav aria-label="Account" className="flex items-center gap-2 sm:gap-3">
          <ThemeToggleButton />
          {isIdentityLoading ? (
            <div
              aria-hidden="true"
              className="flex size-10 items-center justify-center rounded-full border border-border bg-background shadow-[0_1px_2px_hsl(var(--foreground)/0.05)]"
              data-testid="account-menu-skeleton"
            >
              <span className="size-8 animate-pulse rounded-full bg-muted" />
            </div>
          ) : isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  aria-label="Open account menu"
                  className="rounded-full border-transparent bg-transparent p-0 shadow-none"
                  size="icon-lg"
                  variant="ghost"
                >
                  <Avatar className="size-10">
                    <AvatarImage alt="Account" src={profilePicture} />
                    <AvatarFallback>{profileFallback}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 p-0">
                <div className="flex items-center gap-3 px-4 py-4">
                  <Avatar className="size-10">
                    <AvatarImage alt="Account" src={profilePicture} />
                    <AvatarFallback>{profileFallback}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[0.8125rem] font-semibold leading-tight text-foreground">
                      {profileName}
                    </p>
                    {profileEmail ? (
                      <p className="truncate text-xs leading-tight text-muted-foreground">
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
                onClick={() => login()}
                size="default"
                type="button"
                variant="outline"
              >
                Log in
              </Button>
              <Button
                onClick={() => signup()}
                size="default"
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

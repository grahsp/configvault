import { Link } from 'react-router-dom'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/features/auth/hooks'
import { useCurrentUser } from '@/features/users'

interface AccountControlsProps {
  onNavigate?: () => void
}

export function AccountControls({ onNavigate }: AccountControlsProps) {
  const { isAuthenticated, isLoading, login, logout, signup, user: auth0User } = useAuth()
  const { user: currentUser } = useCurrentUser()
  const profilePicture = auth0User?.picture
  const profileName =
    currentUser?.displayName?.trim() || auth0User?.name?.trim() || 'Account'
  const profileEmail = currentUser?.email?.trim() || auth0User?.email?.trim()
  const profileFallback = profileName.slice(0, 2).toUpperCase()

  if (isLoading) {
    return (
      <div
        aria-hidden="true"
        className="flex size-9 items-center justify-center rounded-full border border-border bg-background"
        data-testid="account-menu-skeleton"
      >
        <Skeleton className="size-7 rounded-full" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-2">
        <Button onClick={() => login()} size="sm" type="button" variant="outline">
          Log in
        </Button>
        <Button onClick={() => signup()} size="sm" type="button">
          Register
        </Button>
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label="Open account menu"
          className="rounded-full border-transparent bg-transparent p-0 shadow-none"
          size="icon"
          variant="ghost"
        >
          <Avatar className="size-9">
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
            <Link onClick={onNavigate} to="/profile">
              Account
            </Link>
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
  )
}

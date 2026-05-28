import { useLocation } from 'react-router-dom'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { ThemeToggleButton } from '@/features/theme'
import { AccountControls } from './AccountControls'

export function AppTopBar() {
  const location = useLocation()

  return (
    <header className="sticky top-0 z-20 border-b border-border/80 bg-background/92 py-2 backdrop-blur">
      <div className="mx-auto flex min-h-10 w-full max-w-[68rem] items-center justify-between gap-5 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <SidebarTrigger
            aria-label="Open workspace navigation"
            className="md:hidden"
          />
          <p className="truncate text-sm font-semibold text-foreground md:hidden">
            {getMobilePageTitle(location.pathname)}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <ThemeToggleButton />
          <AccountControls />
        </div>
      </div>
    </header>
  )
}

function getMobilePageTitle(pathname: string) {
  if (pathname === '/projects') {
    return 'Projects'
  }

  if (/\/projects\/[^/]+\/members\/?$/.test(pathname)) {
    return 'Members'
  }

  if (/\/projects\/[^/]+\/secrets\/?$/.test(pathname)) {
    return 'Secrets'
  }

  if (pathname === '/profile') {
    return 'Account'
  }

  return 'ConfigVault'
}

import { Link, Outlet, useLocation } from 'react-router-dom'
import { AppSidebar } from '@/components/navbar/AppSidebar'
import { AppTopBar } from '@/components/navbar/AppTopBar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { ThemeProvider } from '@/features/theme'

export function AppLayout() {
  const location = useLocation()
  const isInvitationRoute = location.pathname.startsWith('/invitations/')

  return (
    <ThemeProvider>
      {isInvitationRoute ? (
        <div className="relative flex min-h-dvh flex-col overflow-hidden bg-background text-[color:var(--color-text)]">
          <header className="border-b border-border/80 bg-background px-4 sm:px-6 lg:px-8">
            <div className="mx-auto flex w-full max-w-[68rem] items-center justify-between gap-3 px-6 py-3 sm:px-8 lg:px-10">
              <Link
                className="text-xl font-extrabold uppercase tracking-[0.08em] text-foreground"
                to="/"
              >
                ConfigVault
              </Link>
            </div>
          </header>

          <main className="flex flex-1 bg-background px-4 sm:px-6 lg:px-8">
            <div className="mx-auto flex min-h-full w-full max-w-[68rem] flex-1 flex-col bg-background px-6 py-8 sm:px-8 sm:py-10 sm:pb-20 lg:px-10 lg:py-12">
              <Outlet />
            </div>
          </main>
        </div>
      ) : (
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <AppTopBar />
            <div className="flex flex-1 bg-background px-4 sm:px-6 lg:px-8">
              <div className="mx-auto flex min-h-full w-full max-w-[68rem] flex-1 flex-col bg-background px-2 pb-8 pt-5 sm:px-4 sm:pb-20 sm:pt-6 lg:px-8 lg:pt-8">
                <Outlet />
              </div>
            </div>
          </SidebarInset>
        </SidebarProvider>
      )}
    </ThemeProvider>
  )
}

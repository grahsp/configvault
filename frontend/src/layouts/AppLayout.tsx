import { Outlet } from 'react-router-dom'
import { AppNavbar } from '@/components/navbar/AppNavbar'
import { ThemeProvider } from '@/features/theme'

export function AppLayout() {
  return (
    <ThemeProvider>
      <div className="relative flex min-h-dvh flex-col overflow-hidden bg-background text-[color:var(--color-text)]">
        <AppNavbar />

        <main className="flex flex-1 bg-background px-4 sm:px-6 lg:px-8">
          <div className="mx-auto flex min-h-full w-full max-w-[68rem] flex-1 flex-col bg-background px-6 py-8 sm:px-8 sm:py-10 sm:pb-20 lg:px-10 lg:py-12">
            <Outlet />
          </div>
        </main>
      </div>
    </ThemeProvider>
  )
}

import { Outlet } from 'react-router-dom'
import { AppNavbar } from '../components/navbar/AppNavbar'

export function AppLayout() {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-[color:var(--color-bg)] text-[color:var(--color-text)]">
      <AppNavbar />

      <main className="relative flex flex-1 px-4 sm:px-6 lg:px-8">
        <div className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col bg-[color:var(--color-surface-glass-subtle)]">
          <div className="flex flex-1 flex-col px-6 py-8 sm:px-8 sm:py-10 sm:pb-20 lg:px-10 lg:py-12">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  )
}

import { Outlet } from 'react-router-dom'
import { AppNavbar } from '../components/navbar/AppNavbar'

export function AppLayout() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)]">
      <AppNavbar />

      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-6xl">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

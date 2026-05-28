import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useEffect } from 'react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import { SidebarProvider, useSidebar } from '@/components/ui/sidebar'
import { AppSidebar } from './AppSidebar'

describe('AppSidebar', () => {
  afterEach(() => {
    setViewportWidth(1024)
  })

  it('keeps utility controls out of the navigation sidebar', () => {
    renderSidebar()

    expect(screen.queryByRole('button', { name: /open account menu/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /switch to dark theme/i })).not.toBeInTheDocument()
  })

  it('renders workspace and project navigation with active state', () => {
    renderSidebar({
      initialPath: '/projects/project-1/secrets?environmentId=env-1',
    })

    const projectsLink = screen.getByRole('link', { name: /Projects/i })
    const secretsLink = screen.getByRole('link', { name: /Secrets/i })
    const membersLink = screen.getByRole('link', { name: /Members/i })
    const settingsLink = screen.getByRole('link', { name: /Settings/i })

    expect(projectsLink).toHaveAttribute('href', '/projects')
    expect(secretsLink).toHaveAttribute(
      'href',
      '/projects/project-1/secrets?environmentId=env-1',
    )
    expect(secretsLink).toHaveAttribute('aria-current', 'page')
    expect(secretsLink).toHaveAttribute('data-active', 'true')
    expect(secretsLink).toHaveClass(
      'data-[active=true]:bg-sidebar-accent/80',
      'data-[active=true]:ring-1',
      'data-[active=true]:ring-sidebar-border/80',
    )
    expect(membersLink).toHaveAttribute(
      'href',
      '/projects/project-1/members?environmentId=env-1',
    )
    expect(membersLink).not.toHaveAttribute('aria-current')
    expect(membersLink).toHaveAttribute('data-active', 'false')
    expect(settingsLink).toHaveAttribute(
      'href',
      '/projects/project-1/settings?environmentId=env-1',
    )
    expect(settingsLink).not.toHaveAttribute('aria-current')
    expect(settingsLink).toHaveAttribute('data-active', 'false')
  })

  it('marks project settings active and preserves search params', () => {
    renderSidebar({
      initialPath: '/projects/project-1/settings?environmentId=env-1',
    })

    const settingsLink = screen.getByRole('link', { name: /Settings/i })

    expect(settingsLink).toHaveAttribute(
      'href',
      '/projects/project-1/settings?environmentId=env-1',
    )
    expect(settingsLink).toHaveAttribute('aria-current', 'page')
    expect(settingsLink).toHaveAttribute('data-active', 'true')
  })

  it('renders a visible close control in the mobile sidebar', async () => {
    const user = userEvent.setup()

    renderSidebar({
      isMobileOpen: true,
      viewportWidth: 500,
    })

    expect(await screen.findByRole('dialog', { name: 'Sidebar' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Close' }))

    expect(screen.queryByRole('dialog', { name: 'Sidebar' })).not.toBeInTheDocument()
  })

  it('closes the mobile sidebar when a navigation link is selected', async () => {
    const user = userEvent.setup()

    renderSidebar({
      initialPath: '/projects/project-1/secrets?environmentId=env-1',
      isMobileOpen: true,
      viewportWidth: 500,
    })

    expect(await screen.findByRole('dialog', { name: 'Sidebar' })).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: /Members/i }))

    expect(screen.getByTestId('location')).toHaveTextContent(
      '/projects/project-1/members',
    )
    expect(screen.queryByRole('dialog', { name: 'Sidebar' })).not.toBeInTheDocument()
  })
})

function renderSidebar({
  initialPath = '/projects',
  isMobileOpen = false,
  viewportWidth = 1024,
}: {
  initialPath?: string
  isMobileOpen?: boolean
  viewportWidth?: number
} = {}) {
  setViewportWidth(viewportWidth)

  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route
          path="*"
          element={
            <>
              <SidebarProvider>
                {isMobileOpen ? <OpenMobileSidebar /> : null}
                <AppSidebar />
              </SidebarProvider>
              <LocationDisplay />
            </>
          }
        />
      </Routes>
    </MemoryRouter>,
  )
}

function OpenMobileSidebar() {
  const { setOpenMobile } = useSidebar()

  useEffect(() => {
    setOpenMobile(true)
  }, [setOpenMobile])

  return null
}

function LocationDisplay() {
  const location = useLocation()
  return <p data-testid="location">{location.pathname}</p>
}

function setViewportWidth(width: number) {
  Object.defineProperty(window, 'innerWidth', {
    configurable: true,
    value: width,
  })
}

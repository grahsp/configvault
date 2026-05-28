import { FolderIcon, KeyRoundIcon, UsersIcon } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'

export function AppSidebar() {
  const location = useLocation()
  const { isMobile, setOpenMobile } = useSidebar()
  const projectId = getProjectId(location.pathname)
  const projectSearch = location.search
  const isProjectsActive = location.pathname === '/projects'
  const isSecretsActive = /\/projects\/[^/]+\/secrets\/?$/.test(location.pathname)
  const isMembersActive = /\/projects\/[^/]+\/members\/?$/.test(location.pathname)
  const closeMobileSidebar = () => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  return (
    <Sidebar collapsible="none">
      <SidebarHeader className="px-3 py-3">
        <Link
          className="flex h-9 items-center px-2 text-sm font-extrabold uppercase tracking-[0.08em] text-sidebar-foreground"
          onClick={closeMobileSidebar}
          to="/projects"
        >
          ConfigVault
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isProjectsActive}>
                  <Link
                    aria-current={isProjectsActive ? 'page' : undefined}
                    onClick={closeMobileSidebar}
                    to="/projects"
                  >
                    <FolderIcon aria-hidden="true" />
                    <span>Projects</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {projectId ? (
          <SidebarGroup>
            <SidebarGroupLabel>Project</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isSecretsActive}>
                    <Link
                      aria-current={isSecretsActive ? 'page' : undefined}
                      onClick={closeMobileSidebar}
                      to={{
                        pathname: `/projects/${projectId}/secrets`,
                        search: projectSearch,
                      }}
                    >
                      <KeyRoundIcon aria-hidden="true" />
                      <span>Secrets</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isMembersActive}>
                    <Link
                      aria-current={isMembersActive ? 'page' : undefined}
                      onClick={closeMobileSidebar}
                      to={{
                        pathname: `/projects/${projectId}/members`,
                        search: projectSearch,
                      }}
                    >
                      <UsersIcon aria-hidden="true" />
                      <span>Members</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : null}
      </SidebarContent>

    </Sidebar>
  )
}

function getProjectId(pathname: string) {
  const match = /^\/projects\/([^/]+)/.exec(pathname)

  return match?.[1] ?? ''
}

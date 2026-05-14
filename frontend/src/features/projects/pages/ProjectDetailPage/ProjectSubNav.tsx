import { NavLink, useLocation } from 'react-router-dom'
import { Tabs, TabsList } from '../../../../components/ui/tabs'
import { cn } from '../../../../lib/utils'

interface ProjectSubNavProps {
  projectId: string
}

export function ProjectSubNav({ projectId }: ProjectSubNavProps) {
  const location = useLocation()
  const currentSearch = location.search
  const activeTab = location.pathname.endsWith('/general')
    ? 'general'
    : location.pathname.endsWith('/members')
      ? 'members'
      : 'secrets'
  const tabs = [
    {
      label: 'General',
      value: 'general',
      to: {
        pathname: `/projects/${projectId}/general`,
        search: currentSearch,
      },
    },
    {
      label: 'Secrets',
      value: 'secrets',
      to: {
        pathname: `/projects/${projectId}/secrets`,
        search: currentSearch,
      },
    },
    {
      label: 'Members',
      value: 'members',
      to: {
        pathname: `/projects/${projectId}/members`,
        search: currentSearch,
      },
    },
  ]

  return (
    <Tabs className="w-full" value={activeTab}>
      <nav aria-label="Project sections">
        <TabsList className="h-auto w-full justify-start gap-6 rounded-none border-b border-border/50 bg-transparent p-0">
          {tabs.map((tab) => (
            <NavLink
              className={({ isActive }) =>
                cn(
                  'inline-flex items-center border-b-2 border-transparent px-0 pb-3 pt-0 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground',
                  isActive && 'border-foreground text-foreground',
                )
              }
              key={tab.label}
              to={tab.to}
            >
              {tab.label}
            </NavLink>
          ))}
        </TabsList>
      </nav>
    </Tabs>
  )
}

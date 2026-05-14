import { NavLink, useLocation } from 'react-router-dom'
import { cn } from '../../../../lib/utils'

interface ProjectSubNavProps {
  projectId: string
}

export function ProjectSubNav({ projectId }: ProjectSubNavProps) {
  const location = useLocation()
  const currentSearch = location.search
  const tabs = [
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
    <nav aria-label="Project sections">
      <div className="flex items-center gap-2 border-b border-border/60">
        {tabs.map((tab) => (
          <NavLink
            className={({ isActive }) =>
              cn(
                'relative inline-flex h-10 items-center rounded-t-xl px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground hover:after:absolute hover:after:inset-x-3 hover:after:bottom-0 hover:after:h-0.5 hover:after:rounded-full hover:after:bg-foreground',
                isActive &&
                  'text-foreground after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:bg-primary',
              )
            }
            key={tab.label}
            to={tab.to}
          >
            {tab.label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

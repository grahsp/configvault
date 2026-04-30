import { NavLink, useLocation } from 'react-router-dom'
import { cx } from '../../../../shared/utils/cx.ts'
import styles from './ProjectSubNav.module.css'

interface ProjectSubNavProps {
  projectId: string
}

export function ProjectSubNav({ projectId }: ProjectSubNavProps) {
  const location = useLocation()
  const currentSearch = location.search
  const tabs = [
    {
      label: 'General',
      to: {
        pathname: `/projects/${projectId}/general`,
        search: currentSearch,
      },
    },
    {
      label: 'Secrets',
      to: {
        pathname: `/projects/${projectId}/secrets`,
        search: currentSearch,
      },
    },
    {
      label: 'Members',
      to: {
        pathname: `/projects/${projectId}/members`,
        search: currentSearch,
      },
    },
  ]

  return (
    <nav className={styles.nav} aria-label="Project sections">
      {tabs.map((tab) => (
        <NavLink
          className={({ isActive }) =>
            cx(styles.navLink, isActive ? styles.navLinkActive : undefined)
          }
          key={tab.label}
          to={tab.to}
        >
          {tab.label}
        </NavLink>
      ))}
    </nav>
  )
}

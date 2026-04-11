import { NavLink } from 'react-router-dom'
import { cx } from '../../../shared/utils/cx'
import styles from './ProjectSubNav.module.css'

interface ProjectSubNavProps {
  projectId: string
}

export function ProjectSubNav({ projectId }: ProjectSubNavProps) {
  const tabs = [
    {
      label: 'Secrets',
      to: `/projects/${projectId}/secrets`,
    },
    {
      label: 'Members',
      to: `/projects/${projectId}/members`,
    },
  ]

  return (
    <nav className={styles.nav} aria-label="Project sections">
      {tabs.map((tab) => (
        <NavLink
          className={({ isActive }) =>
            cx(styles.navLink, isActive ? styles.navLinkActive : undefined)
          }
          key={tab.to}
          to={tab.to}
        >
          {tab.label}
        </NavLink>
      ))}
    </nav>
  )
}

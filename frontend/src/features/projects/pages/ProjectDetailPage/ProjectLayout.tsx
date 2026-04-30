import { Link, Outlet } from 'react-router-dom'
import { EnvironmentDropdown, type Environment } from '../../environments'
import { cx } from '../../../../shared/utils/cx'
import type { ProjectDetails } from '../../model'
import { ProjectSubNav } from '../../ui'
import type { ProjectLayoutContext } from './ProjectDetailPage'
import styles from './ProjectDetailPage.module.css'

interface ProjectLayoutProps {
  isSecretsRoute: boolean
  onEnvironmentChange: (environmentId: string) => void
  onSelectedEnvironmentChange: (environment: Environment | null) => void
  project: ProjectDetails
  selectedEnvironmentId: string
  selectedEnvironmentName: string
}

export function ProjectLayout({
  isSecretsRoute,
  onEnvironmentChange,
  onSelectedEnvironmentChange,
  project,
  selectedEnvironmentId,
  selectedEnvironmentName,
}: ProjectLayoutProps) {
  return (
    <>
      <div className={cx(styles.cardHeader, styles.detailHeader)}>
        <div className={styles.titleSection}>
          <Link className={styles.backLink} to="/projects">
            Back to projects
          </Link>
          <div className={styles.titleBar}>
            <h1 id="project-detail-title">{project.name}</h1>
            {isSecretsRoute ? (
              <div className={styles.environmentPicker}>
                <span className={styles.environmentLabel}>Environment</span>
                <EnvironmentDropdown
                  onEnvironmentChange={onEnvironmentChange}
                  onSelectedEnvironmentChange={onSelectedEnvironmentChange}
                  projectId={project.id}
                  selectedEnvironmentId={selectedEnvironmentId}
                />
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {project.description ? (
        <p className={styles.cardCopy}>{project.description}</p>
      ) : null}

      <ProjectSubNav projectId={project.id} />
      <Outlet
        context={{ project, selectedEnvironmentName } satisfies ProjectLayoutContext}
      />
    </>
  )
}

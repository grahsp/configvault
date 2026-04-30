import { useCallback, useState } from 'react'
import { Link, Outlet, useLocation, useParams, useSearchParams } from 'react-router-dom'
import { EnvironmentDropdown, type Environment } from '../../../environments'
import { cx } from '../../../../shared/utils/cx'
import {
  getErrorMessage,
  isAuthError,
  isNotFoundError,
  type ProjectDetails,
  useProject,
} from '../../model'
import { ProjectSubNav } from '../../ui'
import styles from './ProjectDetailPage.module.css'

export function ProjectLayout() {
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const { projectId } = useParams()
  const [selectedEnvironmentName, setSelectedEnvironmentName] = useState('')

  const projectQuery = useProject(projectId ?? '')
  const project = projectQuery.data
  const selectedEnvironmentId = searchParams.get('environmentId') ?? ''
  const isSecretsRoute = location.pathname.endsWith('/secrets')

  function handleEnvironmentChange(environmentId: string) {
    setSearchParams((currentParams) => {
      const nextParams = new URLSearchParams(currentParams)

      if (environmentId) {
        nextParams.set('environmentId', environmentId)
      } else {
        nextParams.delete('environmentId')
      }

      return nextParams
    })
  }

  const handleSelectedEnvironmentChange = useCallback(
    (environment: Environment | null) => {
      setSelectedEnvironmentName(environment?.environmentName ?? '')
    },
    [],
  )

  if (!projectId) {
    return (
      <main className={cx(styles.page, styles.pageTop)}>
        <section
          className={styles.card}
          aria-labelledby="project-not-found-title"
        >
          <div className={styles.state}>
            <p className={styles.stateTitle} id="project-not-found-title">
              Project not found
            </p>
            <p className={styles.stateCopy}>
              Check the project link or return to your workspace.
            </p>
            <Link
              className={cx(styles.button, styles.buttonSecondary)}
              to="/projects"
            >
              Back to projects
            </Link>
          </div>
        </section>
      </main>
    )
  }

  const isProjectNotFound =
    projectQuery.isError && isNotFoundError(projectQuery.error)
  const isProjectAuthError =
    projectQuery.isError && isAuthError(projectQuery.error)

  return (
    <main className={cx(styles.page, styles.pageTop)}>
      <section className={styles.card} aria-labelledby="project-detail-title">
        {projectQuery.isPending ? (
          <div className={styles.state} role="status">
            <p className={styles.stateTitle}>Loading project</p>
            <p className={styles.stateCopy}>
              Project details are being prepared.
            </p>
          </div>
        ) : null}

        {isProjectNotFound ? <ProjectNotFoundState /> : null}

        {isProjectAuthError ? (
          <div className={cx(styles.state, styles.stateError)} role="alert">
            <p className={styles.stateTitle}>Project access denied</p>
            <p className={styles.stateCopy}>
              Your account is not authorized to open this project.
            </p>
            <BackToProjectsLink />
          </div>
        ) : null}

        {projectQuery.isError && !isProjectNotFound && !isProjectAuthError ? (
          <div className={cx(styles.state, styles.stateError)} role="alert">
            <p className={styles.stateTitle}>Project could not load</p>
            <p className={styles.stateCopy}>
              {getErrorMessage(
                projectQuery.error,
                'Something went wrong while loading the project.',
              )}
            </p>
            <button
              className={cx(styles.button, styles.buttonSecondary)}
              onClick={() => projectQuery.refetch()}
              type="button"
            >
              Retry
            </button>
          </div>
        ) : null}

        {!projectQuery.isPending && !projectQuery.isError && !project ? (
          <ProjectNotFoundState />
        ) : null}

        {!projectQuery.isPending && !projectQuery.isError && project ? (
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
                        onEnvironmentChange={handleEnvironmentChange}
                        onSelectedEnvironmentChange={handleSelectedEnvironmentChange}
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
            <Outlet context={{ project, selectedEnvironmentName }} />
          </>
        ) : null}
      </section>
    </main>
  )
}

export interface ProjectLayoutContext {
  project: ProjectDetails
  selectedEnvironmentName: string
}

function ProjectNotFoundState() {
  return (
    <div className={styles.state}>
      <p className={styles.stateTitle}>Project not found</p>
      <p className={styles.stateCopy}>
        This project is missing or your account cannot access it.
      </p>
      <BackToProjectsLink />
    </div>
  )
}

function BackToProjectsLink() {
  return (
    <Link className={cx(styles.button, styles.buttonSecondary)} to="/projects">
      Back to projects
    </Link>
  )
}

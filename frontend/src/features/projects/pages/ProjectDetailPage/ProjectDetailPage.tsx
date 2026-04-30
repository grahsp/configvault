import { useCallback, useState } from 'react'
import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom'
import { type Environment } from '../../environments'
import { cx } from '../../../../shared/utils/cx'
import {
  getErrorMessage,
  isAuthError,
  isNotFoundError,
  type ProjectDetails,
} from '../../domain'
import { useProject } from '../../application'
import { ProjectLayout } from './ProjectLayout'
import styles from './ProjectDetailPage.module.css'

export function ProjectDetailPage() {
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const { projectId } = useParams()
  const [selectedEnvironmentName, setSelectedEnvironmentName] = useState('')

  const projectQuery = useProject(projectId ?? '')
  const project = projectQuery.data
  const selectedEnvironmentId = searchParams.get('environmentId') ?? ''
  const isSecretsRoute = location.pathname.endsWith('/secrets')

  const handleSelectedEnvironmentChange = useCallback(
    (environment: Environment | null) => {
      setSelectedEnvironmentName(environment?.environmentName ?? '')
    },
    [],
  )

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
          <ProjectLayout
            isSecretsRoute={isSecretsRoute}
            onEnvironmentChange={handleEnvironmentChange}
            onSelectedEnvironmentChange={handleSelectedEnvironmentChange}
            project={project}
            selectedEnvironmentId={selectedEnvironmentId}
            selectedEnvironmentName={selectedEnvironmentName}
          />
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

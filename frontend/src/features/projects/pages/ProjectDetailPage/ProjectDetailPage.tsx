import { useCallback, useState } from 'react'
import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom'
import { type Environment } from '../../environments'
import { Button, StatePanel } from '../../../../shared/ui'
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
        <section className={styles.card}>
          <StatePanel title="Project not found">
            <p>
              Check the project link or return to your workspace.
            </p>
            <BackToProjectsLink />
          </StatePanel>
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
          <StatePanel role="status" title="Loading project">
            <p>
              Project details are being prepared.
            </p>
          </StatePanel>
        ) : null}

        {isProjectNotFound ? <ProjectNotFoundState /> : null}

        {isProjectAuthError ? (
          <StatePanel role="alert" title="Project access denied" tone="error">
            <p>
              Your account is not authorized to open this project.
            </p>
            <BackToProjectsLink />
          </StatePanel>
        ) : null}

        {projectQuery.isError && !isProjectNotFound && !isProjectAuthError ? (
          <StatePanel
            actions={
              <Button
                onClick={() => projectQuery.refetch()}
                type="button"
                variant="secondary"
              >
                Retry
              </Button>
            }
            role="alert"
            title="Project could not load"
            tone="error"
          >
            <p>
              {getErrorMessage(
                projectQuery.error,
                'Something went wrong while loading the project.',
              )}
            </p>
          </StatePanel>
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
    <StatePanel title="Project not found">
      <p>
        This project is missing or your account cannot access it.
      </p>
      <BackToProjectsLink />
    </StatePanel>
  )
}

function BackToProjectsLink() {
  return (
    <Link className={styles.backActionLink} to="/projects">
      Back to projects
    </Link>
  )
}

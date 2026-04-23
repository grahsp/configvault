import { useCallback, useState } from 'react'
import { Link, Outlet, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { EnvironmentDropdown } from '../../environments/components/EnvironmentDropdown'
import type { Environment } from '../../environments/types'
import { cx } from '../../../shared/utils/cx'
import { ProjectDeleteDialog } from '../components/ProjectDeleteDialog'
import { ProjectSubNav } from '../components/ProjectSubNav'
import {
  useDeleteProject,
  useProject,
} from '../hooks/useProjects'
import type { ProjectDetails } from '../types'
import {
  formatCreatedDate,
  getErrorMessage,
  isAuthError,
  isNotFoundError,
} from './projectPageUtils'
import styles from './ProjectDetailPage/ProjectDetailPage.module.css'

export function ProjectLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const { projectId } = useParams()
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedEnvironmentName, setSelectedEnvironmentName] = useState('')

  const projectQuery = useProject(projectId ?? '')
  const deleteProjectMutation = useDeleteProject()
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

  function closeDeleteModal() {
    if (deleteProjectMutation.isPending) {
      return
    }

    setIsDeleteModalOpen(false)
    deleteProjectMutation.reset()
  }

  function confirmDeleteProject() {
    if (!projectId) {
      return
    }

    deleteProjectMutation.mutate(projectId, {
      onSuccess: () => navigate('/projects'),
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
          <>
            <div className={cx(styles.cardHeader, styles.detailHeader)}>
              <div>
                <Link className={styles.backLink} to="/projects">
                  Back to projects
                </Link>
                <h1 id="project-detail-title">{project.name}</h1>
              </div>

              <div className={styles.actions}>
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
                <button
                  className={cx(styles.button, styles.buttonDanger)}
                  disabled={deleteProjectMutation.isPending}
                  onClick={() => {
                    deleteProjectMutation.reset()
                    setIsDeleteModalOpen(true)
                  }}
                  type="button"
                >
                  Delete project
                </button>
                <p className={styles.meta}>
                  Created {formatCreatedDate(project.createdAt)}
                </p>
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

      {isDeleteModalOpen && project ? (
        <ProjectDeleteDialog
          errorClassName={styles.formError}
          formActionsClassName={styles.formActions}
          mutation={deleteProjectMutation}
          onCancel={closeDeleteModal}
          onConfirm={confirmDeleteProject}
          projectName={project.name}
        />
      ) : null}
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

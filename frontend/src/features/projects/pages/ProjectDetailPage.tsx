import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ApiError } from '../../../api/apiClient'
import {
  useDeleteProject,
  useProject,
} from '../hooks/useProjects'
import styles from './ProjectDetailPage.module.css'

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(' ')
}

function formatCreatedDate(createdAt?: string) {
  if (!createdAt) {
    return 'date unavailable'
  }

  const createdDate = new Date(createdAt)

  if (Number.isNaN(createdDate.getTime())) {
    return 'date unavailable'
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(createdDate)
}

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : 'Something went wrong while loading the project.'
}

function isNotFoundError(error: unknown) {
  return error instanceof ApiError && error.kind === 'not-found'
}

function isAuthError(error: unknown) {
  return error instanceof ApiError && error.kind === 'auth'
}

export function ProjectDetailPage() {
  const navigate = useNavigate()
  const { projectId } = useParams()
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  const projectQuery = useProject(projectId ?? '')
  const deleteProjectMutation = useDeleteProject()
  const project = projectQuery.data

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
        ) : isProjectNotFound ? (
          <div className={styles.state}>
            <p className={styles.stateTitle}>Project not found</p>
            <p className={styles.stateCopy}>
              This project is missing or your account cannot access it.
            </p>
            <Link
              className={cx(styles.button, styles.buttonSecondary)}
              to="/projects"
            >
              Back to projects
            </Link>
          </div>
        ) : isProjectAuthError ? (
          <div className={cx(styles.state, styles.stateError)} role="alert">
            <p className={styles.stateTitle}>Project access denied</p>
            <p className={styles.stateCopy}>
              Your account is not authorized to open this project.
            </p>
            <Link
              className={cx(styles.button, styles.buttonSecondary)}
              to="/projects"
            >
              Back to projects
            </Link>
          </div>
        ) : projectQuery.isError ? (
          <div className={cx(styles.state, styles.stateError)} role="alert">
            <p className={styles.stateTitle}>Project could not load</p>
            <p className={styles.stateCopy}>
              {getErrorMessage(projectQuery.error)}
            </p>
            <button
              className={cx(styles.button, styles.buttonSecondary)}
              onClick={() => projectQuery.refetch()}
              type="button"
            >
              Retry
            </button>
          </div>
        ) : project ? (
          <>
            <div className={cx(styles.cardHeader, styles.detailHeader)}>
              <div>
                <Link className={styles.backLink} to="/projects">
                  Back to projects
                </Link>
                <h1 id="project-detail-title">{project.name}</h1>
              </div>

              <div className={styles.actions}>
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

            <div className={styles.placeholder}>
              <p className={styles.placeholderTitle}>
                Vault content will appear here
              </p>
              <p className={styles.placeholderCopy}>
                This space is reserved for the entries and controls that will be
                added next.
              </p>
            </div>
          </>
        ) : (
          <div className={styles.state}>
            <p className={styles.stateTitle}>Project not found</p>
            <p className={styles.stateCopy}>
              This project is missing or your account cannot access it.
            </p>
            <Link
              className={cx(styles.button, styles.buttonSecondary)}
              to="/projects"
            >
              Back to projects
            </Link>
          </div>
        )}
      </section>

      {isDeleteModalOpen && project ? (
        <div className={styles.modalBackdrop} role="presentation">
          <div
            aria-labelledby="delete-project-title"
            aria-modal="true"
            className={cx(styles.modal, styles.modalCompact)}
            role="dialog"
          >
            <h2 id="delete-project-title">Delete project</h2>
            <p className={styles.modalCopy}>
              Delete {project.name}? This cannot be undone.
            </p>

            {deleteProjectMutation.isError ? (
              <p className={styles.formError} role="alert">
                {getErrorMessage(deleteProjectMutation.error)}
              </p>
            ) : null}

            <div className={styles.formActions}>
              <button
                className={cx(styles.button, styles.buttonSecondary)}
                disabled={deleteProjectMutation.isPending}
                onClick={closeDeleteModal}
                type="button"
              >
                Cancel
              </button>
              <button
                className={cx(styles.button, styles.buttonDanger)}
                disabled={deleteProjectMutation.isPending}
                onClick={confirmDeleteProject}
                type="button"
              >
                {deleteProjectMutation.isPending ? 'Deleting' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  )
}

import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ApiError } from '../api/apiClient'
import {
  useDeleteProject,
  useProject,
} from '../features/projects/useProjects'

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
      <main className="projects-page projects-page--top">
        <section
          className="projects-card"
          aria-labelledby="project-not-found-title"
        >
          <div className="projects-state">
            <p className="projects-state__title" id="project-not-found-title">
              Project not found
            </p>
            <p className="projects-state__copy">
              Check the project link or return to your workspace.
            </p>
            <Link className="button button--secondary" to="/projects">
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
    <main className="projects-page projects-page--top">
      <section className="projects-card" aria-labelledby="project-detail-title">
        {projectQuery.isPending ? (
          <div className="projects-state" role="status">
            <p className="projects-state__title">Loading project</p>
            <p className="projects-state__copy">
              Project details are being prepared.
            </p>
          </div>
        ) : isProjectNotFound ? (
          <div className="projects-state">
            <p className="projects-state__title">Project not found</p>
            <p className="projects-state__copy">
              This project is missing or your account cannot access it.
            </p>
            <Link className="button button--secondary" to="/projects">
              Back to projects
            </Link>
          </div>
        ) : isProjectAuthError ? (
          <div className="projects-state projects-state--error" role="alert">
            <p className="projects-state__title">Project access denied</p>
            <p className="projects-state__copy">
              Your account is not authorized to open this project.
            </p>
            <Link className="button button--secondary" to="/projects">
              Back to projects
            </Link>
          </div>
        ) : projectQuery.isError ? (
          <div className="projects-state projects-state--error" role="alert">
            <p className="projects-state__title">Project could not load</p>
            <p className="projects-state__copy">
              {getErrorMessage(projectQuery.error)}
            </p>
            <button
              className="button button--secondary"
              onClick={() => projectQuery.refetch()}
              type="button"
            >
              Retry
            </button>
          </div>
        ) : project ? (
          <>
            <div className="projects-card__header project-detail__header">
              <div>
                <Link className="project-detail__back-link" to="/projects">
                  Back to projects
                </Link>
                <h1 id="project-detail-title">{project.name}</h1>
              </div>

              <div className="project-detail__actions">
                <button
                  className="button button--danger"
                  disabled={deleteProjectMutation.isPending}
                  onClick={() => {
                    deleteProjectMutation.reset()
                    setIsDeleteModalOpen(true)
                  }}
                  type="button"
                >
                  Delete project
                </button>
                <p className="project-detail__meta">
                  Created {formatCreatedDate(project.createdAt)}
                </p>
              </div>
            </div>

            {project.description ? (
              <p className="projects-card__copy">{project.description}</p>
            ) : null}

            <div className="project-detail__placeholder">
              <p className="project-detail__placeholder-title">
                Vault content will appear here
              </p>
              <p className="project-detail__placeholder-copy">
                This space is reserved for the entries and controls that will be
                added next.
              </p>
            </div>
          </>
        ) : (
          <div className="projects-state">
            <p className="projects-state__title">Project not found</p>
            <p className="projects-state__copy">
              This project is missing or your account cannot access it.
            </p>
            <Link className="button button--secondary" to="/projects">
              Back to projects
            </Link>
          </div>
        )}
      </section>

      {isDeleteModalOpen && project ? (
        <div className="modal-backdrop" role="presentation">
          <div
            aria-labelledby="delete-project-title"
            aria-modal="true"
            className="modal modal--compact"
            role="dialog"
          >
            <h2 id="delete-project-title">Delete project</h2>
            <p className="modal__copy">
              Delete {project.name}? This cannot be undone.
            </p>

            {deleteProjectMutation.isError ? (
              <p className="project-form__error" role="alert">
                {getErrorMessage(deleteProjectMutation.error)}
              </p>
            ) : null}

            <div className="project-form__actions">
              <button
                className="button button--secondary"
                disabled={deleteProjectMutation.isPending}
                onClick={closeDeleteModal}
                type="button"
              >
                Cancel
              </button>
              <button
                className="button button--danger"
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

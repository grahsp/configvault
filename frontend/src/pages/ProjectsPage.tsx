import { type FormEvent, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  useCreateProject,
  useDeleteProject,
  useProjects,
} from '../features/projects/useProjects'
import type { ProjectListItem } from '../features/projects/types'

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
    : 'Something went wrong while loading projects.'
}

function sortProjectsByCreatedDate(projects: ProjectListItem[]) {
  return [...projects].sort((firstProject, secondProject) => {
    const firstCreatedAt = firstProject.createdAt
      ? new Date(firstProject.createdAt).getTime()
      : 0
    const secondCreatedAt = secondProject.createdAt
      ? new Date(secondProject.createdAt).getTime()
      : 0

    return (
      (Number.isNaN(secondCreatedAt) ? 0 : secondCreatedAt) -
      (Number.isNaN(firstCreatedAt) ? 0 : firstCreatedAt)
    )
  })
}

export function ProjectsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [projectName, setProjectName] = useState('')
  const [projectDescription, setProjectDescription] = useState('')
  const [projectIdPendingDelete, setProjectIdPendingDelete] = useState<
    string | null
  >(null)

  const projectsQuery = useProjects()
  const createProjectMutation = useCreateProject()
  const deleteProjectMutation = useDeleteProject()

  const sortedProjects = useMemo(
    () => sortProjectsByCreatedDate(projectsQuery.data ?? []),
    [projectsQuery.data],
  )

  const projectPendingDelete = sortedProjects.find(
    (project) => project.id === projectIdPendingDelete,
  )

  function openCreateModal() {
    createProjectMutation.reset()
    setProjectName('')
    setProjectDescription('')
    setIsCreateModalOpen(true)
  }

  function closeCreateModal() {
    if (createProjectMutation.isPending) {
      return
    }

    setIsCreateModalOpen(false)
    createProjectMutation.reset()
  }

  function handleCreateProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedName = projectName.trim()

    if (!trimmedName) {
      return
    }

    createProjectMutation.mutate(
      {
        name: trimmedName,
        description: projectDescription.trim() || undefined,
      },
      {
        onSuccess: () => {
          setIsCreateModalOpen(false)
          setProjectName('')
          setProjectDescription('')
        },
      },
    )
  }

  function confirmDeleteProject() {
    if (!projectIdPendingDelete) {
      return
    }

    deleteProjectMutation.mutate(projectIdPendingDelete, {
      onSuccess: () => setProjectIdPendingDelete(null),
    })
  }

  return (
    <main className="projects-page projects-page--top">
      <section className="projects-card" aria-labelledby="projects-title">
        <div className="projects-card__header">
          <div>
            <p className="projects-card__eyebrow">Workspace</p>
            <h1 id="projects-title">Projects</h1>
          </div>
          <button
            className="button button--primary"
            onClick={openCreateModal}
            type="button"
          >
            Create project
          </button>
        </div>

        {projectsQuery.isPending ? (
          <div className="projects-state" role="status">
            <p className="projects-state__title">Loading projects</p>
            <p className="projects-state__copy">
              Your workspace list is being prepared.
            </p>
          </div>
        ) : projectsQuery.isError ? (
          <div className="projects-state projects-state--error" role="alert">
            <p className="projects-state__title">Projects could not load</p>
            <p className="projects-state__copy">
              {getErrorMessage(projectsQuery.error)}
            </p>
            <button
              className="button button--secondary"
              onClick={() => projectsQuery.refetch()}
              type="button"
            >
              Retry
            </button>
          </div>
        ) : sortedProjects.length === 0 ? (
          <div className="projects-state">
            <p className="projects-state__title">No projects yet</p>
            <p className="projects-state__copy">
              Create a project to start organizing vault entries.
            </p>
            <button
              className="button button--secondary"
              onClick={openCreateModal}
              type="button"
            >
              Create your first project
            </button>
          </div>
        ) : (
          <ul className="project-list" aria-label="Projects">
            {sortedProjects.map((project) => (
              <li className="project-list__item" key={project.id}>
                <Link className="project-list__link" to={`/projects/${project.id}`}>
                  <span className="project-list__name">{project.name}</span>
                  <span className="project-list__meta">
                    Created {formatCreatedDate(project.createdAt)}
                  </span>
                </Link>
                <button
                  className="project-list__delete"
                  disabled={deleteProjectMutation.isPending}
                  onClick={() => {
                    deleteProjectMutation.reset()
                    setProjectIdPendingDelete(project.id)
                  }}
                  type="button"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {isCreateModalOpen ? (
        <div className="modal-backdrop" role="presentation">
          <div
            aria-labelledby="create-project-title"
            aria-modal="true"
            className="modal"
            role="dialog"
          >
            <div className="modal__header">
              <h2 id="create-project-title">Create project</h2>
              <button
                aria-label="Close create project"
                className="modal__close"
                disabled={createProjectMutation.isPending}
                onClick={closeCreateModal}
                type="button"
              >
                Close
              </button>
            </div>

            <form className="project-form" onSubmit={handleCreateProject}>
              <label className="project-form__field">
                Project name
                <input
                  autoFocus
                  disabled={createProjectMutation.isPending}
                  maxLength={120}
                  onChange={(event) => setProjectName(event.target.value)}
                  placeholder="Production secrets"
                  required
                  type="text"
                  value={projectName}
                />
              </label>

              <label className="project-form__field">
                Description
                <textarea
                  disabled={createProjectMutation.isPending}
                  maxLength={400}
                  onChange={(event) => setProjectDescription(event.target.value)}
                  placeholder="Optional context for this project"
                  rows={4}
                  value={projectDescription}
                />
              </label>

              {createProjectMutation.isError ? (
                <p className="project-form__error" role="alert">
                  {getErrorMessage(createProjectMutation.error)}
                </p>
              ) : null}

              <div className="project-form__actions">
                <button
                  className="button button--secondary"
                  disabled={createProjectMutation.isPending}
                  onClick={closeCreateModal}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className="button button--primary"
                  disabled={
                    createProjectMutation.isPending || !projectName.trim()
                  }
                  type="submit"
                >
                  {createProjectMutation.isPending ? 'Creating' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {projectPendingDelete ? (
        <div className="modal-backdrop" role="presentation">
          <div
            aria-labelledby="delete-project-title"
            aria-modal="true"
            className="modal modal--compact"
            role="dialog"
          >
            <h2 id="delete-project-title">Delete project</h2>
            <p className="modal__copy">
              Delete {projectPendingDelete.name}? This cannot be undone.
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
                onClick={() => {
                  deleteProjectMutation.reset()
                  setProjectIdPendingDelete(null)
                }}
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

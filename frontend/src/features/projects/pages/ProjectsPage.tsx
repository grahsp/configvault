import { type FormEvent, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ApiError } from '../../../api/apiClient'
import {
  useCreateProject,
  useDeleteProject,
  useProjects,
} from '../hooks/useProjects'
import type { ProjectListItem } from '../types'
import {
  getProjectNameValidationError,
  normalizeProjectName,
  PROJECT_NAME_MAX_LENGTH,
} from '../validation/projectValidation'
import styles from './ProjectsPage.module.css'

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
    : 'Something went wrong while loading projects.'
}

function getValidationMessage(error: unknown, fieldNames: string[]) {
  if (!(error instanceof ApiError) || error.kind !== 'validation') {
    return undefined
  }

  const matchingFieldName = Object.keys(error.validationErrors ?? {}).find(
    (fieldName) =>
      fieldNames.some(
        (expectedFieldName) =>
          fieldName.toLowerCase() === expectedFieldName.toLowerCase(),
      ),
  )

  if (!matchingFieldName) {
    return undefined
  }

  return error.validationErrors?.[matchingFieldName]?.[0]
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
  const navigate = useNavigate()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [projectName, setProjectName] = useState('')
  const [projectDescription, setProjectDescription] = useState('')
  const [projectIdPendingDelete, setProjectIdPendingDelete] = useState<
    string | null
  >(null)

  const projectsQuery = useProjects()
  const createProjectMutation = useCreateProject()
  const deleteProjectMutation = useDeleteProject()
  const projectNameValidationError = getProjectNameValidationError(projectName)
  const serverProjectNameError = getValidationMessage(
    createProjectMutation.error,
    ['name', 'project.name'],
  )
  const visibleProjectNameError =
    serverProjectNameError ??
    (projectName ? projectNameValidationError : undefined)

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

    const trimmedName = normalizeProjectName(projectName)

    if (getProjectNameValidationError(projectName)) {
      return
    }

    createProjectMutation.mutate(
      {
        name: trimmedName,
        description: projectDescription.trim() || undefined,
      },
      {
        onSuccess: (createdProject) => {
          setIsCreateModalOpen(false)
          setProjectName('')
          setProjectDescription('')
          navigate(`/projects/${createdProject.id}`)
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
    <main className={cx(styles.page, styles.pageTop)}>
      <section className={styles.card} aria-labelledby="projects-title">
        <div className={styles.cardHeader}>
          <div>
            <p className={styles.eyebrow}>Workspace</p>
            <h1 id="projects-title">Projects</h1>
          </div>
          <button
            className={cx(styles.button, styles.buttonPrimary)}
            onClick={openCreateModal}
            type="button"
          >
            Create project
          </button>
        </div>

        {projectsQuery.isPending ? (
          <div className={styles.state} role="status">
            <p className={styles.stateTitle}>Loading projects</p>
            <p className={styles.stateCopy}>
              Your workspace list is being prepared.
            </p>
          </div>
        ) : projectsQuery.isError ? (
          <div className={cx(styles.state, styles.stateError)} role="alert">
            <p className={styles.stateTitle}>Projects could not load</p>
            <p className={styles.stateCopy}>
              {getErrorMessage(projectsQuery.error)}
            </p>
            <button
              className={cx(styles.button, styles.buttonSecondary)}
              onClick={() => projectsQuery.refetch()}
              type="button"
            >
              Retry
            </button>
          </div>
        ) : sortedProjects.length === 0 ? (
          <div className={styles.state}>
            <p className={styles.stateTitle}>No projects yet</p>
            <p className={styles.stateCopy}>
              Create a project to start organizing vault entries.
            </p>
            <button
              className={cx(styles.button, styles.buttonSecondary)}
              onClick={openCreateModal}
              type="button"
            >
              Create your first project
            </button>
          </div>
        ) : (
          <ul className={styles.projectList} aria-label="Projects">
            {sortedProjects.map((project) => (
              <li className={styles.projectListItem} key={project.id}>
                <Link
                  className={styles.projectListLink}
                  to={`/projects/${project.id}`}
                >
                  <span className={styles.projectListName}>{project.name}</span>
                  <span className={styles.projectListMeta}>
                    Created {formatCreatedDate(project.createdAt)}
                  </span>
                </Link>
                <button
                  className={styles.projectListDelete}
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
        <div className={styles.modalBackdrop} role="presentation">
          <div
            aria-labelledby="create-project-title"
            aria-modal="true"
            className={styles.modal}
            role="dialog"
          >
            <div className={styles.modalHeader}>
              <h2 id="create-project-title">Create project</h2>
              <button
                aria-label="Close create project"
                className={styles.modalClose}
                disabled={createProjectMutation.isPending}
                onClick={closeCreateModal}
                type="button"
              >
                Close
              </button>
            </div>

            <form className={styles.projectForm} onSubmit={handleCreateProject}>
              <label className={styles.projectFormField}>
                Project name
                <input
                  autoFocus
                  aria-describedby={
                    visibleProjectNameError ? 'project-name-error' : undefined
                  }
                  aria-invalid={Boolean(visibleProjectNameError)}
                  disabled={createProjectMutation.isPending}
                  maxLength={PROJECT_NAME_MAX_LENGTH}
                  onChange={(event) => setProjectName(event.target.value)}
                  placeholder="Production secrets"
                  required
                  type="text"
                  value={projectName}
                />
              </label>

              <label className={styles.projectFormField}>
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
                <p
                  className={styles.projectFormError}
                  id={visibleProjectNameError ? 'project-name-error' : undefined}
                  role="alert"
                >
                  {serverProjectNameError ??
                    getErrorMessage(createProjectMutation.error)}
                </p>
              ) : projectNameValidationError && projectName ? (
                <p
                  className={styles.projectFormError}
                  id="project-name-error"
                  role="alert"
                >
                  {projectNameValidationError}
                </p>
              ) : null}

              <div className={styles.projectFormActions}>
                <button
                  className={cx(styles.button, styles.buttonSecondary)}
                  disabled={createProjectMutation.isPending}
                  onClick={closeCreateModal}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className={cx(styles.button, styles.buttonPrimary)}
                  disabled={
                    createProjectMutation.isPending ||
                    Boolean(projectNameValidationError)
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
        <div className={styles.modalBackdrop} role="presentation">
          <div
            aria-labelledby="delete-project-title"
            aria-modal="true"
            className={cx(styles.modal, styles.modalCompact)}
            role="dialog"
          >
            <h2 id="delete-project-title">Delete project</h2>
            <p className={styles.modalCopy}>
              Delete {projectPendingDelete.name}? This cannot be undone.
            </p>

            {deleteProjectMutation.isError ? (
              <p className={styles.projectFormError} role="alert">
                {getErrorMessage(deleteProjectMutation.error)}
              </p>
            ) : null}

            <div className={styles.projectFormActions}>
              <button
                className={cx(styles.button, styles.buttonSecondary)}
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

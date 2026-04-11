import { type FormEvent, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { cx } from '../../../../shared/utils/cx'
import { ProjectDeleteDialog } from '../../components/ProjectDeleteDialog'
import {
  useCreateProject,
  useDeleteProject,
  useProjects,
} from '../../hooks/useProjects'
import {
  getProjectNameValidationError,
  normalizeProjectName,
} from '../../validation/projectValidation'
import { sortProjectsByCreatedDate } from '../projectPageUtils'
import { ProjectCreateModal } from './ProjectCreateModal'
import { ProjectsContent } from './ProjectsContent'
import styles from './ProjectsPage.module.css'

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

        <ProjectsContent
          error={projectsQuery.error}
          isDeletePending={deleteProjectMutation.isPending}
          isError={projectsQuery.isError}
          isPending={projectsQuery.isPending}
          onCreateProject={openCreateModal}
          onRetry={() => projectsQuery.refetch()}
          onSelectProjectForDelete={(projectId) => {
            deleteProjectMutation.reset()
            setProjectIdPendingDelete(projectId)
          }}
          projects={sortedProjects}
        />
      </section>

      {isCreateModalOpen ? (
        <ProjectCreateModal
          mutation={createProjectMutation}
          onClose={closeCreateModal}
          onProjectDescriptionChange={setProjectDescription}
          onProjectNameChange={setProjectName}
          onSubmit={handleCreateProject}
          projectDescription={projectDescription}
          projectName={projectName}
        />
      ) : null}

      {projectPendingDelete ? (
        <ProjectDeleteDialog
          mutation={deleteProjectMutation}
          onCancel={() => {
            deleteProjectMutation.reset()
            setProjectIdPendingDelete(null)
          }}
          onConfirm={confirmDeleteProject}
          projectName={projectPendingDelete.name}
        />
      ) : null}
    </main>
  )
}

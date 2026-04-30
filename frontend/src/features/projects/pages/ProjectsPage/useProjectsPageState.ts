import { type FormEvent, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  useCreateProject,
  useDeleteProject,
  useProjects,
} from '../../application'
import {
  getProjectNameValidationError,
  normalizeProjectName,
  sortProjectsByCreatedDate,
} from '../../domain'

export function useProjectsPageState() {
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

  function openDeleteDialog(projectId: string) {
    deleteProjectMutation.reset()
    setProjectIdPendingDelete(projectId)
  }

  function closeDeleteDialog() {
    deleteProjectMutation.reset()
    setProjectIdPendingDelete(null)
  }

  function confirmDeleteProject() {
    if (!projectIdPendingDelete) {
      return
    }

    deleteProjectMutation.mutate(projectIdPendingDelete, {
      onSuccess: () => setProjectIdPendingDelete(null),
    })
  }

  return {
    createProject: {
      isOpen: isCreateModalOpen,
      mutation: createProjectMutation,
      onClose: closeCreateModal,
      onProjectDescriptionChange: setProjectDescription,
      onProjectNameChange: setProjectName,
      onSubmit: handleCreateProject,
      open: openCreateModal,
      projectDescription,
      projectName,
    },
    deleteProject: {
      mutation: deleteProjectMutation,
      onCancel: closeDeleteDialog,
      onConfirm: confirmDeleteProject,
      onSelect: openDeleteDialog,
      pendingProject: projectPendingDelete,
    },
    projects: {
      query: projectsQuery,
      sortedProjects,
    },
  }
}

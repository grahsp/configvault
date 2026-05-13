import { type FormEvent, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCreateProject, useProjects } from '../../application'
import {
  getProjectNameValidationError,
  normalizeProjectName,
  sortProjects,
  type ProjectSortDirection,
  type ProjectSortField,
} from '../../domain'

export function useProjectsPageState() {
  const navigate = useNavigate()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [projectName, setProjectName] = useState('')
  const [projectDescription, setProjectDescription] = useState('')
  const [sortField, setSortField] = useState<ProjectSortField>('createdAt')
  const [sortDirection, setSortDirection] = useState<ProjectSortDirection>('desc')

  const projectsQuery = useProjects()
  const createProjectMutation = useCreateProject()

  const sortedProjects = useMemo(
    () =>
      sortProjects(projectsQuery.data ?? [], {
        direction: sortDirection,
        field: sortField,
      }),
    [projectsQuery.data, sortDirection, sortField],
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
    projects: {
      query: projectsQuery,
      sortedProjects,
      sort: {
        direction: sortDirection,
        field: sortField,
        setDirection: setSortDirection,
        setField: setSortField,
      },
    },
  }
}

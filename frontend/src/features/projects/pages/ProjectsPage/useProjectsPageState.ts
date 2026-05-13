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
  const [searchTerm, setSearchTerm] = useState('')
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
  const normalizedSearchTerm = searchTerm.trim().toLocaleLowerCase()
  const filteredProjects = useMemo(() => {
    if (!normalizedSearchTerm) {
      return sortedProjects
    }

    return sortedProjects.filter((project) => {
      const searchableText = [project.name, project.description]
        .filter(Boolean)
        .join(' ')
        .toLocaleLowerCase()

      return searchableText.includes(normalizedSearchTerm)
    })
  }, [normalizedSearchTerm, sortedProjects])

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
      filteredProjects,
      query: projectsQuery,
      search: {
        setTerm: setSearchTerm,
        term: searchTerm,
      },
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

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthenticatedApiClient } from '../../../shared/api/useAuthenticatedApiClient.ts'
import { createProject, deleteProject } from '../api'
import type {
  CreateProjectRequest,
  CreateProjectResponse,
  ProjectDetails,
} from '../domain'
import { projectQueryKeys } from './projectQueryKeys.ts'

function isProjectDetails(
  project: CreateProjectResponse,
): project is ProjectDetails {
  return Boolean(project.name)
}

export function useCreateProject() {
  const client = useAuthenticatedApiClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (project: CreateProjectRequest) => createProject(client, project),
    onSuccess: (createdProject) => {
      if (isProjectDetails(createdProject)) {
        queryClient.setQueryData(
          projectQueryKeys.detail(createdProject.id),
          createdProject,
        )
      }

      return queryClient.invalidateQueries({
        queryKey: projectQueryKeys.lists(),
      })
    },
  })
}

export function useDeleteProject() {
  const client = useAuthenticatedApiClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (projectId: string) => deleteProject(client, projectId),
    onSuccess: (_data, projectId) =>
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: projectQueryKeys.lists(),
        }),
        queryClient.invalidateQueries({
          queryKey: projectQueryKeys.detail(projectId),
        }),
      ]),
  })
}

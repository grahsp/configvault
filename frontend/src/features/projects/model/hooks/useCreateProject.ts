import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthenticatedApiClient } from '../../../../shared/api/useAuthenticatedApiClient.ts'
import { createProject } from '../../api'
import { projectQueryKeys } from '../projectQueryKeys.ts'
import type {
  CreateProjectRequest,
  CreateProjectResponse,
  ProjectDetails,
} from '../types.ts'

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

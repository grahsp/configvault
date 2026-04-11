import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createApiClient } from '../../../api/apiClient'
import { useAuth } from '../../auth/hooks/useAuth'
import type {
  CreateProjectRequest,
  CreateProjectResponse,
  ProjectDetails,
} from '../types'
import {
  createProject,
  deleteProject,
  getProject,
  listProjects,
} from '../api/projectApi'
import { projectQueryKeys } from './projectQueryKeys'

function isProjectDetails(
  project: CreateProjectResponse,
): project is ProjectDetails {
  return Boolean(project.name)
}

function useAuthenticatedProjectClient() {
  const { getAccessTokenSilently } = useAuth()

  return useMemo(
    () => createApiClient({ getAccessTokenSilently }),
    [getAccessTokenSilently],
  )
}

export function useProjects() {
  const client = useAuthenticatedProjectClient()

  return useQuery({
    queryKey: projectQueryKeys.list(),
    queryFn: () => listProjects(client),
  })
}

export function useProject(projectId: string) {
  const client = useAuthenticatedProjectClient()

  return useQuery({
    queryKey: projectQueryKeys.detail(projectId),
    queryFn: () => getProject(client, projectId),
    enabled: Boolean(projectId),
  })
}

export function useCreateProject() {
  const client = useAuthenticatedProjectClient()
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
  const client = useAuthenticatedProjectClient()
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

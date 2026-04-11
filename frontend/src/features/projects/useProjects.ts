import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createApiClient } from '../../api/apiClient'
import { useAuth } from '../../auth/useAuth'
import type { CreateProjectRequest } from './types'
import {
  createProject,
  deleteProject,
  getProject,
  listProjects,
  projectQueryKeys,
} from './projectApi'

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
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: projectQueryKeys.lists(),
      }),
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

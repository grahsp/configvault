import type { ApiClient } from '../../../api/apiClient'
import type {
  CreateProjectRequest,
  CreateProjectResponse,
  ProjectDetails,
  ProjectListItem,
} from '../types'

export const projectQueryKeys = {
  all: ['projects'] as const,
  lists: () => [...projectQueryKeys.all, 'list'] as const,
  list: () => [...projectQueryKeys.lists()] as const,
  details: () => [...projectQueryKeys.all, 'detail'] as const,
  detail: (projectId: string) =>
    [...projectQueryKeys.details(), projectId] as const,
}

export function listProjects(client: ApiClient) {
  return client.request<ProjectListItem[]>('/projects')
}

export function getProject(client: ApiClient, projectId: string) {
  return client.request<ProjectDetails>(
    `/projects/${encodeURIComponent(projectId)}`,
  )
}

export function createProject(
  client: ApiClient,
  project: CreateProjectRequest,
) {
  return client.request<CreateProjectResponse>('/projects', {
    method: 'POST',
    body: JSON.stringify(project),
  })
}

export function deleteProject(client: ApiClient, projectId: string) {
  return client.request<void>(`/projects/${encodeURIComponent(projectId)}`, {
    method: 'DELETE',
  })
}

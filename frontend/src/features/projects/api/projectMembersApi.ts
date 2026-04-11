import type { ApiClient } from '../../../api/apiClient'
import type { ProjectMember, ProjectRole } from '../types'

function buildProjectMembersPath(projectId: string) {
  return `/projects/${encodeURIComponent(projectId)}/members`
}

function buildProjectMemberPath(projectId: string, userId: string) {
  return `${buildProjectMembersPath(projectId)}/${encodeURIComponent(userId)}`
}

export function getMembers(client: ApiClient, projectId: string) {
  return client.request<ProjectMember[]>(buildProjectMembersPath(projectId))
}

export function addMember(
  client: ApiClient,
  projectId: string,
  userId: string,
) {
  return client.request<void>(buildProjectMembersPath(projectId), {
    method: 'POST',
    body: JSON.stringify({ role: 'member', userId }),
  })
}

export function setRole(
  client: ApiClient,
  projectId: string,
  userId: string,
  role: ProjectRole,
) {
  return client.request<void>(buildProjectMemberPath(projectId, userId), {
    method: 'PUT',
    body: JSON.stringify({ role }),
  })
}

export function removeMember(
  client: ApiClient,
  projectId: string,
  userId: string,
) {
  return client.request<void>(buildProjectMemberPath(projectId, userId), {
    method: 'DELETE',
  })
}

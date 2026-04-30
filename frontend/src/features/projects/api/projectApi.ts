import type { ApiClient } from '../../../api/apiClient'
import type { ProjectRole } from '../members'
import type {
  CreateProjectRequest,
  CreateProjectResponse,
  ProjectDetails,
  ProjectListItem,
} from '../model'

export function listProjects(client: ApiClient) {
  return client.request<ProjectListItem[]>('/projects')
}

interface ProjectDetailsResponse extends Omit<ProjectDetails, 'role' | 'currentUserRole'> {
  role?: string
  currentUserRole?: string
}

const projectRoles = new Set<ProjectRole>(['owner', 'admin', 'member'])

function normalizeProjectRole(role: string | undefined): ProjectRole | undefined {
  const normalizedRole = role?.toLowerCase()

  return normalizedRole && projectRoles.has(normalizedRole as ProjectRole)
    ? (normalizedRole as ProjectRole)
    : undefined
}

function normalizeProjectDetails(project: ProjectDetailsResponse): ProjectDetails {
  return {
    ...project,
    role: normalizeProjectRole(project.role),
    currentUserRole: normalizeProjectRole(project.currentUserRole),
  }
}

export async function getProject(client: ApiClient, projectId: string) {
  const project = await client.request<ProjectDetailsResponse>(
    `/projects/${encodeURIComponent(projectId)}`,
  )

  return normalizeProjectDetails(project)
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

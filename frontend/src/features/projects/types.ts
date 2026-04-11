export interface ProjectListItem {
  id: string
  name: string
  description?: string
  createdAt?: string
  updatedAt?: string
}

export interface ProjectDetails {
  id: string
  name: string
  role?: ProjectAccessRole
  currentUserRole?: ProjectAccessRole
  description?: string
  createdAt?: string
  updatedAt?: string
}

export interface CreateProjectRequest {
  name: string
  description?: string
}

export interface CreateProjectResponse {
  id: string
  name?: string
  description?: string
  createdAt?: string
  updatedAt?: string
}

export type ProjectRole = 'owner' | 'admin' | 'member'
export type ProjectAccessRole =
  | ProjectRole
  | 'Owner'
  | 'Admin'
  | 'Member'
  | 'OWNER'
  | 'ADMIN'
  | 'MEMBER'

export interface ProjectMember {
  userId: string
  displayName?: string | null
  role: ProjectRole
  isCurrentUser: boolean
}

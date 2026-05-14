import type { ProjectRole } from '../members'

export interface ProjectListItem {
  id: string
  name: string
  description?: string
  createdAt?: string
  updatedAt?: string
}

export interface ProjectDetails {
  defaultEnvironmentId?: string
  id: string
  name: string
  role?: ProjectRole
  currentUserRole?: ProjectRole
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

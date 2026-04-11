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
}

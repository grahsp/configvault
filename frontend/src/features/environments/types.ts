export interface Environment {
  id: string
  environmentName: string
}

export interface EnvironmentResponse {
  id: string
  environmentName: string
}

export interface CreateEnvironmentRequest {
  environmentName: string
}

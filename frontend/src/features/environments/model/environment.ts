export interface Environment {
  id: string
  environmentName: string
}

export interface EnvironmentDto {
  id: string
  environmentName: string
}

export interface CreateEnvironmentRequest {
  environmentName: string
}

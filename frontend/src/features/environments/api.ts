import type { ApiClient } from '../../api/apiClient'
import type {
  CreateEnvironmentRequest,
  Environment,
  EnvironmentResponse,
} from './types'

function buildEnvironmentsPath(projectId: string) {
  return `/projects/${encodeURIComponent(projectId)}/environments`
}

function buildEnvironmentPath(projectId: string, environmentId: string) {
  return `${buildEnvironmentsPath(projectId)}/${encodeURIComponent(environmentId)}`
}

function mapEnvironment(response: EnvironmentResponse): Environment {
  return {
    id: response.id,
    environmentName: response.environmentName,
  }
}

export async function getEnvironments(client: ApiClient, projectId: string) {
  const environments = await client.request<EnvironmentResponse[]>(
    buildEnvironmentsPath(projectId),
  )

  return environments.map(mapEnvironment)
}

export async function createEnvironment(
  client: ApiClient,
  projectId: string,
  environmentName: string,
) {
  const request: CreateEnvironmentRequest = {
    environmentName: environmentName.trim(),
  }

  const environment = await client.request<EnvironmentResponse>(
    buildEnvironmentsPath(projectId),
    {
      method: 'POST',
      body: JSON.stringify(request),
    },
  )

  return mapEnvironment(environment)
}

export function deleteEnvironment(
  client: ApiClient,
  projectId: string,
  environmentId: string,
) {
  return client.request<void>(buildEnvironmentPath(projectId, environmentId), {
    method: 'DELETE',
  })
}

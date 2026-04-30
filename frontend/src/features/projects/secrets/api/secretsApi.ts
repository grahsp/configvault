import type { ApiClient } from '../../../../api/apiClient.ts'
import type { Secret, SecretValue } from '../domain'

export interface CreateSecretOperation {
  type: 'create'
  key: string
  initialValue?: string
}

export interface RenameSecretOperation {
  type: 'rename'
  secretId: string
  key: string
}

export interface SetSecretValueOperation {
  type: 'set-value'
  secretId: string
  value: string
}

export interface DeleteSecretOperation {
  type: 'delete'
  secretId: string
}

export type SecretBatchOperation =
  | CreateSecretOperation
  | RenameSecretOperation
  | SetSecretValueOperation
  | DeleteSecretOperation

function buildConfigItemsPath(projectId: string) {
  return `/projects/${encodeURIComponent(projectId)}/config-items`
}

function buildSecretOperationsPath(projectId: string) {
  return `${buildConfigItemsPath(projectId)}/operations`
}

function buildSecretPath(projectId: string, secretId: string) {
  return `${buildConfigItemsPath(projectId)}/${encodeURIComponent(secretId)}`
}

function buildEnvironmentSearch(environmentName: string) {
  return `environment=${encodeURIComponent(environmentName)}`
}

function buildExportConfigItemsPath(projectId: string, environmentName: string) {
  return `/projects/${encodeURIComponent(projectId)}/export?${buildEnvironmentSearch(
    environmentName,
  )}`
}

function buildImportConfigItemsPath(projectId: string, environmentName: string) {
  return `/projects/${encodeURIComponent(projectId)}/import?${buildEnvironmentSearch(
    environmentName,
  )}`
}

function buildSecretValuePath(
  projectId: string,
  secretId: string,
  environmentName: string,
) {
  return `${buildSecretPath(
    projectId,
    secretId,
  )}/value?${buildEnvironmentSearch(environmentName)}`
}

export function getSecrets(
  client: ApiClient,
  projectId: string,
  environmentName: string,
) {
  return client.request<Secret[]>(
    `${buildConfigItemsPath(projectId)}?${buildEnvironmentSearch(
      environmentName,
    )}`,
  )
}

export function exportSecrets(
  client: ApiClient,
  projectId: string,
  environmentName: string,
) {
  return client.requestText(
    buildExportConfigItemsPath(projectId, environmentName),
  )
}

export function importSecrets(
  client: ApiClient,
  projectId: string,
  environmentName: string,
  content: string,
) {
  return client.request<void>(
    buildImportConfigItemsPath(projectId, environmentName),
    {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: content,
    },
  )
}

export function createSecret(
  client: ApiClient,
  projectId: string,
  key: string,
) {
  return client.request<void>(buildConfigItemsPath(projectId), {
    method: 'POST',
    body: JSON.stringify({ key }),
  })
}

export function saveSecrets(
  client: ApiClient,
  projectId: string,
  environmentName: string,
  operations: SecretBatchOperation[],
) {
  return client.request<void>(buildSecretOperationsPath(projectId), {
    method: 'POST',
    body: JSON.stringify({
      environment: environmentName,
      operations,
    }),
  })
}

export function renameSecret(
  client: ApiClient,
  projectId: string,
  secretId: string,
  key: string,
) {
  return client.request<void>(buildSecretPath(projectId, secretId), {
    method: 'PATCH',
    body: JSON.stringify({ key }),
  })
}

export function deleteSecret(
  client: ApiClient,
  projectId: string,
  secretId: string,
) {
  return client.request<void>(buildSecretPath(projectId, secretId), {
    method: 'DELETE',
  })
}

export function getSecretValue(
  client: ApiClient,
  projectId: string,
  secretId: string,
  environmentName: string,
) {
  return client.request<SecretValue>(
    buildSecretValuePath(projectId, secretId, environmentName),
  )
}

export function upsertSecretValue(
  client: ApiClient,
  projectId: string,
  secretId: string,
  environmentName: string,
  value: string,
) {
  return client.request<void>(
    buildSecretValuePath(projectId, secretId, environmentName),
    {
      method: 'PUT',
      body: JSON.stringify({ value }),
    },
  )
}

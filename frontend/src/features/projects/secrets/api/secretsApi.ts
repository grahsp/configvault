import type { ApiClient } from '../../../../api/apiClient.ts'
import type {
  Secret,
  SecretValue,
  SecretValueRevision,
  SecretValueRevisionSummary,
} from '../domain'

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

function buildSecretsPath(projectId: string) {
  return `/projects/${encodeURIComponent(projectId)}/secrets`
}

function buildSecretOperationsPath(projectId: string) {
  return `${buildSecretsPath(projectId)}/operations`
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
  return `${buildSecretsPath(projectId)}/${encodeURIComponent(
    secretId,
  )}/value?${buildEnvironmentSearch(environmentName)}`
}

function buildSecretValueRevisionsPath(
  projectId: string,
  secretId: string,
  environmentName: string,
) {
  return `${buildSecretsPath(projectId)}/${encodeURIComponent(
    secretId,
  )}/value/revisions?${buildEnvironmentSearch(environmentName)}`
}

function buildSecretValueRevisionPath(
  projectId: string,
  secretId: string,
  environmentName: string,
  revision: number,
) {
  return `${buildSecretsPath(projectId)}/${encodeURIComponent(
    secretId,
  )}/value/revisions/${revision}?${buildEnvironmentSearch(environmentName)}`
}

export function getSecrets(
  client: ApiClient,
  projectId: string,
  environmentName: string,
) {
  return client.request<Secret[]>(
    `${buildSecretsPath(projectId)}?${buildEnvironmentSearch(
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

export function getSecretValueRevisions(
  client: ApiClient,
  projectId: string,
  secretId: string,
  environmentName: string,
) {
  return client.request<SecretValueRevisionSummary[]>(
    buildSecretValueRevisionsPath(projectId, secretId, environmentName),
  )
}

export function getSecretValueRevision(
  client: ApiClient,
  projectId: string,
  secretId: string,
  environmentName: string,
  revision: number,
) {
  return client.request<SecretValueRevision>(
    buildSecretValueRevisionPath(
      projectId,
      secretId,
      environmentName,
      revision,
    ),
  )
}

export function upsertSecretValue(
  client: ApiClient,
  projectId: string,
  secretId: string,
  environmentName: string,
  value: string,
) {
  return saveSecrets(client, projectId, environmentName, [
    {
      type: 'set-value',
      secretId,
      value,
    },
  ])
}

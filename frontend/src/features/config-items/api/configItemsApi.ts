import type { ApiClient } from '../../../api/apiClient'
import type { ConfigItem, ConfigItemValue } from '../model/configItem.types'

export interface CreateConfigItemOperation {
  type: 'create'
  key: string
  initialValue?: string
}

export interface RenameConfigItemOperation {
  type: 'rename'
  configItemId: string
  key: string
}

export interface SetConfigItemValueOperation {
  type: 'set-value'
  configItemId: string
  value: string
}

export interface DeleteConfigItemOperation {
  type: 'delete'
  configItemId: string
}

export type ConfigItemBatchOperation =
  | CreateConfigItemOperation
  | RenameConfigItemOperation
  | SetConfigItemValueOperation
  | DeleteConfigItemOperation

function buildConfigItemsPath(projectId: string) {
  return `/projects/${encodeURIComponent(projectId)}/config-items`
}

function buildConfigItemOperationsPath(projectId: string) {
  return `${buildConfigItemsPath(projectId)}/operations`
}

function buildConfigItemPath(projectId: string, configItemId: string) {
  return `${buildConfigItemsPath(projectId)}/${encodeURIComponent(configItemId)}`
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

function buildConfigItemValuePath(
  projectId: string,
  configItemId: string,
  environmentName: string,
) {
  return `${buildConfigItemPath(
    projectId,
    configItemId,
  )}/value?${buildEnvironmentSearch(environmentName)}`
}

export function getConfigItems(
  client: ApiClient,
  projectId: string,
  environmentName: string,
) {
  return client.request<ConfigItem[]>(
    `${buildConfigItemsPath(projectId)}?${buildEnvironmentSearch(
      environmentName,
    )}`,
  )
}

export function exportConfigItems(
  client: ApiClient,
  projectId: string,
  environmentName: string,
) {
  return client.requestText(
    buildExportConfigItemsPath(projectId, environmentName),
  )
}

export function importConfigItems(
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

export function createConfigItem(
  client: ApiClient,
  projectId: string,
  key: string,
) {
  return client.request<void>(buildConfigItemsPath(projectId), {
    method: 'POST',
    body: JSON.stringify({ key }),
  })
}

export function saveConfigItems(
  client: ApiClient,
  projectId: string,
  environmentName: string,
  operations: ConfigItemBatchOperation[],
) {
  return client.request<void>(buildConfigItemOperationsPath(projectId), {
    method: 'POST',
    body: JSON.stringify({
      environment: environmentName,
      operations,
    }),
  })
}

export function renameConfigItem(
  client: ApiClient,
  projectId: string,
  configItemId: string,
  key: string,
) {
  return client.request<void>(buildConfigItemPath(projectId, configItemId), {
    method: 'PATCH',
    body: JSON.stringify({ key }),
  })
}

export function deleteConfigItem(
  client: ApiClient,
  projectId: string,
  configItemId: string,
) {
  return client.request<void>(buildConfigItemPath(projectId, configItemId), {
    method: 'DELETE',
  })
}

export function getConfigItemValue(
  client: ApiClient,
  projectId: string,
  configItemId: string,
  environmentName: string,
) {
  return client.request<ConfigItemValue>(
    buildConfigItemValuePath(projectId, configItemId, environmentName),
  )
}

export function upsertConfigItemValue(
  client: ApiClient,
  projectId: string,
  configItemId: string,
  environmentName: string,
  value: string,
) {
  return client.request<void>(
    buildConfigItemValuePath(projectId, configItemId, environmentName),
    {
      method: 'PUT',
      body: JSON.stringify({ value }),
    },
  )
}

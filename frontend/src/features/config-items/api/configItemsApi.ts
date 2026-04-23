import type { ApiClient } from '../../../api/apiClient'
import type { ConfigItem, ConfigItemValue } from '../types/ConfigItem'

interface SaveConfigItemsUpdate {
  configItemId: string
  key?: string
  value?: string
}

function buildConfigItemsPath(projectId: string) {
  return `/projects/${encodeURIComponent(projectId)}/config-items`
}

function buildConfigItemPath(projectId: string, configItemId: string) {
  return `${buildConfigItemsPath(projectId)}/${encodeURIComponent(configItemId)}`
}

function buildEnvironmentSearch(environmentName: string) {
  return `environment=${encodeURIComponent(environmentName)}`
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
  updates: SaveConfigItemsUpdate[],
  deleteConfigItemIds: string[],
) {
  return client.request<void>(buildConfigItemsPath(projectId), {
    method: 'PUT',
    body: JSON.stringify({
      environment: environmentName,
      updates,
      deleteConfigItemIds,
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

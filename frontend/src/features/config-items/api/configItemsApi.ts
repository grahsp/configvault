import type { ApiClient } from '../../../api/apiClient'
import type { ConfigItem } from '../types/ConfigItem'

function buildConfigItemsPath(projectId: string) {
  return `/projects/${encodeURIComponent(projectId)}/config-items`
}

function buildConfigItemPath(projectId: string, configItemId: string) {
  return `${buildConfigItemsPath(projectId)}/${encodeURIComponent(configItemId)}`
}

export function getConfigItems(client: ApiClient, projectId: string) {
  return client.request<ConfigItem[]>(buildConfigItemsPath(projectId))
}

export function createConfigItem(
  client: ApiClient,
  projectId: string,
  key: string,
) {
  return client.request<ConfigItem>(buildConfigItemsPath(projectId), {
    method: 'POST',
    body: JSON.stringify({ key }),
  })
}

export function renameConfigItem(
  client: ApiClient,
  projectId: string,
  configItemId: string,
  key: string,
) {
  return client.request<ConfigItem>(
    buildConfigItemPath(projectId, configItemId),
    {
      method: 'PUT',
      body: JSON.stringify({ key }),
    },
  )
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

import type { ApiClient } from '../../../../api/apiClient.ts'

interface CreateInvitationResponse {
  token: string
}

interface AcceptInvitationResponse {
  projectId: string
}

function buildInvitationsPath(projectId: string) {
  return `/projects/${encodeURIComponent(projectId)}/invitations`
}

function buildAcceptInvitationPath(token: string) {
  return `/invitations/accept/${encodeURIComponent(token)}`
}

export function createInvitation(client: ApiClient, projectId: string) {
  return client.request<CreateInvitationResponse>(buildInvitationsPath(projectId), {
    method: 'POST',
  })
}

export function acceptInvitation(
  client: ApiClient,
  token: string,
) {
  return client.request<AcceptInvitationResponse>(buildAcceptInvitationPath(token))
}

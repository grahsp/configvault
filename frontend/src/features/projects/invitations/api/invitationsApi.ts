import type { ApiClient } from '../../../../api/apiClient.ts'
import type { ActiveInvitation } from '../domain'

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

function buildRevokeInvitationPath(projectId: string, invitationId: string) {
  return `${buildInvitationsPath(projectId)}/revoke/${encodeURIComponent(invitationId)}`
}

export function getActiveInvitations(client: ApiClient, projectId: string) {
  return client.request<ActiveInvitation[]>(buildInvitationsPath(projectId))
}

export function createInvitation(client: ApiClient, projectId: string) {
  return client.request<CreateInvitationResponse>(buildInvitationsPath(projectId), {
    method: 'POST',
  })
}

export function revokeInvitation(
  client: ApiClient,
  projectId: string,
  invitationId: string,
) {
  return client.request<void>(buildRevokeInvitationPath(projectId, invitationId), {
    method: 'POST',
  })
}

export function acceptInvitation(
  client: ApiClient,
  token: string,
) {
  return client.request<AcceptInvitationResponse>(buildAcceptInvitationPath(token))
}

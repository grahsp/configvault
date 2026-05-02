import { useQuery } from '@tanstack/react-query'
import { projectQueryKeys } from '../../application'
import { useAuthenticatedApiClient } from '../../../../shared/api/useAuthenticatedApiClient.ts'
import { getActiveInvitations } from '../api/invitationsApi.ts'

export function useActiveInvitations(projectId: string, enabled = true) {
  const client = useAuthenticatedApiClient()

  return useQuery({
    queryKey: projectQueryKeys.invitations(projectId),
    queryFn: () => getActiveInvitations(client, projectId),
    enabled: enabled && Boolean(projectId),
  })
}

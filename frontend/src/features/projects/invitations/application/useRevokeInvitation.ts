import { useMutation, useQueryClient } from '@tanstack/react-query'
import { projectQueryKeys } from '../../application'
import { useAuthenticatedApiClient } from '../../../../shared/api/useAuthenticatedApiClient.ts'
import { revokeInvitation } from '../api/invitationsApi.ts'

export function useRevokeInvitation(projectId: string) {
  const client = useAuthenticatedApiClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (invitationId: string) =>
      revokeInvitation(client, projectId, invitationId),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: projectQueryKeys.invitations(projectId),
      }),
  })
}

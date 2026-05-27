import { useMutation, useQueryClient } from '@tanstack/react-query'
import { projectQueryKeys } from '../../application'
import { useAuthenticatedApiClient } from '@/features/auth/api'
import { createInvitation } from '../api/invitationsApi.ts'

export function useCreateInvitation(projectId: string) {
  const client = useAuthenticatedApiClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => createInvitation(client, projectId),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: projectQueryKeys.invitations(projectId),
      }),
  })
}
